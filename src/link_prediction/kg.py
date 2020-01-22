import os
import numpy as np
import csv
import rdflib
from dictionary import ModelDictionary


class RGCNDataSet(object):
    """ An object of this class includes the following information:

        num_nodes: int
            number of entities of the Knowledge Graph
        num_rels: int
            number of relations of the Knowledge Graph
        train: numpy.array
            triplets for training (src, rel, dst)
        valid: numpy.array
            triplets for validation (src, rel, dst)
        test: numpy.array
            triplets for testing (src, rel, dst)
    """

    def __init__(self, dir, train_rdf_path, valid_rdf_path, test_rdf_path, parser):
        self.dir = dir
        self.train_rdf_path = train_rdf_path
        self.valid_rdf_path = valid_rdf_path
        self.test_rdf_path = test_rdf_path
        self.num_nodes = 0
        self.num_rels = 0
        self.train = np.zeros([0])
        self.valid = np.zeros([0])
        self.test = np.zeros([0])
        self.entity_dict = {}
        self.relation_dict = {}
        # Initialize the ModelDictionary with the path and the parser to prepare data
        self.dictionary = ModelDictionary(parser, self.valid_rdf_path)

    def load_data(self):

        # Create dictionaries to assign a unique id to entities and relations
        self._set_up_dicts()

        # Create the training, the validation and the test datasets
        self._set_up_model_datasets()

    def _set_up_dicts(self):
        # Prepare placeholders for dictionary files
        self.entity_path = os.path.join(self.dir, 'dicts/entities.dict')
        self.relation_path = os.path.join(self.dir, 'dicts/relations.dict')

        # Prepare dictionaries for entities and relations if they do not exist
        # The input file for dictionaries depends on the parser passed to ModelDataset
        if os.path.isfile(self.entity_path) == False:
            file_path_for_dict = self.dictionary.file_path_for_dict()
            self._prepare_dicts(file_path_for_dict)

        # Set information on entities and relations
        self.entity_dict = _read_dict(self.entity_path)
        self.relation_dict = _read_dict(self.relation_path)
        self.num_nodes = len(self.entity_dict)
        self.num_rels = len(self.relation_dict)

        print('\nGraph details: ')
        print('# entities: {}'.format(self.num_nodes))
        print('# relations: {}'.format(self.num_rels))

    def _set_up_model_datasets(self):
        # Prepare placeholders for train, test, and valid
        self.train_path = os.path.join(self.dir, 'model_datasets/train')
        self.valid_path = os.path.join(self.dir, 'model_datasets/valid')
        self.test_path = os.path.join(self.dir, 'model_datasets/test')

        train, valid, test = self._prepare_tensors(self.train_rdf_path,
                                                   self.valid_rdf_path,
                                                   self.test_rdf_path)

        self.train = train
        self.valid = valid
        self.test = test

        # Store triplets as npy file
        np.save(self.train_path, self.train)
        np.save(self.valid_path, self.test)
        np.save(self.test_path, self.valid)

        print("# edges: {}".format(len(self.train)))

    def _prepare_dicts(self, file_path_for_dict):
        entities = []
        relations = []

        print(file_path_for_dict)

        # Process the Knowledge Graph
        g = rdflib.Graph()
        g.parse(file_path_for_dict, format='turtle')

        for s, p, o in g:
            if str(o).find('http://') != -1:
                if not str(s) in entities:
                    entities.append(str(s))
                if not str(p) in relations:
                    relations.append(str(p))
                if not str(o) in entities:
                    entities.append(str(o))

        # Store entities and relations as dictionaries
        _store_dict(self.entity_path, entities)
        _store_dict(self.relation_path, relations)

    def _prepare_tensors(self, train_rdf_path, valid_rdf_path, test_rdf_path):
        entity_list = []
        relation_list = []
        train = []
        test = []
        valid = []

        # Read dictionaries of entities and relations as list
        entity_list = _read_dict_as_list(self.entity_path)
        relation_list = _read_dict_as_list(self.relation_path)

        # Create an RDF graph for train, valid, and test and extract useful triplets for the link prediction task
        train = self._get_triplets_for_link_prediction(
            train_rdf_path, entity_list, relation_list)

        test = self._get_triplets_for_link_prediction(
            valid_rdf_path, entity_list, relation_list)

        valid = self._get_triplets_for_link_prediction(
            test_rdf_path, entity_list, relation_list)

        return train, test, valid

    def _get_triplets_for_link_prediction(self, rdf_path, entity_list, relation_list):
        triplet_list = []
        g = rdflib.Graph()
        # TODO Extend RDF parser
        g.parse(rdf_path, format='turtle')

        # Get triple where objects are entities (useful for the link prediction)
        for s, p, o in g:
            if str(o).find('http://') != -1:
                triplet = []
                s_index = entity_list.index(str(s))
                p_index = relation_list.index(str(p))
                o_index = entity_list.index(str(o))
                triplet.append(s_index)
                triplet.append(p_index)
                triplet.append(o_index)
                triplet_list.append(triplet)

        return np.asarray(triplet_list)


"""
Utility functions to read and store the data
"""


def _read_dict(dict_path):
    d = {}
    with open(dict_path, 'r+') as f:
        for line in f:
            line = line.strip().split('\t')
            d[int(line[0])] = str(line[1])
    return d


def _read_dict_as_list(dict_path):
    with open(dict_path) as tsv:
        list_to_store = []
        reader = csv.reader(tsv, delimiter='\t')
        for row in reader:
            list_to_store.append(row[1])
        return list_to_store


def _store_dict(dict_path, list_to_store):
    with open(dict_path, 'wt') as file:
        writer = csv.writer(file, delimiter='\t')
        for idx, val in enumerate(list_to_store):
            writer.writerow([idx, val])
