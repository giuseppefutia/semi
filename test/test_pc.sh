node run/graph.js data/pc/semantic_types/Z4ADEA9DE4_st.json data/pc/ontology/ontology.ttl rdfs:domain rdfs:range owl:Class data/pc/semantic_models/Z4ADEA9DE4
node run/steiner_tree.js data/pc/semantic_types/Z4ADEA9DE4_st.json data/pc/semantic_models/Z4ADEA9DE4_graph.json data/pc/semantic_models/Z4ADEA9DE4
node run/jarql.js data/pc/semantic_types/Z4ADEA9DE4_st.json data/pc/semantic_models/Z4ADEA9DE4_steiner.json data/pc/ontology/classes.json data/pc/semantic_models/Z4ADEA9DE4
./jarql.sh data/pc/input/Z4ADEA9DE4.json data/pc/semantic_models/Z4ADEA9DE4.query > data/pc/output/Z4ADEA9DE4.ttl
node run/jarql.js data/pc/semantic_types/Z4ADEA9DE4_st.json data/pc/semantic_models/Z4ADEA9DE4_graph.json data/pc/ontology/classes.json data/pc/semantic_models/Z4ADEA9DE4_plausible
./jarql.sh data/pc/input/Z4ADEA9DE4.json data/pc/semantic_models/Z4ADEA9DE4_plausible.query > data/pc/output/Z4ADEA9DE4_plausible.ttl
node run/refinement.js data/pc/semantic_types/Z4ADEA9DE4_st.json data/pc/model_datasets/scores/pc/6000/score.json data/pc/semantic_models/Z4ADEA9DE4_steiner.json data/pc/semantic_models/Z4ADEA9DE4_graph.json data/pc/semantic_models/Z4ADEA9DE4
node run/jarql.js data/pc/semantic_types/Z4ADEA9DE4_st.json data/pc/semantic_models/Z4ADEA9DE4_refined_graph.json data/pc/ontology/classes.json data/pc/semantic_models/Z4ADEA9DE4_refined
./jarql.sh data/pc/input/Z4ADEA9DE4.json data/pc/semantic_models/Z4ADEA9DE4_refined.query > data/pc/output/Z4ADEA9DE4_refined.ttl
