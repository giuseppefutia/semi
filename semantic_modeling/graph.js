var Graph = require('graphlib').Graph;
var rdfstore = require('rdfstore');
var fs = require('fs');

var PREFIX = {
	'http://schema.org/': 'schema:',
	'http://www.w3.org/2000/01/rdf-schema\#>': 'rdfs:'
}

var get_class_nodes = function (graph) {
    var class_nodes = [];
    var nodes = graph.nodes();
    for (var n in nodes) {
        if (graph.node(nodes[n])['type'] === 'class_node')
            class_nodes.push(nodes[n]);
    }
    return class_nodes;
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
        // TODO: check if a class node already exists in the graph.
        var class_node = semantic_types[i][0].split("_")[0];
        graph.setNode(class_node, {type: 'class_node'});
        // Add data node
        var data_node = attributes[i];
        graph.setNode(data_node, {type: 'data_node'});
        graph.setEdge(class_node, data_node, { label: semantic_types[i][0].split("_")[1], weight: 1 });
    }
    return graph;
}

var add_closure = function (closure_classes, graph) {
    // Closure classes are retrieved with SPARQL queries on the ontology
    // TODO: check if a class node already exists in the graph. You can write a unique function.
    for (var c in closure_classes) {
        graph.setNode(closure_classes[c])
    }
}

var get_closures = function (closure_query, store, cb) {
    // For a class node in the graph, retrieve all super classes in the domain ontology
    // Make SPARQL query
    store.execute(closure_query, function (success, results) {
        // Process query results
        var closure_classes = [];
        for (var c in results) {
            var query_result = results[c]['super_classes']['value']; // super_classes is a protected word for the query
            for (var p in PREFIX) {
                if (query_result.indexOf(p) !== -1)
                    query_result = query_result.replace(p, PREFIX[p]);
            }
            closure_classes.push(query_result);
        }
        cb(closure_classes);
    });
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

// Export for testing
exports.get_class_nodes = get_class_nodes;
exports.add_semantic_types = add_semantic_types;
exports.create_semantic_types_nodes = create_semantic_types_nodes;
exports.get_closures = get_closures;
exports.buildGraph = buildGraph;
