var fs = require('fs');
var graphlib = require('graphlib');
var rdfstore = require('rdfstore');
var Graph = require('graphlib').Graph;
var utils = require(__dirname + '/utils.js');
var sparql = require(__dirname + '/sparql_queries.js');

var ε = 3;

// TODO: create an high level representation of node and edge for checking inconsistencies
// TODO: better management of parameters and output
// TODO: better management of SPARQL query errors using store
// TODO: reduce rigth-depth of function that call two Promises
// TODO: modify indirect properties with the same changes of direct properties
// TODO: prefixes in one single place
// TODO: add edge weight for subclasses
// TODO: semantic_types in semantic type file should be an array of array?

var is_duplicate = (node, graph) => {
    var nodes = graph.nodes();
    for (var n in nodes) {
        if (graph.node(nodes[n])['label'] === node) {
            return true;
        }
    }
    return false;
}

var add_semantic_types = (st, graph) => {
    var attributes = st['attributes'];
    var semantic_types = st['semantic_types']; // TODO: Move the function to create inverse edges in the graph.js file
    var entities = st['entities'];
    for (var i in attributes) {
        var class_node = semantic_types[i][0].split("_")[0]; // Remember: I put an index here, because I can expect candidates semantic types
        // Add class node
        graph.setNode(class_node + entities[i], {
            type: 'class_uri',
            label: class_node
        });
        // Add data node
        var data_node = attributes[i];
        graph.setNode(data_node, {
            type: 'attribute_name'
        });
        // Add edge
        graph.setEdge(class_node + entities[i], data_node, {
            label: semantic_types[i][0].split("_")[1],
            type: 'st_property_uri'
        }, class_node + entities[i] + "***" + data_node, 1);
    }
    return graph;
}

var get_class_nodes = (graph) => {
    var class_nodes = [];
    var nodes = graph.nodes();
    for (var n in nodes) {
        if (graph.node(nodes[n])['type'] === 'class_uri') {
            class_nodes.push(graph.node(nodes[n])['label']);
        }
    }
    return class_nodes;
}

var get_closures = (closure_query, store) => {
    // Get nodes in the domain ontology that relate those semantic types
    return new Promise(function(resolve, reject) {
        store.execute(closure_query, function(success, results) {
            if (success !== null) reject(success);
            var closure_classes = utils.get_clean_results(results, 'closures');
            // Useful to remove blank nodes that break the code
            closure_classes = closure_classes.filter(el => !el.includes('_:'));
            resolve(closure_classes);
        });
    });
}

var add_closures = (closure_classes, graph) => {
    // Closure classes are retrieved with SPARQL queries on the ontology
    return new Promise(function(resolve, reject) {
        for (var c in closure_classes) {
            if (!is_duplicate(closure_classes[c], graph))
                graph.setNode(closure_classes[c], {
                    type: 'class_uri',
                    label: closure_classes[c]
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
                    'direct_property_uri'));
            }
            resolve(direct_properties);
        });
    });
}

// Consider also inverse direct properties
var get_all_direct_properties = (store, all_classes, p_domain, p_range) => {
    return new Promise(function(resolve, reject) {
        var all_direct_properties = [];
        var counter = 1;
        var stop = all_classes.length * all_classes.length;
        for (var i in all_classes) {
            for (var j in all_classes) {
                // Direct properties query
                var dp_query = sparql.DIRECT_PROPERTIES_QUERY(all_classes[i], all_classes[j], p_domain, p_range);
                // Inverse direct properties query
                var idp_query = sparql.DIRECT_PROPERTIES_QUERY(all_classes[j], all_classes[i], p_domain, p_range);
                get_direct_properties(dp_query, store, all_classes[i], all_classes[j])
                    .then(function(direct_properties) {
                        if (direct_properties.length > 0)
                            all_direct_properties = all_direct_properties.concat(direct_properties);
                        get_direct_properties(idp_query, store, all_classes[j], all_classes[i])
                            .then(function(inverse_direct_properties) {
                                if (inverse_direct_properties.length > 0)
                                    all_direct_properties = all_direct_properties.concat(inverse_direct_properties);
                                if (counter != stop) {
                                    counter++;;
                                } else {
                                    resolve(all_direct_properties);
                                }
                            });
                    });
            }
        }
    });
}

var add_direct_properties = (dps, graph) => {
    return new Promise(function(resolve, reject) {
        for (var i in dps) {
            var subject = dps[i]['subject'];
            var property = dps[i]['property'];
            var object = dps[i]['object'];
            var type = dps[i]['type'];

            // Add properties as edge: avoid to add new nodes in the graph when I add a new edge
            var nodes = graph.nodes();
            for (var s in nodes) {
                var subject_label_node = graph.node(nodes[s])['label'];
                if (subject_label_node === subject) {
                    for (var o in nodes) {
                        var object_label_node = graph.node(nodes[o])['label'];
                        if (object_label_node === object) {
                            graph.setEdge(nodes[s], nodes[o], {
                                label: property,
                                type: type
                            }, nodes[s] + '***' + nodes[o], 1); // Direct edges have weight = 1
                        }
                    }
                }
            }
        }
        resolve(graph);
    });
}

// This function simulate the path expression * implemented in SPARQL 1.1 (https://www.w3.org/TR/sparql11-property-paths/)
// In other words, this function get super classes at any level of an ontology class
var get_recursive_super_classes = (class_node, store) => {
    return new Promise(function(resolve, reject) {
        var rscs = [];
        var sc_query = sparql.SUPER_CLASSES_QUERY(class_node);
        get_super_classes(sc_query, store, rscs)
            .then(function(rscs) {
                resolve(utils.remove_array_duplicates(rscs));
            });
    });
}

var get_super_classes = (sc_query, store, rscs) => {
    return new Promise(function(resolve, reject) {
        store.execute(sc_query, function(success, results) {
            if (success !== null) reject(success);
            // Considere the case in which you do not obtain any result
            if (results.length === 0)
                resolve(rscs);
            for (var i in results) {
                var query_result = utils.clean_prefix(results[i]['all_super_classes']['value']);
                rscs.push(query_result);
                var new_query = sparql.SUPER_CLASSES_QUERY(query_result);
                get_super_classes(new_query, store, rscs);
                resolve(rscs);
            };
        });
    });
}

// I need to get super classes of both two classes to compare for establishing the relation weight
var prepare_super_classes = (c_u, c_v, c_u_query, c_v_query, store) => {
    return new Promise(function(resolve, reject) {
        var c_u_classes = [];
        var c_v_classes = [];
        get_recursive_super_classes(c_u, store)
            .then(function(cuc) {
                c_u_classes = cuc;
                return get_recursive_super_classes(c_v, store);
            })
            .then(function(cuv) {
                c_v_classes = cuv;
                // I need to keep the information related to the specific class
                var super_classes = {};
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

var prepare_all_super_classes = (store, all_classes) => {
    return new Promise(function(resolve, reject) {
        var all_super_classes = [];
        var counter = 1;

        // Attention: we need to remove Thing because for that specific cases super_classes function does not resolve
        // TODO: THIS IS VALID ONLY FOR SCHEMA!!!
        all_classes = all_classes.filter(function(e) {
            return e != 'schema:Thing'
        })

        var stop = all_classes.length * all_classes.length;
        for (var i in all_classes) {
            for (var j in all_classes) {
                // First query to get a couple of super_classes coming from two different classes
                var first_query = sparql.SUPER_CLASSES_QUERY(all_classes[i]);
                // Second query to get a couple of super_classes coming from two different classes
                var second_query = sparql.SUPER_CLASSES_QUERY(all_classes[j]);
                // Attention: in this case I do not need to call the function prepare_super_classes
                // two times, because the inverse process is already implemented in it
                prepare_super_classes(all_classes[i], all_classes[j], first_query, second_query, store)
                    .then(function(super_classes) {
                        if (Object.keys(super_classes).length > 0)
                            all_super_classes.push(super_classes);
                        if (counter != stop) counter++;
                        else resolve(all_super_classes);
                    });
            }
        }
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
var get_inherited_and_inverse_properties = (ip_query, iip_query, store, c_u, c_v) => {
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

var get_indirect_properties = (c_u, c_v, p_domain, p_range, super_classes, store) => {
    return new Promise(function(resolve, reject) {
        // This counter is useful to understand when stop!
        var indirect_properties = [];
        var counter = 1;
        var stop = super_classes[c_u].length * super_classes[c_v].length;

        // Ignore cases in which super classes are absent, so we are not able to get indirect properties
        if (stop === 0) resolve(indirect_properties);

        for (var i in super_classes[c_u]) {
            for (var j in super_classes[c_v]) {
                // To get inherited and inverse inherited properties change the order of the classes passed as input
                var ip_query = sparql.INHERITED_PROPERTIES_QUERY(super_classes[c_u][i], super_classes[c_v][j], p_domain, p_range);
                var iip_query = sparql.INHERITED_PROPERTIES_QUERY(super_classes[c_v][j], super_classes[c_u][i], p_domain, p_range);
                get_inherited_and_inverse_properties(ip_query, iip_query, store, super_classes[c_u][i], super_classes[c_v][j])
                    .then(function(properties) {
                        if (properties.length > 0)
                            indirect_properties = indirect_properties.concat(properties);
                        if (counter !== stop) {
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

var get_all_indirect_properties = (store, all_super_classes, p_domain, p_range) => {
    return new Promise(function(resolve, reject) {
        var all_indirect_properties = [];
        var counter = 1;
        var count_one_key = 1

        // Need to count cases in which you have only one super class
        for (var i in all_super_classes) {
            var keys = Object.keys(all_super_classes[i]);
            if (keys.length === 1)
                count_one_key++;
        }
        var stop = all_super_classes.length - count_one_key;
        for (var i in all_super_classes) {
            var keys = Object.keys(all_super_classes[i]);
            if (keys.length == 2) {
                var c_u = keys[0];
                var c_v = keys[1];
                var super_classes = all_super_classes[i];
                get_indirect_properties(c_u, c_v, p_domain, p_range, super_classes, store)
                    .then(function(indirect_properties) {
                        if (indirect_properties.length > 0)
                            all_indirect_properties = all_indirect_properties.concat(indirect_properties);
                        if (counter != stop) {
                            counter++;
                        } else {
                            resolve(all_indirect_properties);
                        }
                    });
            }
        }
    });
}

var add_indirect_properties = (idps, graph) => {
    return new Promise(function(resolve, reject) {
        for (var i in idps) {
            var subject = idps[i]['subject'];
            var property = idps[i]['property'];
            var object = idps[i]['object'];
            var type = idps[i]['type'];
            // Add properties as edge
            graph.setEdge(subject, object, {
                label: subject + '_' + object,
                type: type
            }, subject + '_' + object, 1 + ε); // Indirect edges have weight = 1 + ε
        }
        resolve(graph);
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

var build_graph = (st_path, ont_path, p_domain, p_range, o_class) => {
    return new Promise(function(resolve, reject) {
        // Create a new graph
        var graph = new Graph({
            multigraph: true
        });

        // Define the store for SPARQL queries
        var store;

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
        }).then(function(st) {
            // Save the store created after the graph initialization
            store = st;
            // Get closures
            console.log('Getting closures...');
            return get_class_nodes(graph).reduce(function(closure_sequence, class_node) {
                var query = sparql.CLOSURE_QUERY(class_node, o_class);
                return get_closures(query, store);
            }, Promise.resolve());
        }).catch(function(err) {
            console.log('Error when getting closures:');
            console.log(err);
        }).then(function(closures) {
            // Add closures
            console.log('Adding closures...');
            return add_closures(closures, graph);
        }).catch(function(err) {
            console.log('Error when adding closures:');
            console.log(err);
        }).then(function() {
            // Get direct properties
            console.log('Getting direct properties...');
            var all_classes = get_class_nodes(graph);
            return get_all_direct_properties(store, all_classes, p_domain, p_range);
        }).catch(function(err) {
            console.log('Error when getting direct properties:');
            console.log(err);
        }).then(function(direct_properties) {
            // Add direct properties
            console.log('Adding direct properties...')
            return add_direct_properties(direct_properties, graph);
        }).catch(function() {
            console.log('Error when adding direct properties:');
            console.log(err);
        }).then(function() {
            // Get all super classes
            console.log('Getting all super classes...');
            var all_classes = get_class_nodes(graph);
            return prepare_all_super_classes(store, all_classes);
        }).catch(function(err) {
            console.log('Error when getting all super_classes:');
            console.log(err);
        }).then(function(super_classes) {
            // Get all indirect properties
            console.log('Getting all indirect properties...');
            return get_all_indirect_properties(store, super_classes, p_domain, p_range);
        }).catch(function(err) {
            console.log('Error when getting all indirect_properties:');
            console.log(err);
        }).then(function(indirect_properties) {
            // Add indirect_properties
            return add_indirect_properties(indirect_properties, graph);
        }).then(function() {
            console.log('Graph building complete!\n');
            // TODO: check if the graph is complete (all nodes are linked) ! Otherwise, launch an exeception!
            resolve(graph);
        });
    });
}

// Export for testing
exports.add_semantic_types = add_semantic_types;
exports.get_class_nodes = get_class_nodes;
exports.get_closures = get_closures;
exports.add_closures = add_closures;
exports.get_direct_properties = get_direct_properties;
exports.get_all_direct_properties = get_all_direct_properties;
exports.get_recursive_super_classes = get_recursive_super_classes;
exports.prepare_super_classes = prepare_super_classes;
exports.prepare_all_super_classes = prepare_all_super_classes;
exports.get_inherited_properties = get_inherited_properties;
exports.get_inherited_and_inverse_properties = get_inherited_and_inverse_properties;
exports.get_indirect_properties = get_indirect_properties;
exports.build_graph = build_graph;