var fs = require('fs');
var graphlib = require('graphlib');
var rdfstore = require('rdfstore');
var Graph = require('graphlib').Graph;
var graph_gen = require(__dirname + '/../semantic_modeling/graph.js');
var sm_alg = require(__dirname + '/../semantic_modeling/fast-steiner-tree.js');

var create_sm = (st_path, ont_path, p_domain, p_range, o_class) => {
    // Get semantic type file
    var types_file = JSON.parse(fs.readFileSync(st_path, 'utf8'));
    // Cycling on all semantic types
    for (var i in types_file) {
        var attributes = types_file[i]['attributes'];
        graph_gen.build_graph(st_path, ont_path, p_domain, p_range, o_class)
            .then(function(g) {
                var graph = sm_alg.create_inverse_edges(g);
                var sm = sm_alg.steiner_alg(graph, attributes);
            }).catch(function() {
                console.log('Error creating the semantic model');
            });
    }
}

create_sm(__dirname + '/../data/evaluation/public-contracts/semantic_type/Z4ADEA9DE4_st.json',
          [__dirname + '/../data/evaluation/public-contracts/ontology/public-contracts.ttl'],
          'rdfs:domain',
          'rdfs:range',
          'owl:Class');
