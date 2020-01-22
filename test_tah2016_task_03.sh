node run/graph.js \
data/taheriyan2016/task_03/semantic_types/updated/s01-cb_st.json \
data/taheriyan2016/task_03/ontology/ontology.ttl \
rdfs:domain \
rdfs:range \
owl:Class \
data/taheriyan2016/task_03/semantic_models/plausibles/graph/s01-cb

# JARQL representing all plausible semantic models of s04-ima-artworks.json
node run/jarql.js \
data/taheriyan2016/task_03/semantic_types/updated/s04-ima-artworks_st.json \
data/taheriyan2016/task_03/semantic_models/plausibles/graph/s04-ima-artworks_graph.json \
data/taheriyan2016/task_03/ontology/classes.json \
data/taheriyan2016/task_03/semantic_models/plausibles/jarql/s04-ima-artworks
