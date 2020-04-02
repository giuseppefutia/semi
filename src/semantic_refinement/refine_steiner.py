from utils_refine import *
import sys
import time


def refine_steiner(source):
    print('\n\n- File: ' + source)
    name = source.split('.')[0]

    # Prepare all base folders
    data = 'data/taheriyan2016/' + task
    learning = data + '/learning_datasets/' + name
    refined = data + '/refined_semantic_models/'
    evaluation = 'evaluation/taheriyan2016/' + task

    print('\n    Compute updated steiner tree...')
    semantic_type_path = data + '/semantic_types/updated/' + name + '_st.json'
    refined_json_path = refined + '/plausibles/graph/' + name + '_graph.json'
    refined_steiner_path = refined + '/steiner/graph/' + name
    compute_steiner_tree(semantic_type_path,
                         refined_json_path, refined_steiner_path)

    print('\n    Create JARQL from the update steiner tree...')
    classes_path = data + '/ontology/classes.json'
    refined_steiner_path = refined_steiner_path + '_steiner.json'
    refined_jarql_path = refined + '/steiner/jarql/' + name
    eval_jarql_path = evaluation + '/semantic_models_semi/jarql/' + name + '.query'
    create_refined_jarql(semantic_type_path, classes_path,
                         refined_steiner_path, refined_jarql_path, eval_jarql_path)


# Set the task for computing the refinement
task = sys.argv[1]

# Get all the source files: the source name will be used to get all necessary input files
sources_path = 'data/taheriyan2016/' + task + '/sources/updated_json/'
sources = os.listdir(sources_path)

if len(sys.argv) == 3:
    # Set the file to be processed (usually used for debugging)
    source = sys.argv[2]
    print('\n##### Start processing the single file ' + source)
    start_time = time.time()

    refine_steiner(source)

    print('\n##### End processing the single file: ' + source)
    print("\n--- Total processing time %s seconds ---" %
          str((time.time() - start_time)))
else:
    # Process all the files within the task
    print('\n##### Start processing files for: ' + task)
    start_time = time.time()

    for source in sources:
        refine_semantic_model(source)

    print('\n##### End processing files for: ' + task)
    print("\n--- Total processing time %s seconds ---" %
          str((time.time() - start_time)))
