var Graph = require('graphlib').Graph;
var rdfstore = require('rdfstore');
var fs = require('fs');

var ε = 3;

var PREFIX = {
    'http://schema.org/': 'schema:',
    'http://www.w3.org/2000/01/rdf-schema#': 'rdfs:'
}

var CLOSURE_QUERY = function(class_node) {
    var query = `PREFIX schema: <http://schema.org/>
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

var INHERITED_PROPERTIES_QUERY = function(c_domain, c_range, p_domain, p_range) {
    // I need to specify also p_range and p_domain, because they can differ between ontologies
    var query = `PREFIX schema: <http://schema.org/>
                 PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                 SELECT ?inherited_properties ?domain WHERE {
                     ?inherited_properties ${p_domain} ${c_domain} .
                     ?inherited_properties ${p_range} ${c_range} .
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
        direct_properties = get_clean_results(results, 'direct_properties');
        cb(direct_properties);
    });
}

var get_all_inherited_properties = function(c_u, c_v, c_u_query, c_v_query, store) {
    prepare_super_classes(c_u, c_v, c_u_query, c_v_query, store)
        .then(function(super_classes) {
            assert.deepEqual('schema:Thing', super_classes[0]);
        })
        .catch(function(error) {
            console.log('Something went wrong trying to prepare super classes: ' + error);
        });

}

var get_inherited_properties = function(ip_query, store, cb) {
    // TODO: you need to distinguish the super classes
    var inherited_properties = [];
    store.execute(ip_query, function(success, results) {
        inherited_properties = get_clean_results(results, 'inherited_properties');
        cb(inherited_properties);
    });
}

var prepare_super_classes = function(c_u, c_v, c_u_query, c_v_query, store) {
    return new Promise(function(resolve, reject) {
        var c_u_classes = [];
        var c_v_classes = [];
        get_all_super_classes(c_u_query, store, c_u_classes)
            .then(function() {
                get_all_super_classes(c_v_query, store, c_v_classes);
            })
            .then(function() {
                // I need to keep the information related to the specific super class
                var super_classes = [];
                super_classes[c_u] = c_u_classes;
                super_classes[c_v] = c_v_classes;
                resolve(super_classes);
            })
            .catch(function(error) {
                console.log('Something went wrong trying to get super classes: ' + error);
                reject();
            });
    });
}

// This function simulate the path expression * implemented in SPARQL 1.1 (https://www.w3.org/TR/sparql11-property-paths/)
// In other words, this function get super classes at any level of an ontology class
var get_all_super_classes = function(sc_query, store, all_super_classes) {
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
                        var query_result = results[r]['all_super_classes']['value'];
                        query_result = clean_prefix(query_result);
                        all_super_classes.push(query_result);
                        var new_query = SUPER_CLASSES_QUERY(query_result);
                        get_all_super_classes(new_query, store, all_super_classes)
                            .then(function() {
                                resolve(all_super_classes);
                            }, function(error) {
                                reject(error);
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
    var closure_classes = [];
    store.execute(closure_query, function(success, results) {
        closure_classes = get_clean_results(results, 'closure_classes');
        cb(closure_classes);
    });
}

var clean_prefix = function(uri) {
    for (var p in PREFIX) {
        if (uri.indexOf(p) !== -1)
            uri = uri.replace(p, PREFIX[p]);
    }
    return uri;
}

var get_clean_results = function(results, variable) {
    var r = [];
    for (var c in results) {
        var query_result = results[c][variable]['value'];
        query_result = clean_prefix(query_result);
        r.push(query_result);
    }
    return r;
}

var remove_array_duplicates = function(a) {
    for (var i = 0; i < a.length; ++i) {
        for (var j = i + 1; j < a.length; ++j) {
            if (a[i] === a[j])
                a.splice(j--, 1);
        }
    }
    return a;
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
exports.get_inherited_properties = get_inherited_properties;
exports.prepare_super_classes = prepare_super_classes;
exports.get_all_super_classes = get_all_super_classes;
exports.add_semantic_types = add_semantic_types;
exports.create_semantic_types_nodes = create_semantic_types_nodes;
exports.add_closures = add_closures;
exports.get_closures = get_closures;
exports.buildGraph = buildGraph;
