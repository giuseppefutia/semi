"""
Utility functions for link prediction
Most code is adapted from authors" implementation of RGCN link prediction:
https://github.com/MichSchli/RelationPrediction

Extended by Giuseppe Futia to export score related to validation triples.
In particular, see the implementation of export_triples_score() function.

"""

import numpy as np
import torch
import dgl
import json
import os

#######################################################################
#
# Utility function for building training and testing graphs
#
#######################################################################


def get_adj_and_degrees(num_nodes, triplets):
    """ Get adjacency list of the graph and the degrees of each node
    """
    adj_list = [[] for _ in range(num_nodes)]
    for i, triplet in enumerate(triplets):
        adj_list[triplet[0]].append([i, triplet[2]])
        adj_list[triplet[2]].append([i, triplet[0]])

    degrees = np.array([len(a) for a in adj_list])
    adj_list = [np.array(a) for a in adj_list]
    return adj_list, degrees


def sample_edge_neighborhood(adj_list, degrees, n_triplets, sample_size):
    """ Edge neighborhood sampling to reduce training graph size
    """

    edges = np.zeros((sample_size), dtype=np.int32)

    # initialize
    sample_counts = np.array([d for d in degrees])
    picked = np.array([False for _ in range(n_triplets)])
    seen = np.array([False for _ in degrees])

    for i in range(0, sample_size):
        weights = sample_counts * seen

        if np.sum(weights) == 0:
            weights = np.ones_like(weights)
            weights[np.where(sample_counts == 0)] = 0

        probabilities = (weights) / np.sum(weights)
        chosen_vertex = np.random.choice(np.arange(degrees.shape[0]),
                                         p=probabilities)
        chosen_adj_list = adj_list[chosen_vertex]
        seen[chosen_vertex] = True

        chosen_edge = np.random.choice(np.arange(chosen_adj_list.shape[0]))
        chosen_edge = chosen_adj_list[chosen_edge]
        edge_number = chosen_edge[0]

        while picked[edge_number]:
            chosen_edge = np.random.choice(np.arange(chosen_adj_list.shape[0]))
            chosen_edge = chosen_adj_list[chosen_edge]
            edge_number = chosen_edge[0]

        edges[i] = edge_number
        other_vertex = chosen_edge[1]
        picked[edge_number] = True
        sample_counts[chosen_vertex] -= 1
        sample_counts[other_vertex] -= 1
        seen[other_vertex] = True

    return edges


def generate_sampled_graph_and_labels(triplets, sample_size, split_size,
                                      num_rels, adj_list, degrees,
                                      negative_rate):
    """Get training graph and signals
    First perform edge neighborhood sampling on graph, then perform negative
    sampling to generate negative samples
    """
    # perform edge neighbor sampling
    edges = sample_edge_neighborhood(adj_list, degrees, len(triplets),
                                     sample_size)

    # relabel nodes to have consecutive node ids
    edges = triplets[edges]
    src, rel, dst = edges.transpose()
    uniq_v, edges = np.unique((src, dst), return_inverse=True)
    src, dst = np.reshape(edges, (2, -1))
    relabeled_edges = np.stack((src, rel, dst)).transpose()

    # negative sampling
    samples, labels = negative_sampling(relabeled_edges, len(uniq_v),
                                        negative_rate)

    # further split graph, only half of the edges will be used as graph
    # structure, while the rest half is used as unseen positive samples
    split_size = int(sample_size * split_size)
    graph_split_ids = np.random.choice(np.arange(sample_size),
                                       size=split_size, replace=False)
    src = src[graph_split_ids]
    dst = dst[graph_split_ids]
    rel = rel[graph_split_ids]

    # build DGL graph
    print("# sampled nodes: {}".format(len(uniq_v)))
    print("# sampled edges: {}".format(len(src) * 2))
    g, rel, norm = build_graph_from_triplets(len(uniq_v), num_rels,
                                             (src, rel, dst))
    return g, uniq_v, rel, norm, samples, labels


def comp_deg_norm(g):
    in_deg = g.in_degrees(range(g.number_of_nodes())).float().numpy()
    norm = 1.0 / in_deg
    norm[np.isinf(norm)] = 0
    return norm


def build_graph_from_triplets(num_nodes, num_rels, triplets):
    """ Create a DGL graph. The graph is bidirectional because RGCN authors
        use reversed relations.
        This function also generates edge type and normalization factor
        (reciprocal of node incoming degree)
    """
    g = dgl.DGLGraph()
    g.add_nodes(num_nodes)
    src, rel, dst = triplets
    src, dst = np.concatenate((src, dst)), np.concatenate((dst, src))
    rel = np.concatenate((rel, rel + num_rels))
    edges = sorted(zip(dst, src, rel))
    dst, src, rel = np.array(edges).transpose()
    g.add_edges(src, dst)
    norm = comp_deg_norm(g)
    print("# nodes: {}, # edges: {}".format(num_nodes, len(src)))
    return g, rel, norm


def build_test_graph(num_nodes, num_rels, edges):
    src, rel, dst = edges.transpose()
    print("Test graph:")
    return build_graph_from_triplets(num_nodes, num_rels, (src, rel, dst))


def negative_sampling(pos_samples, num_entity, negative_rate):
    size_of_batch = len(pos_samples)
    num_to_generate = size_of_batch * negative_rate
    neg_samples = np.tile(pos_samples, (negative_rate, 1))
    labels = np.zeros(size_of_batch * (negative_rate + 1), dtype=np.float32)
    labels[: size_of_batch] = 1
    values = np.random.randint(num_entity, size=num_to_generate)
    choices = np.random.uniform(size=num_to_generate)
    subj = choices > 0.5
    obj = choices <= 0.5
    neg_samples[subj, 0] = values[subj]
    neg_samples[obj, 2] = values[obj]

    return np.concatenate((pos_samples, neg_samples)), labels

#######################################################################
#
# Utility function for evaluations
#
#######################################################################


def sort_and_rank(score, target):
    scores, indices = torch.sort(score, dim=1, descending=True)
    indices = torch.nonzero(indices == target.view(-1, 1))
    non_zero_indices = indices[:, 0].view(-1)  # Added to get the score
    indices = indices[:, 1].view(-1)

    # Use torch.non_zero d2 tensor [[0,223][1,345][2,436]] as index to get the
    # score value for the target object (and as a consequence for the target triple)
    scores = scores[non_zero_indices, indices]

    return scores, indices


def perturb_and_get_rank(embedding, w, a, r, b, epoch, entity_dict, relation_dict, batch_size=100):
    """ Perturb one element in the triplets
    """
    n_batch = (len(a) + batch_size - 1) // batch_size
    ranks = []

    # list that stores score triples to print filled only during the test_stage
    score_list = []
    for idx in range(n_batch):
        print("batch {} / {}".format(idx, n_batch))
        batch_start = idx * batch_size
        batch_end = min(len(a), (idx + 1) * batch_size)
        batch_a = a[batch_start: batch_end]
        batch_r = r[batch_start: batch_end]
        emb_ar = embedding[batch_a] * w[batch_r]
        emb_ar = emb_ar.transpose(0, 1).unsqueeze(2)  # size: D x E x 1
        emb_c = embedding.transpose(0, 1).unsqueeze(1)  # size: D x 1 x V

        # out-prod and reduce sum
        out_prod = torch.bmm(emb_ar, emb_c)  # size D x E x V
        score = torch.sum(out_prod, dim=0)  # size E x V
        score = torch.sigmoid(score)
        target = b[batch_start: batch_end]
        batch_score, batch_rank = sort_and_rank(score, target)
        ranks.append(batch_rank)

        score_list.extend(export_triples_score(batch_a, batch_r, target, batch_rank, batch_score,
                                               embedding, w, entity_dict, relation_dict))

    return torch.cat(ranks), score_list

# TODO (lingfan): implement filtered metrics
# return MRR (raw), and Hits @ (1, 3, 10)


def evaluate(test_graph, model, test_triplets, epoch, entity_dict, relation_dict, vis,
             hits=[], eval_bz=100):
    with torch.no_grad():
        embedding, w = model.evaluate(test_graph)
        s = test_triplets[:, 0]
        r = test_triplets[:, 1]
        o = test_triplets[:, 2]

        # perturb subject (inverse validation triples: o,r,s)
        ranks_s, score_list = perturb_and_get_rank(
            embedding, w, o, r, s, epoch, entity_dict, relation_dict, eval_bz)

        # perturb object (validation triples: s,r,o)
        ranks_o, score_list_o = perturb_and_get_rank(
            embedding, w, s, r, o, epoch, entity_dict, relation_dict, eval_bz)

        ranks = torch.cat([ranks_s, ranks_o])
        ranks += 1  # change to 1-indexed
        score_list.extend(score_list_o)

        # print scores and ranks of triples
        score_path = "./output/epoch_" + str(epoch) + "/"
        print_scores_as_json(score_list, score_path)

        # visualize the numbero of triples for each rank
        rank_values, number_of_triples = prepare_ranks_for_vis(score_list)
        vis.plot_rank(rank_values, np.array(number_of_triples))

        mrr = torch.mean(1.0 / ranks.float())
        print("MRR (raw): {:.6f}".format(mrr.item()))

        for hit in hits:
            avg_count = torch.mean((ranks <= hit).float())
            print("Hits (raw) @ {}: {:.6f}".format(hit, avg_count.item()))
    return mrr.item()

# The following functions are added by Giuseppe Futia


def print_scores_as_json(score_list, dir_path):
    print("Print score as json: " + dir_path + "...")
    if not os.path.exists(dir_path):
        os.makedirs(dir_path)
    with open(dir_path + "score.json", "w") as f:
        json.dump(score_list, f, ensure_ascii=False, indent=4)


def prepare_ranks_for_vis(ranks):
    triples_for_rank = {}  # dict[rank] = num_of_triples

    for rank_dict in ranks:
        rank_value = rank_dict['rank']
        if (rank_value in triples_for_rank):
            triples_for_rank[rank_value] += 1
        else:
            triples_for_rank[rank_value] = 1

    rank_values = list(triples_for_rank.keys())
    number_of_triples = list(triples_for_rank.values())

    return rank_values, number_of_triples


def export_triples_score(batch_s, batch_r, batch_o, batch_rank, batch_score,
                         emb_nodes, emb_rels, entity_dict, relation_dict):
    """ Export score associated to each triple included in the validation dataset.
        This function is called for each evaluation batch.
        Exported scores could be useful for a deep analysis of the evaluation
        results and are necessary for the refinement process of the SEMI tool.

        Arguments:
        batch_s -- tensor batch of subject ids
        batch_r -- tensor batch of relation ids
        batch_o -- tensor batch of object ids (the target)
        batch_rank -- tensor batch of ranks
        batch_score -- tensor batch of scores
        emb_nodes -- tensor with embeddings of all nodes
        emb_rels -- tensor with embeddings of all relations
        entity_dict -- dict where key is the node index and the value is the node uri
        relation_dict -- dict where key is the relation index and the value is the relation uri

        Returns:
        score_list -- list of dictionaries including triple ids, uris, and the associated score and ranks
    """

    score_list = []
    for triple in zip(batch_s, batch_r, batch_o, batch_rank, batch_score):
        triple_dict = {"s_id": triple[0].item(),
                       "s_uri": entity_dict[int(triple[0].item())],
                       "r_id": triple[1].item(),
                       "r_uri": relation_dict[int(triple[1].item())],
                       "o_id": triple[2].item(),
                       "o_uri": entity_dict[int(triple[2].item())],
                       "rank": triple[3].item(),
                       "score": triple[4].item()
                       }
        score_list.append(triple_dict)
    return score_list
