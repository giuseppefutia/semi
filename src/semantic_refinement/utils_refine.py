import torch
import numpy as np
import csv
import json
import os
import subprocess
from subprocess import Popen, PIPE
import re
import urllib.parse
import rdflib
from flashtext import KeywordProcessor
keyword_processor = KeywordProcessor()


def get_dictionaries(entities_dict_path, relations_dict_path):
    f = open(entities_dict_path)
    entities = csv.reader(f, delimiter='\t')
    entities_dict = {}
    for e in entities:
        entities_dict[e[1]] = e[0]

    f = open(relations_dict_path)
    relations = csv.reader(f, delimiter='\t')
    relations_dict = {}
    for r in relations:
        relations_dict[r[1]] = r[0]

    return entities_dict, relations_dict


def get_embeddings(entities_emb_path, relations_emb_path):
    f = open(entities_emb_path)
    entities_emb = json.load(f)
    entities_emb_dict = {}
    for e in entities_emb:
        entities_emb_dict[str(e['id'])] = e['emb']

    f = open(relations_emb_path)
    relation_emb = json.load(f)
    relations_emb_dict = {}
    for r in relation_emb:
        relations_emb_dict[str(r['id'])] = r['emb']

    return entities_emb_dict, relations_emb_dict


def encode_rdf_st(rdf_path):
    f = open(os.path.join(rdf_path), 'r')
    rdf_text = f.read()

    # Get the URIs included within diamonds <> and encode them
    matches = re.findall(r'\<(.*?)\>', rdf_text)
    matches = list(
        map((lambda x: {x: urllib.parse.quote(x, safe='http://')}), matches))

    for index in range(len(matches)):
        for key in matches[index]:
            keyword_processor.add_keyword(key, matches[index][key])

    rdf_updated = keyword_processor.replace_keywords(rdf_text)

    return rdf_updated


def get_target_embeddings(rdf, entities_dict, entities_emb_dict):
    entities_source_dict = {}
    g = rdflib.Graph()
    graph = g.parse(data=rdf, format='turtle')
    for s, p, o in g:
        s = str(s)
        id = entities_dict[s]
        if entities_source_dict.get(s) == None:
            entities_source_dict[s] = {}
            entities_source_dict[s]['id'] = id
            entities_source_dict[s]['emb'] = entities_emb_dict[id]

    return entities_source_dict


def get_relations_embeddings(relations_dict, relations_emb_dict):
    relations_learnt_dict = {}
    for k, v in relations_dict.items():
        relations_learnt_dict[k] = {}
        relations_learnt_dict[k]['id'] = v
        relations_learnt_dict[k]['emb'] = relations_emb_dict[v]

    return relations_learnt_dict


def add_semantic_model_entities(jarql_path, entities_source_dict):
    f = open(jarql_path)
    jarql = f.read()

    # Get the basic uri included in the BIND section and encode them
    uri_matches = re.findall(r'BIND \(URI\(CONCAT\(\'(.*?)\'\,\?', jarql)
    uri_matches = list(
        map((lambda x: urllib.parse.quote(x, safe='http://')), uri_matches))

    # Get the entities in the BIND section
    sm_ent_matches = re.findall(r'\)\) as (.*?)\)', jarql)

    # Create a dictionary with uris and semantic model entities
    sm_entities = {key: value for key,
                   value in zip(uri_matches, sm_ent_matches)}

    # Enrich the entities source dictionary with the related semantic model entity
    for k, v in entities_source_dict.items():
        for sm_k, sm_v in sm_entities.items():
            if sm_k in k:
                entities_source_dict[k]['entity'] = sm_v

    return entities_source_dict


def get_semantic_relations(jarql_path, relations_emb_dict):
    f = open(jarql_path)
    jarql = f.read()

    # Get semantic model triples
    matches = re.findall(r'\?(.*?)\.', jarql)

    # Remove semantic types
    matches = list(filter(lambda x: (not 'rdf:type' in x), matches))

    # Expand urls of the relations
    semantic_relations = []
    for k, v in PREFIX.items():
        for triple in matches:
            if v in triple:
                triple = triple.replace(
                    v, urllib.parse.quote(k, safe='http://'))
                semantic_relations.append(triple)

    # Filter using the relations embedding
    filtered_relations = []
    for k in relations_emb_dict.items():
        for triple in semantic_relations:
            if k[0] in triple:
                filtered_relations.append(triple)

    return filtered_relations


def create_relation_jarqls(jarql_path, relations, refined_path):
    f = open(jarql_path)
    jarql = f.read()

    # Prepare output path for JARQLs (create folder if not exist)
    source_name = os.path.basename(jarql_path).replace('.query', '')
    output_path = refined_path + 'relations/' + source_name + '/jarql/'

    if not os.path.isdir(output_path):
        try:
            os.makedirs(output_path)
        except OSError:
            print ('** WARNING: Creation of the directory %s failed' %
                   output_path)
        else:
            print ('Successfully created the directory %s ' % output_path)

    # Remove anything in the CONSTRUCT {..} and fill it with the relation
    # XXX This approach to clean works only in the case of JARQL generated by SeMi: need to be improved
    first_pos = jarql.find('CONSTRUCT {')
    last_pos = jarql.find('WHERE')

    for r in relations:
        # XXX Should filter some relations that are not object properties
        predicate = r.split(' ')[1]

        if (predicate != 'http://schema.org/description'):
            # Reduce url of the predicate to the name space
            new_predicate = from_uri_to_ns(predicate)
            r = r.replace(predicate, new_predicate)

            # Fill the CONSTRUCT with the JARQL
            clean_jarql = jarql.replace(
                jarql[first_pos + 12:last_pos - 3], '    ?' + r + '.')

            # Print
            f = open(output_path + new_predicate + '.jarql', 'w')
            f.write(clean_jarql)
            f.close()


def create_relation_rdfs(jarql_path, refined_path, source_path):
    # Prepare output path for RDFs (create folder if not exist)
    source_name = os.path.basename(jarql_path).replace('.query', '')
    input_path = refined_path + 'relations/' + source_name + '/jarql/'
    output_path = refined_path + 'relations/' + source_name + '/rdf/'

    if not os.path.isdir(output_path):
        try:
            os.makedirs(output_path)
        except OSError:
            print ('** WARNING: Creation of the directory %s failed' %
                   output_path)
        else:
            print ('Successfully created the directory %s ' % output_path)

    # Loop on JARQL files including the relations
    jarql_files = [f for f in os.listdir(
        input_path) if os.path.isfile(os.path.join(input_path, f))]

    for j in jarql_files:
        # Run the JARQL script and store RDF files
        j = j.replace('.jarql', '')
        session = subprocess.check_call('./jarql.sh'
                                        + ' ' + source_path
                                        + ' ' + os.path.join(input_path, j + '.jarql')
                                        + ' > ' + os.path.join(output_path, j + '.rdf'), shell=True)


def compute_relations_score_avg(jarql_path, refined_path, entities_emb, relations_emb):
    # Load RDF files of learnt relations
    source_name = os.path.basename(jarql_path).replace('.query', '')
    rdf_paths = refined_path + 'relations/' + source_name + '/rdf/'
    rdf_files = [f for f in os.listdir(
        rdf_paths) if os.path.isfile(os.path.join(rdf_paths, f))]

    # Prepare dictionaries
    predicate_scores_sum = {}
    predicate_occs = {}
    predicate_scores_avg = {}

    # Parse RDF files as RDF Graphs
    for file in rdf_files:
        predicate = file.replace('.rdf', '')

        predicate_scores_sum[predicate] = 0
        predicate_occs[predicate] = 0
        predicate_scores_avg[predicate] = 0

        f = open(rdf_paths + file)
        rdf = f.read()  # TODO encode RDF file before loading
        g = rdflib.Graph()
        graph = g.parse(data=rdf, format='turtle')

        for s, p, o in g:
            # Encode URLs to get the correct key for the embeddings
            s = urllib.parse.quote(str(s), safe='http://')
            p = urllib.parse.quote(str(p), safe='http://')
            o = urllib.parse.quote(str(o), safe='http://')

            # Get embeddings
            emb_s = np.asarray(entities_emb[s]['emb'])
            emb_p = np.asarray(relations_emb[p]['emb'])
            emb_o = np.asarray(entities_emb[o]['emb'])

            score = calc_score(emb_s, emb_p, emb_o)

            predicate_occs[predicate] += 1
            predicate_scores_sum[predicate] += score.item()

        # Compute the average
        predicate_scores_avg[predicate] = predicate_scores_sum[predicate] / \
            predicate_occs[predicate]

    return predicate_scores_avg


def update_weights_plausible_semantic_model(plausible_json_path, complete_rdf_path, plausible_refined_path, scores):
    # Load the complete.nt file adopted for training and evaluation as RDF Graph
    f = open(complete_rdf_path)
    rdf = f.read()
    g = rdflib.Graph()
    graph = g.parse(data=rdf, format='turtle')

    # Count the occurrences of each predicate and compute the reciprocal value
    predicates_occs = {}
    predicates_recs = {}
    for k, v in scores.items():
        predicates_occs[k] = 0
        predicates_recs[k] = 0

        # Get the long uri of the predicate
        long_uri_k = from_ns_to_uri(k)
        for s, p, o in g:
            if str(p) == long_uri_k:
                predicates_occs[k] += 1

        # Compute the reciprocal value
        predicates_recs[k] = 1 / predicates_occs[k]

    # Load JSON serialization of the plausible semantic model
    f = open(plausible_json_path)
    plausible_sm = json.load(f)

    # Process predicate scores and check if their values are greater than the predicate reciprocal values
    for k, v in scores.items():
        if v > predicates_recs[k]:
            edges = plausible_sm['edges']

            # Update weights in the plausible semantic model
            for e in edges:
                if e['value']['label'] == k:
                    e['weight'] = v
                    e['value']['weight'] = v
                    e['value']['type'] = 'updated'

    # Store updated semantic models
    f = open(plausible_refined_path, 'w')
    json.dump(plausible_sm, f, indent=4)


def compute_steiner_tree(semantic_type_path, refined_path, output_path):
    session = subprocess.check_call('node run/steiner_tree.js'
                                    + ' ' + semantic_type_path
                                    + ' ' + refined_path
                                    + ' ' + output_path, shell=True)


def calc_score(s_emb, p_emb, o_emb):
    # DistMult
    s = torch.from_numpy(s_emb)
    r = torch.from_numpy(p_emb)
    o = torch.from_numpy(o_emb)
    score = torch.sigmoid(torch.sum(s * r * o, dim=0))

    return score


def from_uri_to_ns(long_uri):
    for k, v in PREFIX.items():
        if k in long_uri:
            ns = long_uri.replace(k, v)

    return ns


def from_ns_to_uri(ns):
    for k, v in PREFIX.items():
        if v.replace(':', '') == ns.split(':')[0]:
            long_uri = k + ns.split(':')[1]

    return long_uri


PREFIX = {
    'http://schema.org/': 'schema:',
    'http://www.w3.org/2000/01/rdf-schema#': 'rdfs:',
    'http://purl.org/procurement/public-contracts#': 'pc:',
    'http://purl.org/goodrelations/v1#': 'gr:',
    'http://www.w3.org/2002/07/owl#': 'owl:',
    'http://www.w3.org/ns/adms#': 'adms:',
    'http://vocab.deri.ie/c4n#': 'c4n:',
    'http://purl.org/dc/terms/': 'dcterms:',
    'http://xmlns.com/foaf/0.1/': 'foaf:',
    'http://www.loted.eu/ontology#': 'loted:',
    'http://reference.data.gov.uk/def/payment#': 'payment:',
    'http://purl.org/linked-data/cube#': 'qb:',
    'http://www.w3.org/1999/02/22-rdf-syntax-ns#': 'rdf:',
    'http://www.w3.org/2004/02/skos/core#': 'skos:',
    'http://purl.org/vocab/vann/': 'vann:',
    'http://www.w3.org/2001/XMLSchema#': 'xsd:',
    'http://www.w3.org/2002/07/owl#': 'owl:',
    'http://conference#': 'conference:',
    'http://cmt#': 'cmt:',
    'http://sigkdd#': 'sigkdd:',
    'http://erlangen-crm.org/current/': 'crm:',
    'http://collection.britishmuseum.org/id/': 'id:',
    'http://collection.britishmuseum.org/id/thesauri/': 'idThes:',
    'http://www.w3.org/ns/prov#': 'prov:',
    'http://collection.britishmuseum.org/id/ontology/': 'bmo:',
    'http://www.americanartcollaborative.org/ontology/': 'aac-ont:',
    'http://www.w3.org/2008/05/skos#': 'skos2:',
    'http://rdvocab.info/ElementsGr2/': 'ElementsGr2:',
    'http://rdvocab.info/uri/schema/FRBRentitiesRDA/': 'rdvocab-schema:',
    'http://www.europeana.eu/schemas/edm/': 'edm:',
    'http://schema.dig.isi.edu/ontology/': 'schema-dig:',
    'http://www.w3.org/2003/01/geo/wgs84_pos#': 'geo:',
    'http://purl.org/vocab/frbr/core#': 'frbr:',
    'http://www.w3.org/2000/10/swap/pim/contact#': 'swap:',
    'http://www.cidoc-crm.org/rdfs/cidoc-crm#': 'cidoc-crm:',
    'http://metadata.net/harmony/abc#': 'abc:',
    'http://www.loa-cnr.it/ontologies/DOLCE-Lite.owl#': 'DOLCE-Lite:',
    'http://purl.org/dc/dcmitype/': 'dcmitype:',
    'http://web.resource.org/cc/': 'msg0:',
    'http://www.isi.edu/~pan/damltime/time-entry.owl#': 'time-entry:',
    'http://xmlns.com/wordnet/1.6/Work~2': 'wordnet:',
    'http://americanart.si.edu/ontology/': 'saam-ont:',
    'http://www.openarchives.org/ore/terms/': 'ore:',
    'http://scharp.usc.isi.edu/ontology/': 'scharp:',
    'http://dig.isi.edu/ontology/memex/': 'memex:',
    'http://purl.org/dc/elements/1.1/': 'dc:'
}
