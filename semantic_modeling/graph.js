var fs = require('fs');
var graphlib = require('graphlib');
var rdfstore = require('rdfstore');
var Graph = require('graphlib').Graph;
var utils = require(__dirname + '/utils.js');
var sparql= require(__dirname + '/sparql_queries.js');

var ε = 3;

var add_semantic_types = (st, graph) => {
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

var get_class_nodes = (graph) => {
    var class_nodes = [];
    var nodes = graph.nodes();
    for (var n in nodes) {
        if (graph.node(nodes[n])['type'] === 'class_uri')
            class_nodes.push(nodes[n]);
    }
    return class_nodes;
}

var get_closures = (closure_query, store) => {
    // Get nodes in the domain ontology that relate those semantic types
    return new Promise(function(resolve, reject) {
        store.execute(closure_query, function(success, results) {
            if (success !== null) reject(success);
            var closure_classes = utils.get_clean_results(results, 'closure_classes');
            resolve(closure_classes);
        });
    });
}

var add_closures = (closure_classes, graph) => {
    // Closure classes are retrieved with SPARQL queries on the ontology
    // TODO: check if a class node already exists in the graph. You can write a unique function.
    return new Promise(function(resolve, reject) {
        for (var c in closure_classes) {
            graph.setNode(closure_classes[c], {
                type: 'class_uri'
            });
        }
        resolve(graph);
    });
}

var get_direct_properties = (dp_query, store, subject, object) => {
    return new Promise(function(resolve, reject) {
        store.execute(dp_query, function(success, results) {
            if (success !== null) reject(success);
            var direct_properties = [];
            var cleaned_results = utils.get_clean_results(results, 'direct_properties');
            for (var i in cleaned_results) {
                direct_properties.push(utils.set_property(subject,
                    cleaned_results[i],
                    object,
                    'direct'));
            }
            resolve(direct_properties);
        });
    });
}

// This function simulate the path expression * implemented in SPARQL 1.1 (https://www.w3.org/TR/sparql11-property-paths/)
// In other words, this function get super classes at any level of an ontology class
var get_all_super_classes = (sc_query, store, all_super_classes) => {
    // TODO: check where to clean Thing
    return new Promise(function(resolve, reject) {
        store.execute(sc_query, function(success, results) {
            if (success !== null)
                reject(success);
            if (results.length === 0)
                resolve(utils.remove_array_duplicates(all_super_classes));

            // Recursion
            return results.reduce(function(promise, r) {
                var query_result = utils.clean_prefix(r['all_super_classes']['value']);
                all_super_classes.push(query_result);
                var new_query = sparql.SUPER_CLASSES_QUERY(query_result);
                get_all_super_classes(new_query, store, all_super_classes); // TODO: Do I need to catch the error?
            }, Promise.resolve())
        });
    });
}

// I need to get super classes of both two classes I am comparing to establish the relation weight
var prepare_super_classes = (c_u, c_v, c_u_query, c_v_query, store) => {
    return new Promise(function(resolve, reject) {
        var c_u_classes = [];
        var c_v_classes = [];
        get_all_super_classes(c_u_query, store, c_u_classes)
            .then(function() {
                get_all_super_classes(c_v_query, store, c_v_classes);
            })
            .then(function() {
                // I need to keep the information related to the specific class
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

var get_inherited_properties = (ip_query, store, c_u, c_v, inherited_properties) => {
    return new Promise(function(resolve, reject) {
        var subject = c_u;
        var object = c_v;
        store.execute(ip_query, function(success, results) {
            if (success !== null) reject(success);
            var cleaned_results = utils.get_clean_results(results, 'inherited_properties');
            for (var i in cleaned_results) {
                inherited_properties.push(utils.set_property(subject,
                    cleaned_results[i],
                    object,
                    'inherited'));
            }
            resolve(inherited_properties);
        });
    });
}

// In this function I call get_inherited_properties twice, in order to get also inverse properties
var get_inherited_and_inverse_properties = function(ip_query, iip_query, store, c_u, c_v) {
    return new Promise(function(resolve, reject) {
        var inherited_properties = [];
        var inverse_inherited_properties = [];
        // Get inherited properties
        get_inherited_properties(ip_query, store, c_u, c_v, inherited_properties)
            .then(function() {
                // Get inverse properties
                get_inherited_properties(iip_query, store, c_v, c_u, inverse_inherited_properties)
                    .then(function() {
                        var properties = inherited_properties.concat(inverse_inherited_properties);
                        resolve(properties);
                    })
                    .catch(function(error) {
                        reject(error);
                        console.log('Something went wrong getting inherited and inverse properties: ' + error);
                    });
            })
            .catch(function(error) {
                reject(error);
                console.log('Something went wrong getting inherited and inverse properties: ' + error);
            });
    });
}

var get_indirect_properties = function(c_u, c_v, p_domain, p_range, super_classes, store) {
    return new Promise(function(resolve, reject) {
        // This counter is useful to understand when stop!
        var counter = 1;
        var stop = super_classes[c_u].length * super_classes[c_v].length;
        var indirect_properties = [];
        for (var i in super_classes[c_u]) {
            for (var j in super_classes[c_v]) {
                // To get inherited and inverse inherited properties change the order of the classes passed as input
                var ip_query = sparql.INHERITED_PROPERTIES_QUERY(super_classes[c_u][i], super_classes[c_v][j], p_domain, p_range);
                var iip_query = sparql.INHERITED_PROPERTIES_QUERY(super_classes[c_v][j], super_classes[c_u][i], p_domain, p_range);
                get_inherited_and_inverse_properties(ip_query, iip_query, store, super_classes[c_u][i], super_classes[c_v][j])
                    .then(function(properties) {
                        if (counter !== stop) {
                            if (properties.length > 0)
                                indirect_properties = indirect_properties.concat(properties);
                            counter++;
                        } else resolve(indirect_properties);
                    })
                    .catch(function(error) {
                        reject(error);
                        console.log('Something went wrong getting all inherited properties: ' + error);
                    });
            }
        }
    });
}

// BUILD THE GRAPH
var initialize_ontology_storage = (ont_path) => {
    return new Promise(function(resolve, reject) {
        rdfstore.create(function(err, store) {
            var ontology = fs.readFileSync(ont_path).toString();
            store.load('text/turtle', ontology, function(err, data) {
                if (err) reject(err);
                resolve(store);
            });
        });
    });
}

var build_graph = (st_path, ont_path) => {
    // Create a new graph
    var graph = new Graph({
        multigraph: true
    });
    // Add semantic types to the graph
    var types = JSON.parse(fs.readFileSync(st_path, 'utf8'));
    for (var t in types) {
        graph = add_semantic_types(types[t], graph)
    }
    // Promises sequence begins
    var sequence = Promise.resolve();
    sequence.then(function() {
        // Initialize graph storage
        console.log();
        console.log('Initializing graph...');
        return initialize_ontology_storage(ont_path);
    }).catch(function(err) {
        console.log('Error in the initialization stage:');
        console.log(err);
    }).then(function(store) {
        // Get closures
        console.log('Adding closures...');
        return get_class_nodes(graph).reduce(function(closure_sequence, class_node) {
            var query = sparql.CLOSURE_QUERY(class_node);
            return get_closures(query, store);
        }, Promise.resolve());
    }).catch(function(err) {
        console.log('Error in the closure stage:');
        console.log(err);
    }).then(function() {
        console.log('Graph building complete!');
    });
}
// Export for testing
exports.add_semantic_types = add_semantic_types;
exports.get_class_nodes = get_class_nodes;
exports.get_closures = get_closures;
exports.add_closures = add_closures;
exports.get_direct_properties = get_direct_properties;
exports.get_all_super_classes = get_all_super_classes;
exports.prepare_super_classes = prepare_super_classes;
exports.get_inherited_properties = get_inherited_properties;
exports.get_inherited_and_inverse_properties = get_inherited_and_inverse_properties;
exports.get_indirect_properties = get_indirect_properties;
exports.build_graph = build_graph;
