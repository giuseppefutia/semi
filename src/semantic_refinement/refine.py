from utils_refine import *
import sys
import time
from functools import *


# Get dictionaries of entities and relations
#
# {'url_0': 'id_0',
#  'url_1': 'id_1'}

ent_dict_path = 'data/taheriyan2016/task_04/learning_datasets/armslist/dicts/entities.dict'
rel_dict_path = 'data/taheriyan2016/task_04/learning_datasets/armslist/dicts/relations.dict'
ent_dict, rel_dict = get_dictionaries(ent_dict_path, rel_dict_path)


# Get embeddings of entities and relations
#
# {'id_0': [emb_0],
#  'id_1': [emb_1]}
#
ent_emb_path = 'data/taheriyan2016/task_04/learning_datasets/armslist/model_datasets/scores/best/1000/emb_nodes.json'
rel_emb_path = 'data/taheriyan2016/task_04/learning_datasets/armslist/model_datasets/scores/best/1000/emb_rels.json'
ent_emb, rel_emb = get_embeddings(ent_emb_path, rel_emb_path)


# Get and encode RDF of semantic types related to the target source
rdf_path = 'evaluation/taheriyan2016/task_04/semantic_models_gt/rdf_st/armslist.rdf'
start_enc_time = time.time()
print('\nEncoding of "' + rdf_path + '"...')
print()
rdf = encode_rdf_st(rdf_path)

print('End encoding of "' + rdf_path + '".')
print("--- %s seconds ---" % (time.time() - start_enc_time))
print()

# Get embeddings of target source entities
#
# {url_0: {'id': 'id_0', 'emb': 'emb_0'}, {'url_1': ...}}
#
ent_target_emb = get_target_embeddings(rdf, ent_dict, ent_emb)


# Get embeddings of all relations
#
# {url_0: {'id': 'id_0', 'emb': 'emb_0'}, {'url_1': ...}}
#
rel_emb = get_relations_embeddings(rel_dict, rel_emb)


# Add semantic model entities to the target source embeddings
#
# {url_0: {'id': 'id_0', 'emb': 'emb_0', 'entity': '?entity1'}, {'url_1': ...}}
#
jarql_path = 'data/taheriyan2016/task_04/semantic_models/plausibles/jarql/armslist.query'
ent_target_emb = add_semantic_model_entities(jarql_path, ent_target_emb)

# Extract relations including only the object properties learnt during the training
learnt_relations = get_semantic_relations(jarql_path, rel_emb)

# Create new JARQLs for each relation
refined_path = 'data/taheriyan2016/task_04/refined_semantic_models/'
create_relation_jarqls(jarql_path, learnt_relations, refined_path)

# Create RDFs for each JARQLs relations
source_path = 'data/taheriyan2016/task_04/sources/updated_json/armslist.json'
create_relation_rdfs(jarql_path, refined_path, source_path)

# Compute the sum score for each relation
scores = compute_relations_score_avg(
    jarql_path, refined_path, ent_target_emb, rel_emb)

# Update weights in plausible semantic models
plausible_json_path = 'data/taheriyan2016/task_04/semantic_models/plausibles/graph/armslist_graph.json'
complete_rdf_path = 'data/taheriyan2016/task_04/learning_datasets/armslist/complete.nt'
refined_path = 'data/taheriyan2016/task_04/refined_semantic_models/plausibles/graph/armslist_graph.json'
update_weights_plausible_semantic_model(
    plausible_json_path, complete_rdf_path, refined_path, scores)

# Compute updated steiner tree
semantic_type_path = 'data/taheriyan2016/task_04/semantic_types/updated/armslist_st.json'
steiner_path = 'data/taheriyan2016/task_04/refined_semantic_models/steiner/graph/armslist'
compute_steiner_tree(semantic_type_path, refined_path, steiner_path)
