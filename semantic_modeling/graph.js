var Graph = require('graphlib').Graph;
var rdfstore = require('rdfstore');
var fs = require('fs');

var PREFIX = {
    'http://schema.org/': 'schema:',
    'http://www.w3.org/2000/01/rdf-schema#': 'rdfs:'
}

var CLOSURE_QUERY = function(class_node) {
    var query = `PREFIX schema:  <http://schema.org/>
                 PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                 SELECT ?closure_classes WHERE {
                     { ${class_node} ?property ?closure_classes.
                     ?closure_classes a rdfs:Class }
                     UNION { ?closure_classes ?property ${class_node} .
                     ?closure_classes a rdfs:Class }
                 }`;
    return query;
}

var SUPER_CLASSES_QUERY = function(class_node) {
    var query = `PREFIX schema: <http://schema.org/>
                 PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                 SELECT ?all_super_classes WHERE {
                     ${class_node} rdfs:subClassOf ?all_super_classes
                 }`;
    return query;
}

var get_class_nodes = function(graph) {
    var class_nodes = [];
    var nodes = graph.nodes();
    for (var n in nodes) {
        if (graph.node(nodes[n])['type'] === 'class_uri')
            class_nodes.push(nodes[n]);
    }
    return class_nodes;
}

var add_relations = function() {
    // TODO: function implementation
}

var get_relations = function(relations_query, store, cb) {
    // TODO: function implementation
    // Call get_direct_properties
    // TODO: once implemented check the Mohsen implementation
    // Call get_inherited_properties in a smart way, involving all super classes
}

var get_direct_properties = function(dp_query, store, cb) {
    var direct_properties = [];
    store.execute(dp_query, function(success, results) {
        for (var r in results) {
            var query_result = results[r]['direct_properties']['value']; // direct_properties is a protected word for the query
            query_result = clean_prefix(query_result);
            direct_properties.push(query_result);
        }
        cb(direct_properties);
    });
}

var get_inherited_properties = function(ip_query, store, cb) {
    var inherited_properties = [];
    store.execute(dp_query, function(success, results) {
        for (var r in results) {
            var query_result = results[r]['inherited_properties']['value']; // inherited_properties is a protected word for the query
            query_result = clean_prefix(query_result);
            inherited_properties.push(query_result);
        }
        cb(inherited_properties);
    });
}

// This function simulate the path expression * implemented in SPARQL 1.1 (https://www.w3.org/TR/sparql11-property-paths/)
// In other words, this function get super classes at any level of an ontology class
function get_all_super_classes(sc_query, store, all_super_classes) {
    // TODO: check where to clean Thing
    return new Promise(function(resolve, reject) {
        store.execute(sc_query, function(success, results) {
            if (success !== null) {
                reject(success);
            } else {
                if (results.length === 0) {
                    resolve(all_super_classes);
                } else {
                    for (var r in results) {
                        var query_result = results[r]['all_super_classes']['value']; // all_super_classes is a protected word for the query
                        query_result = clean_prefix(query_result);
                        all_super_classes.push(query_result);
                        var new_query = SUPER_CLASSES_QUERY(query_result);
                        get_all_super_classes(new_query, store, all_super_classes)
                            .then(function() {
                                resolve(all_super_classes);
                            });
                    }
                }
            }
        });
    });
}

var add_semantic_types = function(path, graph) {
    // Load semantic types from file
    var types = JSON.parse(fs.readFileSync(path, 'utf8'));
    // For each semantic type, you add a class node, a data node, and a link with label and weight
    for (var t in types) {
        graph = create_semantic_types_nodes(types[t], graph)
    }
    return graph;
}

var create_semantic_types_nodes = function(st, graph) {
    // Analyze semantic types of a single data source
    var attributes = st['attributes'];
    var semantic_types = st['semantic_types'];
    for (var i in attributes) {
        // Add class node
        // TODO: check if a class node already exists in the graph.
        var class_node = semantic_types[i][0].split("_")[0];
        graph.setNode(class_node, {
            type: 'class_uri'
        });
        // Add data node
        var data_node = attributes[i];
        graph.setNode(data_node, {
            type: 'attribute_name'
        });
        // Add edge
        graph.setEdge(class_node, data_node, {
            label: semantic_types[i][0].split("_")[1],
            type: 'property_uri',
            weight: 1
        });
    }
    return graph;
}

var add_closures = function(closure_classes, graph) {
    // Closure classes are retrieved with SPARQL queries on the ontology
    // TODO: check if a class node already exists in the graph. You can write a unique function.
    for (var c in closure_classes) {
        graph.setNode(closure_classes[c], {
            type: 'class_uri'
        });
    }
    return graph;
}

var get_closures = function(closure_query, store, cb) {
    // For a class node in the graph, retrieve all super classes in the domain ontology
    // Make SPARQL query
    store.execute(closure_query, function(success, results) {
        // Process query results
        var closure_classes = [];
        for (var c in results) {
            var query_result = results[c]['closure_classes']['value']; // closure_classes is a protected word for the query
            query_result = clean_prefix(query_result);
            closure_classes.push(query_result);
        }
        cb(closure_classes);
    });
}

var connect_class_nodes = function() {
    // TODO
}

var clean_prefix = function(uri) {
    for (var p in PREFIX) {
        if (uri.indexOf(p) !== -1)
            uri = uri.replace(p, PREFIX[p])
    }
    return uri;
}

var buildGraph = function(st_path, ont_path) {
    var g = new Graph();
    // Add semantic types
    grap_with_semantic_types = add_semantic_types(st_path, g);
    // Load domain ontology
    rdfstore.create(function(err, store) {
        var ontology = fs.readFileSync(ont_path).toString();
        store.load('text/turtle', ontology, function(err, data) {
            if (err) {
                console.log('Can not load the ontology!');
                return;
            }
            // Add closures
            var class_nodes = get_class_nodes(grap_with_semantic_types);
            for (var cn in class_nodes) {
                var class_query = class_nodes[cn];
                var closure_query = CLOSURE_QUERY(class_query);
                get_closures(closure_query, store, function(closure_classes) {
                    add_closures(closure_classes, grap_with_semantic_types);
                });
            }
        });
    });
}

// Export for testing
exports.get_class_nodes = get_class_nodes;
exports.get_direct_properties = get_direct_properties;
exports.get_all_super_classes = get_all_super_classes;
exports.add_semantic_types = add_semantic_types;
exports.create_semantic_types_nodes = create_semantic_types_nodes;
exports.add_closures = add_closures;
exports.get_closures = get_closures;
exports.buildGraph = buildGraph;
