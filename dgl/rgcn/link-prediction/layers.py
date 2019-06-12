import torch
import torch.nn as nn
import dgl.function as fn


class RGCNLayer(nn.Module):
    def __init__(self, in_feat, out_feat, bias=None, activation=None,
                 self_loop=False, dropout=0.0):
        super(RGCNLayer, self).__init__()
        self.bias = bias
        self.activation = activation
        self.self_loop = self_loop

        if self.bias == True:
            self.bias = nn.Parameter(torch.Tensor(out_feat))
            nn.init.xavier_uniform_(self.bias,
                                    gain=nn.init.calculate_gain('relu'))

        # weight for self loop
        if self.self_loop:
            self.loop_weight = nn.Parameter(torch.Tensor(in_feat, out_feat))
            nn.init.xavier_uniform_(self.loop_weight,
                                    gain=nn.init.calculate_gain('relu'))

        if dropout:
            self.dropout = nn.Dropout(dropout)
        else:
            self.dropout = None

    # define how propagation is done in subclass
    def propagate(self, g):
        raise NotImplementedError

    def forward(self, g):
        if self.self_loop:
            loop_message = torch.mm(g.ndata['h'], self.loop_weight)
            if self.dropout is not None:
                loop_message = self.dropout(loop_message)

        self.propagate(g)

        # apply bias and activation
        node_repr = g.ndata['h']
        if self.bias:
            node_repr = node_repr + self.bias
        if self.self_loop:
            node_repr = node_repr + loop_message
        if self.activation:
            node_repr = self.activation(node_repr)

        g.ndata['h'] = node_repr


# Currently, this implementation of the layer using the basis regularization is not used
class RGCNBasisLayer(RGCNLayer):
    def __init__(self, in_feat, out_feat, num_rels, num_bases=-1, bias=None,
                 activation=None, is_input_layer=False):
        super(RGCNBasisLayer, self).__init__(
            in_feat, out_feat, bias, activation)
        self.in_feat = in_feat
        self.out_feat = out_feat
        self.num_rels = num_rels
        self.num_bases = num_bases
        self.is_input_layer = is_input_layer
        if self.num_bases <= 0 or self.num_bases > self.num_rels:
            self.num_bases = self.num_rels

        # add basis weights
        self.weight = nn.Parameter(torch.Tensor(self.num_bases, self.in_feat,
                                                self.out_feat))
        if self.num_bases < self.num_rels:
            # linear combination coefficients
            self.w_comp = nn.Parameter(torch.Tensor(self.num_rels,
                                                    self.num_bases))
        nn.init.xavier_uniform_(
            self.weight, gain=nn.init.calculate_gain('relu'))
        if self.num_bases < self.num_rels:
            nn.init.xavier_uniform_(self.w_comp,
                                    gain=nn.init.calculate_gain('relu'))

    def propagate(self, g):
        if self.num_bases < self.num_rels:
            # generate all weights from bases
            weight = self.weight.view(self.num_bases,
                                      self.in_feat * self.out_feat)
            weight = torch.matmul(self.w_comp, weight).view(
                self.num_rels, self.in_feat, self.out_feat)
        else:
            weight = self.weight

        if self.is_input_layer:
            def msg_func(edges):
                # for input layer, matrix multiply can be converted to be
                # an embedding lookup using source node id
                embed = weight.view(-1, self.out_feat)
                index = edges.data['type'] * self.in_feat + edges.src['id']
                return {'msg': embed.index_select(0, index) * edges.data['norm']}
        else:
            def msg_func(edges):
                w = weight.index_select(0, edges.data['type'])
                msg = torch.bmm(edges.src['h'].unsqueeze(1), w).squeeze()
                msg = msg * edges.data['norm']
                return {'msg': msg}

        g.update_all(msg_func, fn.sum(msg='msg', out='h'), None)


# ---------------------
# | R-GCN Block Layer |
# ---------------------
#
# The block layer does not takes as input the entire training graph, but the
# sample graph. During each epoch, it takes as input a new sample of the training graph.
# For each epoch this layer is initialized according to the number of layers.
#
# This layer adopts the block decomposition as regularization in order to reduce
# the number of parameters.
#
# The initialization of this class consists in the definition (and reduction) of the
# weight matrix.
class RGCNBlockLayer(RGCNLayer):
    def __init__(self, in_feat, out_feat, num_rels, num_bases, bias=None,
                 activation=None, self_loop=False, dropout=0.0):

        super(RGCNBlockLayer, self).__init__(in_feat, out_feat, bias,
                                             activation, self_loop=self_loop,
                                             dropout=dropout)

        # initialization of the parameters
        self.num_rels = num_rels
        self.num_bases = num_bases
        assert self.num_bases > 0
        self.out_feat = out_feat

        # in_feat and out_feat are the numbers of neurons in each leayer
        # assume that in_feat and out_feat are both divisible by num_bases that is > 0
        # in order to reduce the number of parameters, we compute a submatrix for
        # input and output features.
        # in_feat = 500, num_bases = 100, sub_mat = 5 as default values
        self.submat_in = in_feat // self.num_bases
        self.submat_out = out_feat // self.num_bases

        # assign an embedding value to each of the relation (or predicate)
        self.weight = nn.Parameter(torch.Tensor(
            self.num_rels, self.num_bases * self.submat_in * self.submat_out))

        # glorot initialization: remember that no gradient will be recorded for this operation
        nn.init.xavier_uniform_(
            self.weight, gain=nn.init.calculate_gain('relu'))

    # --------------------
    # | Message function |
    # --------------------
    #
    # This function defines of message transimitted along the edges in the
    # default implementation of R-GCN.
    #
    # It takes as input "edges" that is a dictionary defined by the DGL library,
    # reporting information on a batch of edges (EdgeBatch class). This dictionary
    # contains the following information:
    #
    #     edges.src --> Return the feature data of the source nodes (subject)
    #     edges.dst --> Return the feature data of the destination nodes (objects)
    #
    # In R-GCN, the features of the nodes are the following:
    #
    #     edges.src['id'] --> nodes id in the knowledge graph
    #     edges.src['h'] --> embedding values of the node defined in the Embedding Layer
    #     edges.src['norm'] --> reciprocal of nodes incoming degree
    #
    # In R-GCN, the features of the edges are the following:
    #
    #     edges.data['type'] --> edges id in the knowledge graph
    #
    # For more information you can see the documentation:
    # https://docs.dgl.ai/en/latest/api/python/udf.html
    def msg_func(self, edges):
        # * Step 1: resize the ids vector of relations in a 3-dimensional tensor, using
        # as dimension reference submat_in and sub_mat out
        # Using the default parameters you transform a vector of size 30000,1
        # to a vector of 1200,5,5
        #
        # * Step 2: create a weight matrix using this edge ids included in this
        # new tensor as index for the embeddings of relationships included in the
        # self.weight.
        # As result of this step, each id is replaced by the embedding.
        # According to the default parameters, we will obtain
        # a new tensor of dimension 3.000.000, 5, 5 (3.000.000 is obtained through
        # 1200x2500. This last value is the dimension of the embedding for the relations)
        weight = self.weight.index_select(0, edges.data['type']).view(
            -1, self.submat_in, self.submat_out)

        # Node embeddings resized in a new tensor. Using the default parameters,
        # from 30.000, 500 to 3.000.000,1,5
        node = edges.src['h'].view(-1, 1, self.submat_in)

        # Multiply the value of node embeddings with the value of relations embeddings
        msg = torch.bmm(node, weight).view(-1, self.out_feat)

        # msg is a tensor with size (30000, 500). As you can intuitively understand,
        # this is the same size of the tensor containing initial node embeddings
        return {'msg': msg}

    def propagate(self, g):
        # forward propagation: send messages through all edges and update all nodes
        #     self.msg_func --> msg function among the edges
        #     fn.sum(msg='msg', out='h') --> aggregate the message values in the 'h'
        #                                    feature of the nodes (such features contain
        #                                    the initial embedding that therefore are updated)
        #     self_apply_func --> the values of the embeddings are multiplied according to the
       #                          reciprocal of the node degree
        g.update_all(self.msg_func, fn.sum(
            msg='msg', out='h'), self.apply_func)

    def apply_func(self, nodes):
        return {'h': nodes.data['h'] * nodes.data['norm']}
