var fs = require('fs');
var graphlib = require('graphlib');
var rdfstore = require('rdfstore');
var Graph = require('graphlib').Graph;
var utils = require(__dirname + '/utils.js');
var sparql = require(__dirname + '/sparql_queries.js');

var ε = 3;

// TODO: Create an high level representation of node and edge for checking inconsistencies
// TODO: Semantic_types in semantic type file should be an array of array?
// TODO: Make a universal API to create nodes and edges
// TODO: Error generated when creating the graph
// TODO: Add images to the README.md
// TODO: Strange behaviour in returning inherited properties

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
    // Attention: we need to remove Thing because for that specific cases super_classes function does not resolve
    // TODO: THIS IS VALID ONLY FOR SCHEMA!!!
    // TODO: Maybe should put this thing in another way
    class_nodes = class_nodes.filter(function(e) {
        return e != 'schema:Thing'
    });

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
            // Need to check if the class_node is present
            if (!is_duplicate(closures[c], graph))
                graph.setNode(closures[c], {
                    type: 'class_uri',
                    label: closures[c]
                });
        }
        resolve();
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
                direct_properties.push(utils.set_property(
                    subject,
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
 * Get all super classes of a class node in the graph (semantic types + closures)
 * in a recursive way (path expression * implemented in SPARQL 1.1).
 * This is useful to create inherited properties between class nodes in the graph
 * @param sc
 * @param store
 * @param all_classes - (Useful in recursive functions)
 */
var get_super_classes = (sc, store, all_classes) => {
    return new Promise(function(resolve, reject) {
        var sc_query = sc['query'];
        var starting_class = sc['starting_class'];
        var class_node = sc['class_node'];
        store.execute(sc_query, function(success, results) {
            if (success !== null) reject(success);

            if (all_classes[class_node] === undefined)
                all_classes[class_node] = [];

            // If no parent class, the last class if always a fictitious Thing
            if (results.length === 0)
                all_classes[class_node].push('owl:Thing');

            for (var i in results) {
                var super_class = utils.clean_prefix(results[i]['all_super_classes']['value']);
                if (super_class.indexOf('_:') === -1) {
                    all_classes[class_node].push(super_class);
                    var new_query_object = {
                        'class_node': class_node,
                        'starting_class': super_class,
                        'query': sparql.SUPER_CLASSES_QUERY(super_class)
                    }
                    // Recursive call
                    get_super_classes(new_query_object, store, all_classes);
                }
            };
            resolve(all_classes);
        });
    });
}


/**
 * Get all super classes of all class nodes included in the graph
 * @param store
 * @param class_nodes
 */
var get_all_super_classes = (store, class_nodes) => {
    var scs = [];
    var all_classes = {};
    for (var c in class_nodes) {
        var sc = {
            'class_node': class_nodes[c],
            'starting_class': class_nodes[c],
            'query': sparql.SUPER_CLASSES_QUERY(class_nodes[c])
        }
        scs.push(sc);
    }
    var funcs = scs.map(sc => () => get_super_classes(sc, store, all_classes));
    return promise_sequence(funcs);
}


/**
 *********************************************************************************
 ************************ Inherited properties management ************************
 *********************************************************************************
 */

/**
 * Get properties between super classes (inherited) of a couple of class nodes
 * @param ip
 * @param store
 * @returns a JSON with the following structure
 *[{ subject: 'conference:Paper',
 *   property: 'conference:has_authors',
 *   object: 'conference:Contribution_co_author',
 *   type: 'inherited' }]
 */
var get_inherited_properties = (ip, store) => {
        return new Promise(function(resolve, reject) {
                    var subject = ip['subject'];
                    var object = ip['object'];
                    var ip_query = ip['query'];
                    var inherited_properties = [];
                    store.execute(ip_query, function(success, results) {
                        if (success !== null) reject(success);
                        var cleaned_results = utils.get_clean_results(results, 'inherited_properties');
                        for (var i in cleaned_results) { <<
                            << << < HEAD
                            inherited_properties.push(utils.set_property(subject, ===
                                    === =
                                    inherited_properties.push(utils.set_property(
                                        subject, >>>
                                        >>> > evaluation cleaned_results[i],
                                        object,
                                        'inherited'));
                                }
                                resolve(inherited_properties);
                            });
                    });
                }


                /**
                 * Get all properties between all super classes (inherited) of all class nodes
                 * Need to specify domain and range properties, because they can be different
                 * according to the  ontology
                 * @param store
                 * @param super_classes
                 * @param p_domain
                 * @param p_range
                 * @returns
                 */
                var get_all_inherited_properties = (store, super_classes, p_domain, p_range) => {
                    // XXX Promise sequence replicates the output many times. Need to fix it.
                    // For now, i take the first element
                    var super_classes = super_classes[0];
                    var query_objs = [];

                    for (var i in super_classes) {
                        // if a class node does not have super classes, I do not need to create query
                        if (super_classes[i].length === 0) continue;

                        for (var j in super_classes) {
                            if (super_classes[j].length === 0) continue;
                            // Do not consider relation between super classes of the same class
                            if (i === j) continue;

                            // Construct the queries
                            var subjects_sc = super_classes[i];
                            var objects_sc = super_classes[j];

                            for (var s in subjects_sc) {
                                for (var o in objects_sc) {
                                    var inherited_prop = {
                                        'subject': i,
                                        'subject_super_class': subjects_sc[s],
                                        'object': j,
                                        'object_super_class': objects_sc[o],
                                        'query': sparql.INHERITED_PROPERTIES_QUERY(subjects_sc[s], objects_sc[o], p_domain, p_range)
                                    };
                                    query_objs.push(inherited_prop);
                                    var inverse_prop = {
                                        'subject': j,
                                        'subject_super_class': objects_sc[o],
                                        'object': i,
                                        'object_super_class': subjects_sc[s],
                                        'query': sparql.INHERITED_PROPERTIES_QUERY(objects_sc[o], subjects_sc[s], p_domain, p_range)
                                    }
                                    query_objs.push(inherited_prop);
                                }
                            }
                        }
                    }
                    var funcs = query_objs.map(query_obj => () => get_inherited_properties(query_obj, store));
                    return promise_sequence(funcs);
                }


                /**
                 * Add inherited properties to the graph
                 * @param inherited_properties
                 * @param graph
                 * @returns graph enriched with inehirited properties
                 * According to Knoblock's algorithm, I need to assign different weights for
                 * rdfs:subClassOf properties
                 */
                var add_inherited_properties = (inherited_properties, graph) => {
                    return new Promise(function(resolve, reject) {
                        for (var i in inherited_properties) {
                            var subject = inherited_properties[i]['subject'];
                            var property = inherited_properties[i]['property'];
                            var object = inherited_properties[i]['object'];
                            var type = inherited_properties[i]['type'];
                            if (property === 'rdfs:subClassOf')
                                add_edges(graph, subject, property, object, type, 1 / ε) // rdfs:subClassOf indirect edges have weight = 1 / ε
                            else add_edges(graph, subject, property, object, type, 1 + ε) // Indirect edges have weight = 1 + ε
                        }
                        resolve(graph);
                    });
                }

                /**
                 * Support function to add diverse type of edges to the graph
                 * @param graph
                 * @param subject
                 * @param property
                 * @param object
                 * @param type
                 * @param weight
                 */
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
                                    }, nodes[s] + '***' + nodes[o], weight);
                                }
                            }
                        }
                    }
                }


                /**
                 * Add properties to owl:Thing
                 * As stated by Taheriyan, in cases where G consists of more than one connected
                 * components, we add a class node with the label owl:Thing to the graph and
                 * connect the class nodes that do not have any parent to this root node using
                 * a rdfs:subClassOf link.
                 * @param super_classes
                 * @param graph
                 */
                var add_properties_to_thing = (graph) => {
                    var components = graphlib.alg.components(graph);
                    // Create owl:Thing node in the graph
                    graph.setNode('owl:Thing', {
                        type: 'special',
                        label: 'owl:Thing'
                    });
                    for (var c in components) {
                        var last_class = components[c].slice(-1)[0];
                        add_edges(graph, last_class, 'rdfs:subClassOf', 'owl:Thing', 'inherited', 1 / ε) // Edges to owl:Thing have weight = 1/ε
                    }
                }


                /**
                 * Get all ontology classes (useful to generate URIs of entities in the graph)
                 * @param ac_query
                 * @param store
                 */
                var get_all_classes = (store) => {
                    return new Promise(function(resolve, reject) {
                        var ac_query = sparql.ALL_CLASSES_QUERY();
                        var all_classes = [];
                        store.execute(ac_query, function(success, results) {
                            if (success !== null) reject(success);
                            var cleaned_results = utils.get_clean_results(results, 'all_classes');
                            for (var i in cleaned_results) {
                                all_classes.push(cleaned_results[i]);
                            }
                            // Remove blank nodes
                            all_classes = all_classes.filter(el => !el.includes('_:'));
                            resolve(all_classes)
                        });
                    });
                }

                var save_all_classes = (all_classes, ont_path) => {
                    return new Promise(function(resolve, reject) {
                        var json = {
                            'all_classes': all_classes
                        };
                        var file_path = ont_path.replace('ontology.ttl', '');
                        file_path += 'classes'
                        fs.writeFileSync(file_path + '.json', JSON.stringify(json, null, 4));
                        resolve();
                    });
                }

                /**
                 ****************************************************************
                 ************************ Graph Building ************************
                 ****************************************************************
                 */

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
                            var funcs = queries.map(query => () => get_closures(query, store));
                            return promise_sequence(funcs);
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
                            var class_nodes = get_class_nodes(graph);
                            return get_all_direct_properties(store, class_nodes, p_domain, p_range);
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
                            var class_nodes = get_class_nodes(graph);
                            return get_all_super_classes(store, class_nodes);
                        }).catch(function(err) {
                            console.log('Error when getting all super_classes:');
                            console.log(err);
                        }).then(function(super_classes) {
                            // Get all inherited properties
                            console.log('Getting all inherited properties...');
                            return get_all_inherited_properties(store, super_classes, p_domain, p_range);
                        }).catch(function(err) {
                            console.log('Error when getting all inherited properties:');
                            console.log(err);
                        }).then(function(inherited_properties) {
                            // Add inherited_properties
                            return add_inherited_properties(inherited_properties, graph);
                        }).catch(function(err) {
                            console.log('Error when adding inherited properties:');
                            console.log(err);
                        }).then(function() {
                            // Get all classes
                            console.log('Getting all classes of the ontology...');
                            return get_all_classes(store);
                        }).catch(function(err) {
                            console.log('Error when getting all classes:');
                            console.log(err);
                        }).then(function(all_classes) {
                            // Save all classes of the ontology in a file
                            save_all_classes(all_classes, ont_path);
                        }).then(function() {
                            console.log('Checking graph components...');
                            if (graphlib.alg.components(graph).length > 1) {
                                console.log('Warning! Need to add owl:Thing node and add relations to it');
                                add_properties_to_thing(graph);
                            }
                            console.log('Graph building complete!\n');
                            resolve(graph);
                        }).catch(function(err) {
                            console.log('Error in building the graph:');
                            console.log(err);
                        });
                    });
                }

                exports.build_graph = build_graph;