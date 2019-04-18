var fs = require('fs');
var graphlib = require('graphlib');
var rdfstore = require('rdfstore');
var Graph = require('graphlib').Graph;
var utils = require(__dirname + '/utils.js');
var sparql = require(__dirname + '/sparql_queries.js');

var ε = 3;

// TODO: CLEAN THE CODE --> Create promise_sequence for all the call: see clousures implementation
// TODO: create an high level representation of node and edge for checking inconsistencies
// TODO: reduce rigth-depth of function that call two Promises
// TODO: modify indirect properties with the same changes of direct properties
// TODO: add edge weight for subclasses
// TODO: semantic_types in semantic type file should be an array of array?
// TODO: Make a universal API to create nodes and edges
// TODO: Error generated when creating the graph

/**
 * Return a promise with the concatenated output of functions returning results as promises
 * @param funcs - functions returning promises
 */
var promise_sequence = funcs =>
    funcs.reduce((promise, func) =>
        promise
        .then(result => func().then(Array.prototype.concat.bind(result)))
        .catch(error => console.log(error)),
        Promise.resolve([]))


/**
 * Check if a node is already included in the graph
 * @param node
 * @param graph
 */
var is_duplicate = (node, graph) => {
    var nodes = graph.nodes();
    for (var n in nodes) {
        if (graph.node(nodes[n])['label'] === node) {
            return true;
        }
    }
    return false;
}


/**
 * Get class nodes from the graph
 * @param graph
 */
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


/**
 * Add semantic types to the graph
 * @param st - JSON structure describing semantic types
 *             See as example: data/pc/semantic_types/Z4ADEA9DE4_st.json
 * @param graph
 * @returns graph enriched with semantic types
 */
var add_semantic_types = (st, graph) => {
    var attributes = st['attributes'];
    var semantic_types = st['semantic_types']; // TODO: Move the function to create inverse edges in the graph.js file
    var entities = st['entities'];
    for (var i in attributes) {
        var class_node = semantic_types[i][0].split("***")[0]; // Remember: I put an index here, because I can expect candidates semantic types
        // Add class node
        graph.setNode(class_node + entities[i], {
            type: 'class_uri',
            label: class_node
        });
        // Add data node
        var data_node = attributes[i];
        graph.setNode(data_node, {
            type: 'attribute_name',
            label: data_node
        });
        // Add edge
        graph.setEdge(class_node + entities[i], data_node, {
            label: semantic_types[i][0].split("***")[1],
            type: 'st_property_uri'
        }, class_node + entities[i] + "***" + data_node, 1);
    }
    return graph;
}


/**
 * Get all nodes in the domain ontology that are related to the semantic types
 * @param closure_query
 * @param store
 */
var get_closures = (closure_query, store) => {
    return new Promise(function(resolve, reject) {
        store.execute(closure_query, function(success, results) {
            if (success !== null) reject(success);
            var closures = utils.get_clean_results(results, 'closures');
            // Useful to remove blank nodes that break the code
            closures = closures.filter(el => !el.includes('_:'));
            resolve(closures);
        });
    });
}


/**
 * Add closures to the graph
 * @param closures
 * @param graph
 * @returns graph enriched with closures, considered as node classes
 */
var add_closures = (closures, graph) => {
    // Closure classes are retrieved with SPARQL queries on the ontology
    return new Promise(function(resolve, reject) {
        for (var c in closures) {
            if (!is_duplicate(closures[c], graph))
                graph.setNode(closures[c], {
                    type: 'class_uri',
                    label: closures[c]
                });
        }
        resolve(graph);
    });
}


/**
 * Get all direct properties between two nodes in the ontology
 * In the direct property, the subject is the domain of the property and the object
 * is the range of the property
 * @param dp_obj
 * @param store
 * @returns array of objects with the following structure:
 *
 * { subject: 'pc:Contract',
 *   property: 'pc:contractingAuthority',
 *   object: 'gr:BusinessEntity',
 *   type: 'direct_property_uri' }
 */
var get_direct_properties = (dp_obj, store) => {
    return new Promise(function(resolve, reject) {
        // Unbundle the direct properties object
        var subject = dp_obj['subject'];
        var object = dp_obj['object'];
        var dp_query = dp_obj['query'];

        // Perform the query
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


/**
 * Get all direct properties between the class nodes in the graph
 * The class nodes are the class defined by semantic types and closures
 * Need to consider direct properties in both directions:
 * subject --> object
 * object <-- subject
 * @param store
 * @param class_nodes
 * @param p_domain
 * @param p_range
 */
var get_all_direct_properties = (store, class_nodes, p_domain, p_range) => {
    // Prepare queries to get direct properties
    var query_objs = [];
    for (var i in class_nodes) {
        for (var j in class_nodes) {
            // Direct properties: subject, object, query
            var dp = {
                'subject': class_nodes[i],
                'object': class_nodes[j],
                'query': sparql.DIRECT_PROPERTIES_QUERY(class_nodes[i], class_nodes[j], p_domain, p_range)
            }
            query_objs.push(dp);
            // Inverse direct properties query
            var idp = {
                'subject': class_nodes[j],
                'object': class_nodes[i],
                'query': sparql.DIRECT_PROPERTIES_QUERY(class_nodes[j], class_nodes[i], p_domain, p_range)
            }
            query_objs.push(idp);
        }
    }
    var funcs = query_objs.map(query_obj => () => get_direct_properties(query_obj, store));
    return promise_sequence(funcs);
}


/**
 * Add direct properties to the graph
 * @param dps
 * @param graph
 * @returns graph enriched with direct properties
 */
var add_direct_properties = (dps, graph) => {
    return new Promise(function(resolve, reject) {
        for (var i in dps) {
            var subject = dps[i]['subject'];
            var property = dps[i]['property'];
            var object = dps[i]['object'];
            var type = dps[i]['type'];
            add_edges(graph, subject, property, object, type, 1) // Direct edges have weight = 1
        }
        resolve(graph);
    });
}


/**
 **************************************************************************
 ************************ Super classes management ************************
 **************************************************************************
 */


/**
 * Get all super classes of class nodes in the graph (semantic types + closures)
 * in a recursive way (path expression * implemented in SPARQL 1.1).
 * This is useful to create inherited properties between class nodes in the graph
 * @param sc_query
 * @param store
 */
var get_super_classes = (sc_query, store) => {
    return new Promise(function(resolve, reject) {
        store.execute(sc_query, function(success, results) {
            if (success !== null) reject(success);
            var rscs = [];
            for (var i in results) {
                var query_result = utils.clean_prefix(results[i]['all_super_classes']['value']);
                rscs.push(query_result);
                var new_query = sparql.SUPER_CLASSES_QUERY(query_result);
                // Recursive call
                get_super_classes(new_query, store, rscs);
            };
            resolve(rscs);
        });
    });
}


var get_all_super_classes = (class_node, store) => {
    return new Promise(function(resolve, reject) {
        var all_classes = [];
        var sc_query = sparql.SUPER_CLASSES_QUERY(class_node);
        get_super_classes(sc_query, store)
            .then(function(new_classes) {
                all_classes = all_classes.concat(new_classes)
                resolve(utils.remove_array_duplicates(all_classes));
            })
            .catch(function(error) {
                console.log('Something went wrong trying to get recursive super classes: ' + error);
                reject();
            });;
    });
}

// I need to get super classes of both two classes to compare for establishing the relation weight
var prepare_super_classes = (c_u, c_v, c_u_query, c_v_query, store) => {
    return new Promise(function(resolve, reject) {
        var c_u_classes = [];
        var c_v_classes = [];
        get_all_super_classes(c_u, store)
            .then(function(cuc) {
                c_u_classes = cuc;
                return get_all_super_classes(c_v, store);
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
        // TODO: Maybe should put this thing in another way
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
                    }).catch(function(error) {
                        reject(error);
                        console.log('Something went wrong in preparing super classes: ' + error);
                    });;
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

        // Clean super_classes of blank nodes
        super_classes[c_u] = super_classes[c_u].filter(el => !el.includes('_:'));
        super_classes[c_v] = super_classes[c_v].filter(el => !el.includes('_:'));

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
                        } else {
                            resolve(indirect_properties);
                        }
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
                            var obj = {};
                            obj['all_super_classes'] = all_super_classes
                            obj['all_indirect_properties'] = all_indirect_properties;
                            resolve(obj);
                        }
                    }).catch(function(error) {
                        reject(error);
                        console.log('Something went wrong getting all indirect_properties properties: ' + error);
                    });;
            }
        }
    });
}

var add_indirect_properties = (properties_super_classes, graph) => {
    return new Promise(function(resolve, reject) {
        var idps = properties_super_classes['all_indirect_properties'];
        var ascs = properties_super_classes['all_super_classes'];

        for (var i in idps) {
            var subject = '';
            var object = '';
            var property = idps[i]['property'];
            var type = idps[i]['type']

            for (var j in ascs) { // XXX For now very bad
                for (var t in ascs[j]) {
                    if (ascs[j][t].includes(idps[i]['subject'])) {
                        subject = t;
                    }
                }
            }

            for (var j in ascs) { // XXX For now very bad
                for (var t in ascs[j]) {
                    if (ascs[j][t].includes(idps[i]['object'])) {
                        object = t;
                    }
                }
            }

            add_edges(graph, subject, property, object, type, 1 + ε) // Indirect edges have weight = 1 + ε
        }
        resolve(graph);
    });
}

var add_edges = (graph, subject, property, object, type, weight) => {
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
                    }, nodes[s] + '***' + nodes[o], weight); // Direct edges have weight = 1
                }
            }
        }
    }
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
            var class_nodes = get_class_nodes(graph);
            var queries = [];
            class_nodes.forEach(function(cn) {
                queries.push(sparql.CLOSURE_QUERY(cn, o_class));
            });
            var async_functions = queries.map(query => () => get_closures(query, store));
            return promise_sequence(async_functions);
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
            console.log('Adding direct properties...');
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
        }).then(function(properties_super_classes) {
            // Add indirect_properties
            return add_indirect_properties(properties_super_classes, graph);
        }).catch(function(err) {
            console.log('Error when adding indirect_properties:');
            console.log(err);
        }).then(function() {
            console.log('Graph building complete!\n');
            // TODO: check if the graph is complete (all nodes are linked) ! Otherwise, launch an exeception!
            resolve(graph);
        }).catch(function(err) {
            console.log('Error in building the graph:');
            console.log(err);
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
exports.get_all_super_classes = get_all_super_classes;
exports.prepare_super_classes = prepare_super_classes;
exports.prepare_all_super_classes = prepare_all_super_classes;
exports.get_inherited_properties = get_inherited_properties;
exports.get_inherited_and_inverse_properties = get_inherited_and_inverse_properties;
exports.get_indirect_properties = get_indirect_properties;
exports.build_graph = build_graph;