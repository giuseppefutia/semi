# -*- coding: utf-8 -*-

'''
Copyright SeMi developers
@author: Giuseppe Futia <giuseppe.futia@gmail.com>
'''

import unittest
from src.components.nodes import TypedNode
from src.components.edges import WeightedEdge
from src.generators import OntologyGenerator
from src.utils.util import print_all

class TestOntologyGenerator(unittest.TestCase):

    def setUp(self):
        st_path = 'test/data/s01-cb_st.json'
        ont_path = 'test/data/ontology.ttl'
        self.og = OntologyGenerator(st_path, ont_path, ont_class='owl:Class')
        self.sts = self.og.sts
        self.ont = self.og.ont_graph
    
    def test_set_semantic_types(self):
        nodes, edges = self.og._set_semantic_types(self.og.sts)
        assert [st.dst for st in edges] == [
                                    'Actor_URI',
                                    'Title',
                                    'Begin Date',
                                    'End Date',
                                    'Dated',
                                    'Dimensions',
                                    'Medium_URI',
                                    'Medium',
                                    'Artist_Appellation_URI',
                                    'Attribution'
                                ]
        assert [st.src for st in edges] == ['crm:E21.Person1',
                                            'crm:E35.Title1',
                                            'crm:E52.Time-Span1',
                                            'crm:E52.Time-Span2',
                                            'crm:E52.Time-Span3',
                                            'crm:E54.Dimension1',
                                            'crm:E55.Type1',
                                            'crm:E55.Type1',
                                            'crm:E82.Actor_Appellation1',
                                            'crm:E82.Actor_Appellation1']
        assert edges[0].prop == 'rdfs:label'
        assert edges[0].id == 'crm:E21.Person1***rdfs:label***Actor_URI'
        assert nodes[0].id == 'crm:E21.Person1'
        assert nodes[0].name == 'crm:E21.Person'
        assert nodes[0].n_type == 'st_node'
        assert len(nodes) == 18
    
    def test_simple_set_closure_nodes(self):
        st_nodes = [TypedNode('aac-ont:CulturalHeritageObject1', 'aac-ont:CulturalHeritageObject'),
                    TypedNode('aac-ont:Person1', 'aac-ont:Person')]
        nodes = self.og._set_closure_nodes(st_nodes)
        assert [n.id for n in nodes] == ['aac-ont:Person',
                                        'aac-ont:Place',
                                        'aac-ont:CulturalHeritageObject',
                                        'edm:ProvidedCHO'
                                        ]
    
    def test_set_closure_nodes(self):
        st_nodes, st_edges = self.og._set_semantic_types(self.og.sts)
        st_class_nodes = [c for c in st_nodes if c.n_type != 'data_node']
        closure_nodes = self.og._set_closure_nodes(st_class_nodes)
        assert len(closure_nodes) == 0

    def test_simple_set_direct_edges(self):
        st_nodes = [TypedNode('aac-ont:CulturalHeritageObject1', 'aac-ont:CulturalHeritageObject'),
                    TypedNode('aac-ont:Person1', 'aac-ont:Person')]
        closure_nodes = self.og._set_closure_nodes(st_nodes)
        class_nodes = closure_nodes + st_nodes
        direct_edges = self.og._set_direct_edges(class_nodes)
        assert len(direct_edges) == 10
        assert direct_edges[0].id == 'aac-ont:Person***ElementsGr2:placeOfBirth***aac-ont:Place'
    
    def test_set_direct_edges(self):
        st_nodes, st_edges = self.og._set_semantic_types(self.og.sts)
        st_class_nodes = [c for c in st_nodes if c.n_type != 'data_node']
        closure_nodes = self.og._set_closure_nodes(st_class_nodes)
        class_nodes = closure_nodes + st_class_nodes
        direct_edges = self.og._set_direct_edges(class_nodes)
        assert len(closure_nodes) == 0
        assert len(direct_edges) == 0
    
    def test_simple_set_subclass_edges(self):
        class_nodes = [TypedNode('aac-ont:Person1', 'aac-ont:Person'),
                      TypedNode('edm:Agent1', 'edm:Agent')]
        edges = self.og._set_subclass_edges(class_nodes)
        assert edges[0].id == 'aac-ont:Person1' + '***' + 'rdfs:subClassOf' + '***' + 'edm:Agent1'
        assert edges[0].src == 'aac-ont:Person1'
        assert edges[0].dst == 'edm:Agent1'
        assert edges[0].prop == 'rdfs:subClassOf'
        assert edges[0].weight == 100/3
        assert edges[0].e_type == 'subclass_edge'
    
    def test_set_subclass_edges(self):
        st_nodes, st_edges = self.og._set_semantic_types(self.og.sts)
        st_class_nodes = [c for c in st_nodes if c.n_type != 'data_node']
        closure_nodes = self.og._set_closure_nodes(st_class_nodes)
        class_nodes = closure_nodes + st_class_nodes
        subclass_edges = self.og._set_subclass_edges(class_nodes)
        assert len(subclass_edges) == 0

    def test_simple_get_related_classes_query(self):
        class_nodes = [TypedNode('aac-ont:Person1', 'aac-ont:Person'),
                      TypedNode('edm:Agent1', 'edm:Agent')]
        related_classes = self.og._get_related_classes(class_nodes)
        assert related_classes[0]['rc_ids'] == ['edm:Agent', 'rdvocab-schema:Person', 'skos2:Concept', 'foaf:Person']
        assert related_classes[1]['rc_ids'] == ['edm:NonInformationResource', 'aac-ont:Person', 'aac-ont:Organization'] 

    def test_get_all_related_classes(self):
        st_nodes, st_edges = self.og._set_semantic_types(self.og.sts)
        st_class_nodes = [c for c in st_nodes if c.n_type != 'data_node']
        closure_nodes = self.og._set_closure_nodes(st_class_nodes)
        class_nodes = closure_nodes + st_class_nodes
        related_classes = self.og._get_related_classes(class_nodes)
        assert related_classes[0]['rc_ids'] == []
        assert related_classes[1]['rc_ids'] == []

    def test_set_indirect_edges(self):
        related_classes = []
        related_classes.append({'c_id': 'aac-ont:Person1', 'rc_ids': ['edm:Agent', 'rdvocab-schema:Person', 'skos2:Concept', 'foaf:Person']})
        related_classes.append({'c_id': 'edm:Agent1', 'rc_ids': ['edm:NonInformationResource', 'aac-ont:Person', 'aac-ont:Organization']})
        indirect_edges = self.og._set_indirect_edges(related_classes)
        assert indirect_edges[0].id == 'aac-ont:Person1***skos2:mappingRelation***aac-ont:Person1'
    
    def test_get_components(self):
        nodes, edges = self.og.get_components()
        assert len(nodes) == 18
        assert len(edges) == 10

if __name__ == '__main__':
    unittest.main()
