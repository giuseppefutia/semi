import os
import numpy as np
import csv
import rdflib


class RGCNDataSet(object):
    """ An object of this class includes the following information:

        num_nodes: int
            number of entities of the Knowledge Graph
        num_rels: int
            number of relations (including reverse relations) of the Knowledge Graph
        train: numpy.array
            triplets for training (src, rel, dst)
        valid: numpy.array
            triplets for validation (src, rel, dst)
        test: numpy.array
            triplets for testing (src, rel, dst)
    """

    # Initialize with the path of the dataset
    def __init__(self, file_path):
        self.dir = os.path.dirname(file_path)
        self.file_path = file_path
        self.num_nodes = 0
        self.num_rels = 0
        self.train = np.zeros([0])
        self.valid = np.zeros([0])
        self.test = np.zeros([0])
        self.entity_dict = {}
        self.relation_dict = {}

    # Load data based on the path of the dataset
    def load_data(self):
        # Prepare placeholders of input files for the R-GCN model
        self.entity_path = os.path.join(self.dir, 'entities.dict')
        self.relation_path = os.path.join(self.dir, 'relations.dict')
        self.complete_path = os.path.join(self.dir, 'complete')
        self.train_path = os.path.join(self.dir, 'train')
        self.valid_path = os.path.join(self.dir, 'valid')
        self.test_path = os.path.join(self.dir, 'test')

        # Prepare dictionaries for entities and relations if they do not exist
        if os.path.isfile(self.entity_path) == False:
            self._prepare_dicts()

        # Prepare matrices for training, validation, and test if they do not exist
        if os.path.isfile(self.train_path) == False:
            self._prepare_matrices()

        # Set information on entities and relations
        self.entity_dict = _read_dict(self.entity_path)
        self.relation_dict = _read_dict(self.relation_path)
        self.num_nodes = len(self.entity_dict)
        self.num_rels = len(self.relation_dict)
        print("# entities: {}".format(self.num_nodes))
        print("# relations: {}".format(self.num_rels))

        # Set information on model datasets
        self.train = np.load(self.train_path + '.npy')
        self.valid = np.load(self.valid_path + '.npy')
        self.test = np.load(self.test_path + '.npy')
        print("# edges: {}".format(len(self.train)))

    # Prepare dictionaries
    def _prepare_dicts(self):
        entities = []
        relations = []

        # Process the Knowledge Graph
        g = rdflib.Graph()
        g.parse(self.file_path, format='turtle')

        for s, p, o in g:
            if str(o).find('http://') != -1:
                if not str(s) in entities:
                    entities.append(str(s))
                if not str(p) in relations:
                    relations.append(str(p))
                if not str(o) in entities:
                    entities.append(str(o))

        # Store files
        _store_dict(self.entity_path, entities)
        _store_dict(self.relation_path, relations)

    # Prepare matrices
    def _prepare_matrices(self):
        entity_list = []
        relation_list = []
        complete = []
        train = []
        test = []
        valid = []

        entity_list = _read_dict_as_list(self.entity_path)
        relation_list = _read_dict_as_list(self.relation_path)

        g = rdflib.Graph()
        g.parse(self.file_path, format='turtle')

        # Get triple where objects are entities (useful for the link prediction)
        for s, p, o in g:
            if str(o).find('http://') != -1:
                triple = []
                s_index = entity_list.index(str(s))
                p_index = relation_list.index(str(p))
                o_index = entity_list.index(str(o))
                triple.append(s_index)
                triple.append(p_index)
                triple.append(o_index)
                complete.append(triple)

        np_complete = np.asarray(complete)
        np.save(self.complete_path, np_complete)

        # XXX For now train, valid, and test are equal to complete_path
        # In the following step, they will be updated with the triples of the validation
        np.save(self.train_path, np_complete)
        np.save(self.valid_path, np_complete)
        np.save(self.test_path, np_complete)


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
