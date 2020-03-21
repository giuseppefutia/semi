from utils_refine_occ import *
import sys
import time
from functools import *


def refine_semantic_model(source, aggregated):
    print('\n\n- File: ' + source)
    name = source.split('.')[0]

    # Prepare all base folders
    data = 'data/taheriyan2016/' + task
    learning = data + '/learning_datasets/' + name
    refined = data + '/refined_semantic_models/'
    evaluation = 'evaluation/taheriyan2016/' + task

    # Start processing
    print('\n    Get dictionaries...')
    # {'url_0': 'id_0',
    #  'url_1': 'id_1'}
    ent_dict_path = learning + '/dicts/entities.dict'
    rel_dict_path = learning + '/dicts/relations.dict'
    ent_dict, rel_dict = get_dictionaries(ent_dict_path, rel_dict_path)

    print('\n    Get embeddings of all entities and relations as dictionaries...')
    # {'id_0': [emb_0],
    #  'id_1': [emb_1]}
    best_score_path = learning + '/model_datasets/scores/best/'
    best_score_folder = os.listdir(best_score_path)

    if len(best_score_folder) != 1:
        raise Exception('There is more than one best folder!!!')

    ent_emb_path = best_score_path + best_score_folder[0] + '/emb_nodes.json'
    rel_emb_path = best_score_path + best_score_folder[0] + '/emb_rels.json'
    ent_emb, rel_emb = get_embeddings(ent_emb_path, rel_emb_path)

    print('\n    Get and encode RDF generated with semantic types of ' + name + '...')
    st_rdf_path = evaluation + '/semantic_models_gt/rdf_st/' + name + '.rdf'
    print('    Start encoding ' + name + '.rdf ...')
    st_rdf = encode_rdf_st(st_rdf_path)
    print('    .... end encoding ' + name + '.rdf')

    print('\n    New dict of entity embeddings included in ' + name + '.rdf...')
    # {url_0: {'id': 'id_0', 'emb': 'emb_0'}, {'url_1': ...}}
    ent_target_emb = get_target_embeddings(st_rdf, ent_dict, ent_emb)

    print('\n    New dict of relations embeddings learnt during the training...')
    rel_dict_emb = get_relations_embeddings(rel_dict, rel_emb)

    print('\n    Get triples from the plausible semantic model that include the learnt relations...')
    plausible_jarql_path = data + '/semantic_models/plausibles/jarql/' + name + '.query'
    learnt_relations = get_semantic_relations(
        plausible_jarql_path, rel_dict_emb)

    print('\n    Create a new JARQL file for each triple including the semantic relation of ' + name + '...')
    create_relation_jarqls(plausible_jarql_path, learnt_relations, refined)

    print('\n    Create a new RDF file for each JARQL created from each semantic relation...')
    create_relation_rdfs(plausible_jarql_path, refined, sources_path + source)

    print('\n    Compute the sum score for each triple including a learnt relation...')
    scores = compute_triple_score_avg(
        name, refined, ent_target_emb, rel_dict_emb, aggregated, evaluation)

    print('\n    Update weights in plausible semantic models...')
    plausible_json_path = data + \
        '/semantic_models/plausibles/graph/' + name + '_graph.json'
    complete_rdf_path = learning + '/complete.nt'
    refined_json_path = refined + '/plausibles_occ/graph/' + name + '_graph.json'
    update_weights_plausible_semantic_model(
        plausible_json_path, complete_rdf_path, refined_json_path, scores)

    print('\n    Compute updated steiner tree...')
    semantic_type_path = data + '/semantic_types/updated/' + name + '_st.json'
    refined_steiner_path = refined + '/steiner_occ/graph/' + name
    compute_steiner_tree(semantic_type_path,
                         refined_json_path, refined_steiner_path)

    print('\n    Create JARQL from the update steiner tree...')
    classes_path = data + '/ontology/classes.json'
    refined_steiner_path = refined_steiner_path + '_steiner.json'
    refined_jarql_path = refined + '/steiner_occ/jarql/' + name
    eval_jarql_path = evaluation + '/semantic_models_occ/jarql/' + name + '.query'
    create_refined_jarql(semantic_type_path, classes_path,
                         refined_steiner_path, refined_jarql_path, eval_jarql_path)


# Set the task for computing the refinement
task = sys.argv[1]

# Set score method computation
aggregated = sys.argv[2]

# Get all the source files: the source name will be used to get all necessary input files
sources_path = 'data/taheriyan2016/' + task + '/sources/updated_json/'
sources = os.listdir(sources_path)

if len(sys.argv) == 4:
    # Set the file to be processed (usually used for debugging)
    source = sys.argv[3]
    print('\n##### Start processing the single file ' + source)
    start_time = time.time()

    refine_semantic_model(source, aggregated)

    print('\n##### End processing the single file: ' + source)
    print("\n--- Total processing time %s seconds ---" %
          str((time.time() - start_time)))
else:
    # Process all the files within the task
    print('\n##### Start processing files for: ' + task)
    start_time = time.time()

    for source in sources:
        refine_semantic_model(source, aggregated)

    print('\n##### End processing files for: ' + task)
    print("\n--- Total processing time %s seconds ---" %
          str((time.time() - start_time)))
