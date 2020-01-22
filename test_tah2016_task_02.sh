# Graph including all plausible semantic models
node run/graph.js \
data/taheriyan2016/task_02/semantic_types/updated/s01-cb_st.json \
data/taheriyan2016/task_02/ontology/ontology.ttl \
rdfs:domain \
rdfs:range \
owl:Class \
data/taheriyan2016/task_02/semantic_models/plausibles/graph/s01-cb

# JARQL representing all plausible semantic models
node run/jarql.js \
data/taheriyan2016/task_02/semantic_types/updated/s01-cb_st.json \
data/taheriyan2016/task_02/semantic_models/plausibles/graph/s01-cb_graph.json \
data/taheriyan2016/task_02/ontology/classes.json \
data/taheriyan2016/task_02/semantic_models/plausibles/jarql/s01-cb

# Graph representing the steiner tree
node run/steiner_tree.js \
data/taheriyan2016/task_02/semantic_types/updated/s01-cb_st.json \
data/taheriyan2016/task_02/semantic_models/plausibles/graph/s01-cb_graph.json \
data/taheriyan2016/task_02/semantic_models/steiner/graph/s01-cb

# JARQL representing the steiner tree
node run/jarql.js \
data/taheriyan2016/task_02/semantic_types/updated/s01-cb_st.json \
data/taheriyan2016/task_02/semantic_models/steiner/graph/s01-cb_steiner.json \
data/taheriyan2016/task_02/ontology/classes.json \
data/taheriyan2016/task_02/semantic_models/steiner/jarql/s01-cb
