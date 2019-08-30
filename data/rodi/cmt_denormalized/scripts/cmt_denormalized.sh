sudo chmod u+x data/rodi/cmt_denormalized/scripts/* 
data/rodi/cmt_denormalized/scripts/cmt_denormalized_graph.sh
data/rodi/cmt_denormalized/scripts/cmt_denormalized_steiner.sh
data/rodi/cmt_denormalized/scripts/cmt_denormalized_jarql.sh
data/rodi/cmt_denormalized/scripts/cmt_denormalized_rdf.sh
data/rodi/cmt_denormalized/scripts/cmt_denormalized_plausible_jarql.sh
data/rodi/cmt_denormalized/scripts/cmt_denormalized_plausible_rdf.sh
cat data/rodi/cmt_denormalized/output/cmt_denormalized*plausible* > data/rodi/cmt_denormalized/output/plausible_final.ttl 
cat data/rodi/cmt_denormalized/output/cmt_denormalized*steiner* > data/rodi/cmt_denormalized/output/steiner_final.ttl 
