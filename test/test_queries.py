# -*- coding: utf-8 -*-

"""
Copyright SeMi developers
@author: Giuseppe Futia <giuseppe.futia@gmail.com>
"""

import unittest
from rdflib import Graph
from src.utils.sparql import closures_query, related_classes_query, property_query, all_classes_query, check_subclassof_property_query
from src.utils.prefix import PrefixManager

def load_ontology():
    g = Graph()
    g.parse('test/data/ontology.ttl', format='turtle')
    return g

def create_st_classes():
    st_classes = ['aac-ont:CulturalHeritageObject', 'aac-ont:Person']
    return st_classes

class TestQuery(unittest.TestCase):
    
    def setUp(self):
        self.ont = load_ontology()
        self.st_classes = create_st_classes()

    def test_closure_query(self):
        q = closures_query(self.st_classes[0], ont_class='owl:Class')
        res = []
        for row in self.ont.query(q):
            res.append(str(row.closures))
        assert set(res) == {'http://www.americanartcollaborative.org/ontology/Person'}
        assert PrefixManager.from_uri_to_prefix(res[0]) == 'aac-ont:Person'

    def test_related_classes_query(self):
        q = related_classes_query(self.st_classes[0], ont_class='owl:Class')
        res = []
        for row in self.ont.query(q):
            res.append(PrefixManager.from_uri_to_prefix(str(row.classes)))
        assert set(res) == {'edm:ProvidedCHO', 'skos2:Concept'}

    def test_properties_query(self):
        q = property_query(self.st_classes[0], self.st_classes[1], ont_class='owl:Class')
        res = []
        for row in self.ont.query(q):
            res.append(PrefixManager.from_uri_to_prefix(str(row.properties)))
        assert set(res) == {'aac-ont:sitter'}
    
    def test_all_classes_query(self):
        q = all_classes_query(ont_class='owl:Class')
        res = []
        for row in self.ont.query(q):
            res.append(PrefixManager.from_uri_to_prefix(str(row.classes)))
        assert len(res) == 164
    
    def test_subclassof_property_query(self):
        q = check_subclassof_property_query('aac-ont:Person', 'edm:Agent')
        res = []
        for row in self.ont.query(q):
            res.append(row)
        assert res[0] == True

        q = check_subclassof_property_query('aac-ont:Person', 'aac-ont:Place')
        res = []
        for row in self.ont.query(q):
            res.append(row)
        assert res[0] == False

if __name__ == '__main__':
    unittest.main()
