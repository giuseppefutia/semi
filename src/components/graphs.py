from jgrapht import create_graph
from jgrapht.algorithms.connectivity import is_weakly_connected
from jgrapht.io.exporters import generate_json
from src.generators import OntologyGenerator

# -*- coding: utf-8 -*-

"""
Copyright SeMi developers
@author: Giuseppe Futia <giuseppe.futia@gmail.com>
"""

class IntegrationGraph():
    
    def __init__(self, generator,
                       directed=True,
                       weighted=True,
                       any_hashable=True
                       allowing_self_loops=True,
                       allowing_multiple_edges=True):
        
        self.structure = create_graph(directed,
                                      weighted,
                                      any_hashable,
                                      allowing_self_loops,
                                      allowing_multiple_edges)
        
        generator.set_components()

        self._nodes_data = _from_list_to_dict(generator.get_nodes())
        self._edges_data = _from_list_to_dict(generator.get_edges())
        self.generator = generator

    def get_node_data(self, node_id):
        return self._nodes_data.get(node_id)
    
    def get_edge_data(self, edge_id):
        return self._edges_data.get(edge_id)
    
    def get_nodes(self):
        return self._nodes_data
    
    def get_edges(self):
        return self._edges_data
    
    def construct_graph(self):
        # Add nodes
        self._add_nodes()

        # Add edges
        self._add_edges()

        # Check if node thing is required
        is_connected, components = is_weakly_connected(self.structure)
        if is_connected == 0:
            self._add_thing_components(components)
        
        # Export graph
        # TODO
    
    def _add_nodes(self):
        for node_id in self._nodes_data.keys():
            self.structure.add_vertex(node_id)

    def _add_edges(self):
        for edge_id, edge_data in self._edges_data.items():
            src = edge_data.src
            dst = edge_data.dst
            weight = edge_data.weight

            for node_id, node_data in self._nodes_data.items():
                if node_data.id == src:
                    src_node_id = node_id
                if node_data.id == dst:
                    dst_node_id = node_id
            
            self.structure.add_edge(src_node_id, dst_node_id, edge=edge_id)
            self.structure.set_edge_weight(edge_id, weight)
    
    def _add_thing_components(self, components):        
        # Create the thing node and update the data structures
        thing = self.generator.create_thing_node()
        thing_id = sorted([n for n in self._nodes_data.keys()])[-1] + 1
        self._nodes_data[thing_id] = thing
        self.structure.add_vertex(thing_id)

        # Create the edges connected to the thing node
        component_head_ids = []
        component_head_node_ids = []
        for i in components:
            head_id = list(i)[0]
            component_head_ids.append(head_id)
            component_head_node_ids.append(self._nodes_data.get(head_id).id)
        edges = self.generator.create_thing_edges(component_head_node_ids)
        new_edge_id = sorted([e for e in self._edges_data.keys()])[-1] + 1

        # Sanity check: the number of new edges has to be equal to the number of components
        assert len(edges) == len(component_head_ids) 

        # Update the edge data structures
        for idx, e in enumerate(edges):
            self._edges_data[new_edge_id] = e
            self.structure.add_edge(thing_id, component_head_ids[idx], edge=new_edge_id)
            self.structure.set_edge_weight(new_edge_id, e.weight)
            new_edge_id += 1
    
    def _export_graph(self):
        # Converted Typed Node into dict for export
        nodes_dict = {k : {'id' : v.id, 'name' : v.name, 'n_type' : v.n_type}
                        for k, v in self._nodes_data.items()}
        
        print(nodes_dict)

        graph_json = generate_json(self.structure, nodes_dict)
        return graph_json

    def get_paths(self, src, dst, best=True):
        pass

    def get_steiner_tree(self):
        pass

    def get_multiple_steiner_tree(self):
        # Return a list of patterns with their scores
        pass

def _from_list_to_dict(lst):
    """ From a components list to a components dictionary """
    output_dict = {idx : value for i in enumerate(lst)}
    return output_dict


