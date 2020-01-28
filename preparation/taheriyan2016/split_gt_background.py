import os
import sys
import re
import time
import rdflib
import urllib.parse
from functools import *
from flashtext import KeywordProcessor
keyword_processor = KeywordProcessor()

# Read all background RDF files
data_folder = sys.argv[1]
rdf_path = 'data/taheriyan2016/' + data_folder + '/background/'
output_path = 'data/taheriyan2016/' + data_folder + '/learning_datasets/'
rdf_files = os.listdir(rdf_path)

print('\nFiles to process: ')
print(rdf_files)

start_time = time.time()

for rdf_file in rdf_files:
    print('\nEncoding ' + rdf_file + '...')
    start_enc_time = time.time()

    f = open(os.path.join(rdf_path, rdf_file), 'r')
    rdf_text = f.read()

    # Get the URIs included within diamonds <> and encode them
    matches = re.findall(r'\<(.*?)\>', rdf_text)
    matches = list(
        map((lambda x: {x: urllib.parse.quote(x, safe='http://')}), matches))

    for index in range(len(matches)):
        for key in matches[index]:
            keyword_processor.add_keyword(key, matches[index][key])

    rdf_updated = keyword_processor.replace_keywords(rdf_text)

    print('End encoding of ' + rdf_file + '.')
    print("--- %s seconds ---" % (time.time() - start_enc_time))

    '''
    TODO: This can be useful in case of needs cleaning

    # Get the URIs included within diamonds <> and replace whites spaces and vertical lines
    matches = re.findall(r'\<(.*?)\>', rdf_text)
    matches = list(
        map((lambda x: {x: x.replace(' ', 'WSP').replace('|', 'VRT')}), matches))

    for index in range(len(matches)):
        for key in matches[index]:
            keyword_processor.add_keyword(key, matches[index][key])

    rdf_updated = keyword_processor.replace_keywords(rdf_text)

    print('End cleaning of ' + rdf_file + '.')
    print("--- %s seconds ---" % (time.time() - start_time))
    '''

    # Store train, validation, and test of updated background file
    g = rdflib.Graph()
    graph = g.parse(data=rdf_updated, format='turtle')

    # This graph will store only triples with URI, because we want to analyze only semantic relations
    complete = rdflib.Graph()

    for s, p, o in g:
        if str(o).find('http://') != -1:
            complete.add((s, p, o))

    seen_entities = {}
    seen_properties = {}
    train = rdflib.Graph()
    valid = rdflib.Graph()
    test = rdflib.Graph()

    # Simple algorithm to produce train, validation, and test
    print('\nBackground file: ' + rdf_file +
          '. Number of total triples: ' + str(len(complete)))

    # Define 5% of the complete dataset for test and validation
    validation_limit = len(complete) // 100 * 5
    test_limit = len(complete) // 100 * 5

    flag = 'valid'
    for s, p, o in complete:
        if str(s) not in seen_entities:
            train.add((s, p, o))
            seen_entities[str(s)] = 1
        elif str(o) not in seen_entities:
            train.add((s, p, o))
            seen_entities[str(o)] = 1
        elif str(p) not in seen_properties:
            train.add((s, p, o))
            seen_properties[str(p)] = 1
        else:
            if flag == 'valid' and len(valid) < validation_limit:
                flag = 'test'
                valid.add((s, p, o))
            elif flag == 'test' and len(test) < test_limit:
                flag = 'valid'
                test.add((s, p, o))
            else:
                train.add((s, p, o))

    print('\nBackground file ' + rdf_file + ' is splitted as follows: ')
    print('* num of training triples: ' + str(len(train)))
    print('* num of valid triples: ' + str(len(valid)))
    print('* num of test triples: ' + str(len(test)))

    # Create directory within learning_datasets for train, validation, and test
    base = os.path.basename(rdf_file)
    learning_folder = os.path.join(output_path, os.path.splitext(base)[0])
    if not os.path.exists(learning_folder):
        os.makedirs(learning_folder)

    # Print learning datasets
    complete_file = os.path.join(learning_folder, 'complete.nt')
    complete.serialize(destination=complete_file, format='nt')

    train_file = os.path.join(learning_folder, 'train.nt')
    train.serialize(destination=train_file, format='nt')

    valid_file = os.path.join(learning_folder, 'valid.nt')
    valid.serialize(destination=valid_file, format='nt')

    test_file = os.path.join(learning_folder, 'test.nt')
    test.serialize(destination=test_file, format='nt')

    print("\n--- Total processing time %s seconds ---" %
          (time.time() - start_time))
