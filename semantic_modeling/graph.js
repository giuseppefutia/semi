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

var add_semantic_types = function (graph) {
    // Load semantic types

    // For each semantic type, you add a class node, a data node, and a link with label and weight
    for (var t in types) {

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
    //console.log(graph);
    return graph;
}

var add_closure = function (graph) {

}

var connect_class_nodes = function () {

}

var buildGraph = function (path) {
    var g = new Graph();

    // TODO: Add semantic types

    // TODO: Get closures and relations according to the semantic types

    // Load domain ontology
    rdfstore.create(function (err, store) {
        var ontology = fs.readFileSync(path).toString();
        store.load('text/turtle', ontology, function (err, data) {
            if (err) {
                console.log('Can not load the ontology!');
                return;
            }
            console.log('Ontology is loaded!');
        });
    });
}

exports.create_semantic_types_nodes = create_semantic_types_nodes;
exports.buildGraph = buildGraph;
