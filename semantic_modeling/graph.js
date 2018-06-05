var Graph = require('graphlib').Graph;
var rdfstore = require('rdfstore');
var fs = require('fs');

var closure = function (c, o) {
    var closure_classes = [];
    // SPARQL query to get closure
    return closure_classes;
}

var relations = function (c_i, c_j, o) {

}

var add_semantic_types = function (path, graph) {
    // Load semantic types from file
    var types = JSON.parse(fs.readFileSync(path, 'utf8'));
    // For each semantic type, you add a class node, a data node, and a link with label and weight
    for (var t in types) {
        graph = create_semantic_types_nodes(types[t], graph)
    }
    return graph;
}

var create_semantic_types_nodes = function (st, graph) {
    // Analyze semantic types of one data source
    var attributes = st['attributes'];
    var semantic_types = st['semantic_types'];
    for (var i in attributes) {
        // Add class node
        // TODO: check if class node already exists in the graph
        var class_node = semantic_types[i][0].split("_")[0];
        graph.setNode(class_node);
        // Add data node
        var data_node = attributes[i];
        graph.setNode(data_node);
        graph.setEdge(class_node, data_node, { label: semantic_types[i][0].split("_")[1], weight: 1 });
    }
    return graph;
}

var add_closure = function (graph) {

}

var connect_class_nodes = function () {

}

var buildGraph = function (st_path, ont_path) {
    var g = new Graph();
    grap_with_semantic_types = add_semantic_types(st_path, g);

    // TODO: Get closures and relations according to the semantic types

    // Load domain ontology
    rdfstore.create(function (err, store) {
        var ontology = fs.readFileSync(ont_path).toString();
        store.load('text/turtle', ontology, function (err, data) {
            if (err) {
                console.log('Can not load the ontology!');
                return;
            }
        });
    });
}

exports.create_semantic_types_nodes = create_semantic_types_nodes;
exports.add_semantic_types = add_semantic_types;
exports.buildGraph = buildGraph;
