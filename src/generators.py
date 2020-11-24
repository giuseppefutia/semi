# -*- coding: utf-8 -*-

"""
Copyright SeMi developers
@author: Giuseppe Futia <giuseppe.futia@gmail.com>
"""

from rdflib import Graph
from src.utils.util import read_json, print_all
from src.utils.prefix import PrefixManager
from src.components.edges import WeightedEdge
from src.components.nodes import TypedNode 
from src.utils.sparql import *

class OntologyGenerator():
    
    def __init__(self, st_path, ont_path, ont_class='rdfs:Class', domain_prop='rdfs:domain', range_prop='rdfs:range'):
        self.sts = read_json(st_path)
        self.ont_graph = Graph()
        self.ont_graph.parse(ont_path, format='turtle')
        self.ont_class = ont_class
        self.domain_prop = domain_prop
        self.range_prop = range_prop
        self.nodes = []
        self.edges = []
        self.ε = 3
        self.λ = 100
    
    def get_components(self):
        # Add semantic type nodes and edges
        st_nodes, st_edges = self._set_semantic_types(self.sts)
        self.nodes.extend(st_nodes)
        self.edges.extend(st_edges)

        # Select semantic type class nodes
        st_class_nodes = [c for c in st_nodes if c.n_type != 'data_node']

        # Add closure nodes
        closure_nodes = self._set_closure_nodes(st_class_nodes)
        self.nodes.extend(closure_nodes)

        # Prepare class nodes
        class_nodes = closure_nodes + st_class_nodes

        # Add direct edges
        direct_edges = self._set_direct_edges(class_nodes)
        self.edges.extend(direct_edges)

        # Add subclass edges
        subclass_edges = self._set_subclass_edges(class_nodes)
        self.edges.extend(subclass_edges)

        # Get related classes
        related_classes = self._get_related_classes(class_nodes)

        # Add indirect edges (avoid duplicates)
        indirect_edges = self._set_indirect_edges(related_classes)
        for e in indirect_edges:
            if not duplicated_component(e.id, self.edges):
                self.edges.append(e)

        return self.nodes, self.edges
    
    def _set_semantic_types(self, semantic_types):
        nodes = []
        edges = []      

        attrs = semantic_types[0]['attributes']
        sts = semantic_types[0]['semantic_types']
        entities = semantic_types[0]['entities']
        
        for i in range(len(sts)):
            # Get the class nodes and the property name derived from the semantic types
            st_node_edge = sts[i][0].split('***')
            h_node_id = st_node_edge[0] + entities[i]
            edge_prop = st_node_edge[1]
            
            # Add a new semantic type class node if it does not exist yet
            if not duplicated_component(h_node_id, nodes):
                h_node = TypedNode(h_node_id , st_node_edge[0], 'st_node')
                nodes.append(h_node)
        
            # The id and the name a data node have the same value
            t_node_id = attrs[i]
            t_node = TypedNode(t_node_id, t_node_id, 'data_node') 
            nodes.append(t_node)

            # Create a new edge for each semantic type
            edge = WeightedEdge(h_node_id,
                                t_node_id,
                                edge_prop,
                                self.λ,
                                'st_edge')
            edges.append(edge)

        return nodes, edges
    
    def _set_closure_nodes(self, st_nodes):
        nodes = []

        # Compose the queries
        query_list = [{'query': closures_query(n.name, self.ont_class)} for n in st_nodes]
        
        # Perform the queries and collect all the result sets
        all_result_sets = execute_queries(query_list, self.ont_graph)

        # Extract all the closures from each single result set
        closures = []
        for rs in all_result_sets:
            for row in rs:
                closures.append(str(row.closures))
        
        # Use prefix instead of uri to define closures
        cleaned_closures = [PrefixManager.from_uri_to_prefix(c) for c in closures]

        # Create unique nodes from cleaned closures
        for c in cleaned_closures:
            if not duplicated_component(c, nodes):
                node = TypedNode(c, c, 'class_node')
                nodes.append(node)

        return nodes
    
    def _set_direct_edges(self, class_nodes):
        edges = []

        # Compute the cartesian products between the class nodes
        # The cartesian product is necessary, because we wanto to get all possible combinations
        query_list = [{'src': a.id, 'dst': b.id, 'query': property_query(a.name, b.name, self.ont_class)}
                         for a in class_nodes for b in class_nodes]

        # Perform the queries and collect the all the result sets
        all_result_sets = execute_queries(query_list, self.ont_graph)

        # Use each value of each result set to construct direct edges
        for i in range(len(all_result_sets)):
            rs = all_result_sets[i]
            for row in rs:
                edge = WeightedEdge(query_list[i].get('src'),
                                    query_list[i].get('dst'),
                                    PrefixManager.from_uri_to_prefix(str(row.properties)),
                                    self.λ,
                                    'direct_edge')
                edges.append(edge)
        
        return edges
    
    def _set_subclass_edges(self, class_nodes):
        edges = []

        # Compute the cartesian products between the class nodes
        # The cartesian product is necessary, because we wanto to get all possible combinations
        query_list = [{'src': a.id, 'dst': b.id, 'query': check_subclassof_property_query(a.name, b.name)}
                         for a in class_nodes for b in class_nodes]
        
        # Perform the queries and collect the all the result sets
        all_result_sets = execute_queries(query_list, self.ont_graph)

        # Check if the triple exists: in this case, add a new edge
        for i in range(len(all_result_sets)):
            rs = all_result_sets[i]
            for row in rs:
                if row:
                    edge = WeightedEdge(query_list[i].get('src'),
                                        query_list[i].get('dst'),
                                        'rdfs:subClassOf', # Should be fixed in case of unusual ontologies
                                        self.λ / self.ε,
                                        'subclass_edge')
                    edges.append(edge)

        return edges

    def _get_related_classes(self, class_nodes):
        related_classes = []
        
        # Compose the queries
        # Store info on the starting class
        query_list = [{'c_id': c.id, 'query': related_classes_query(c.name, self.ont_class)}
                        for c in class_nodes]
        
        # Perform the queries and collect all the result sets
        all_result_sets = execute_queries(query_list, self.ont_graph)

        # Associate all classes from a result set to the related class
        for i in range(len(all_result_sets)):
            rs = all_result_sets[i]
            rc = {}
            rc['c_id'] = query_list[i]['c_id']
            rc['rc_ids'] = []
            for row in rs:
                rc['rc_ids'].append(PrefixManager.from_uri_to_prefix(str(row.classes)))
            related_classes.append(rc)
        
        return related_classes
    
    def _set_indirect_edges(self, related_classes):
        edges = []
        
        # First cartesian products between the class nodes
        cartesian_classes = [{'src': a, 'dst': b}
            for a in related_classes for b in related_classes]

        for i in cartesian_classes:
            # Second cartesian product between classes related to the class nodes
            src_classes = i['src']['rc_ids']
            dst_classes = i['dst']['rc_ids']

            query_list = [{'src': i.get('src').get('c_id'), 'dst': i.get('dst').get('c_id'),
                           'query': property_query(a, b, self.ont_class)}
                            for a in src_classes for b in dst_classes]
            
            all_result_sets = execute_queries(query_list, self.ont_graph)

            for i in range(len(all_result_sets)):
                rs = all_result_sets[i]
                for row in rs:
                    if row:
                        edge = WeightedEdge(query_list[i].get('src'),
                                        query_list[i].get('dst'),
                                        PrefixManager.from_uri_to_prefix(str(row.properties)),
                                        self.λ + self.ε,
                                        'indirect_edge')
                        edges.append(edge)

        return edges
                     
class GAEGenerator():
    pass

class TaheryanGenerator():
    pass

def duplicated_component(component_id, components):
    if any(c.id == component_id for c in components):
        return True
    return False

def execute_queries(query_list, ont_graph):
    results = []
    for q in query_list:
        try:
            rs = ont_graph.query(q.get('query'))
            results.append(rs)
        except:
            print('The query looks wrong:') # TODO: Should be replaced with the logger
            print(q['query'])
            raise SystemExit()
    
    # Sanity check: the number of queries has to be equal to the number of result sets
    assert len(query_list) == len(results)
    
    return results
