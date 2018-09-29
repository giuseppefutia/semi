var graphlib = require('graphlib');
var rdfstore = require('rdfstore');
var Graph = require('graphlib').Graph;
var graph_gen = require(__dirname + '/graph.js');
var sm_alg = require(__dirname + '/fast-steiner-tree.js');

var create_sm = (st_path, ont_path, p_domain, p_range) => {
    // Get semantic type file
    var types_file = JSON.parse(fs.readFileSync(st_path, 'utf8'));
    // Cycling on all semantic types
    for (var i in types_file) {
        var semantic_types = types_file[i]['semantic_types'];
        graph_gen.build_graph(st_path, ont_path, p_domain, p_range)
            .then(weighted_graph) {
                var sm = sm_alg.steiner_alg(weighted_graph, semantic_types);
            }.catch() {
                console.log('Error creating the semantic model');
            }
    }
}
