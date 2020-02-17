# Test on generation of plausible semantic models
node run/graph.js \
data/taheriyan2016/task_04/semantic_types/updated/alaskaslist_st.json \
data/taheriyan2016/task_04/ontology/ontology.ttl \
schema:domainIncludes \
schema:rangeIncludes \
rdfs:Class \
data/taheriyan2016/task_04/semantic_models/plausibles/graph/alaskaslist

# Test on JARQL generation of plausible semantic models
node run/jarql.js \
data/taheriyan2016/task_04/semantic_types/updated/alaskaslist_st.json \
data/taheriyan2016/task_04/semantic_models/plausibles/graph/alaskaslist_graph.json \
data/taheriyan2016/task_04/ontology/classes.json \
data/taheriyan2016/task_04/semantic_models/plausibles/jarql/alaskaslist

# Test on basic refinement
node run/refinement.js \
data/taheriyan2016/task_04/semantic_types/updated/armslist_st.json \
data/taheriyan2016/task_04/learning_datasets/armslist/model_datasets/scores/best/500/score.json \
data/taheriyan2016/task_04/semantic_models/steiner/graph/armslist_steiner.json \
data/taheriyan2016/task_04/semantic_models/plausibles/graph/armslist_graph.json \
data/taheriyan2016/task_04/semantic_models/refined_basic/jarql/armslist
