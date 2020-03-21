import json
import sys
import os
import re
import urllib.parse
import rdflib
from flashtext import KeywordProcessor
keyword_processor = KeywordProcessor()

# task dataset from which extract data
task = sys.argv[1]

# sts path
st_path = 'data/taheriyan2016/' + task + '/semantic_types/updated/'

# learning datasets path
rdf_path = 'data/taheriyan2016/' + task + '/learning_datasets/'

# ground truths path
gt_path = 'evaluation/taheriyan2016/' + task + '/semantic_models_gt/graph/'

files = os.listdir(st_path)

for file in files:
    name = file.replace('_st.json', '')
    print('\n\nProcessing dataset related to ' + name + '...')

    # ----- Extract data from sources
    st = json.load(open(st_path + file))
    print('\n    * The number of attributes is equal to: '
          + str(len(st[0]['attributes'])))

    # ------ Extract data from complete rdf files
    complete = open(rdf_path + name + '/complete.nt').read()
    # Get the URIs included within diamonds <> and encode them
    # TODO: should be put as utils clearner
    matches = re.findall(r'\<(.*?)\>', complete)
    matches = list(
        map((lambda x: {x: urllib.parse.quote(x, safe='http://')}), matches))

    for index in range(len(matches)):
        for key in matches[index]:
            keyword_processor.add_keyword(key, matches[index][key])

    complete_updated = keyword_processor.replace_keywords(complete)

    g = rdflib.Graph()
    graph = g.parse(data=complete_updated, format='turtle')

    res = g.query(
        """
            SELECT (COUNT (DISTINCT ?s) AS ?num_entities)
            WHERE {
                ?s ?p ?o
            }
            """)

    for row in res:
        print("    * Number of entities in complete: %s" % row)

    res = g.query(
        """
            SELECT (COUNT (*) AS ?num_triples)
            WHERE {
                ?s ?p ?o
            }
            """)

    for row in res:
        print("    * Number of triples in complete: %s" % row)

    # ------ Extract data from train rdf files
    complete = open(rdf_path + name + '/train.nt').read()
    # Get the URIs included within diamonds <> and encode them
    # TODO: should be put as utils clearner
    matches = re.findall(r'\<(.*?)\>', complete)
    matches = list(
        map((lambda x: {x: urllib.parse.quote(x, safe='http://')}), matches))

    for index in range(len(matches)):
        for key in matches[index]:
            keyword_processor.add_keyword(key, matches[index][key])

    complete_updated = keyword_processor.replace_keywords(complete)

    g = rdflib.Graph()
    graph = g.parse(data=complete_updated, format='turtle')

    res = g.query(
        """
            SELECT (COUNT (DISTINCT ?s) AS ?num_entities)
            WHERE {
                ?s ?p ?o
            }
            """)

    for row in res:
        print("    * Number of entities in train: %s" % row)

    res = g.query(
        """
            SELECT (COUNT (*) AS ?num_triples)
            WHERE {
                ?s ?p ?o
            }
            """)

    for row in res:
        print("    * Number of triples in train: %s" % row)

    # ------ Extract data from valid rdf files
    complete = open(rdf_path + name + '/valid.nt').read()
    # Get the URIs included within diamonds <> and encode them
    # TODO: should be put as utils clearner
    matches = re.findall(r'\<(.*?)\>', complete)
    matches = list(
        map((lambda x: {x: urllib.parse.quote(x, safe='http://')}), matches))

    for index in range(len(matches)):
        for key in matches[index]:
            keyword_processor.add_keyword(key, matches[index][key])

    complete_updated = keyword_processor.replace_keywords(complete)

    g = rdflib.Graph()
    graph = g.parse(data=complete_updated, format='turtle')

    res = g.query(
        """
            SELECT (COUNT (DISTINCT ?s) AS ?num_entities)
            WHERE {
                ?s ?p ?o
            }
            """)

    for row in res:
        print("    * Number of entities in valid: %s" % row)

    res = g.query(
        """
            SELECT (COUNT (*) AS ?num_triples)
            WHERE {
                ?s ?p ?o
            }
            """)

    for row in res:
        print("    * Number of triples in valid: %s" % row)

    # ------ Extract data from test rdf files
    complete = open(rdf_path + name + '/valid.nt').read()
    # Get the URIs included within diamonds <> and encode them
    # TODO: should be put as utils clearner
    matches = re.findall(r'\<(.*?)\>', complete)
    matches = list(
        map((lambda x: {x: urllib.parse.quote(x, safe='http://')}), matches))

    for index in range(len(matches)):
        for key in matches[index]:
            keyword_processor.add_keyword(key, matches[index][key])

    complete_updated = keyword_processor.replace_keywords(complete)

    g = rdflib.Graph()
    graph = g.parse(data=complete_updated, format='turtle')

    res = g.query(
        """
            SELECT (COUNT (DISTINCT ?s) AS ?num_entities)
            WHERE {
                ?s ?p ?o
            }
            """)

    for row in res:
        print("    * Number of entities in test: %s" % row)

    res = g.query(
        """
            SELECT (COUNT (*) AS ?num_triples)
            WHERE {
                ?s ?p ?o
            }
            """)

    for row in res:
        print("    * Number of triples in test: %s" % row)

    # ------ Extract data from ground truth semantic models
    gt = json.load(open(gt_path + name + "_graph.json"))

    print('    * The number of nodes is equal to: '
          + str(len(gt['nodes'])))

    edges = list(filter(lambda e: e['value']['type']
                        != 'st_property_uri', gt['edges']))

    print('    * The number of edges is equal to: ' + str(len(edges)))
