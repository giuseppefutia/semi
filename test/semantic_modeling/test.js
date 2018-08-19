var fs = require('fs');
var rdfstore = require('rdfstore');
var assert = require('assert');
var graphlib = require('graphlib');
var Graph = require('graphlib').Graph;
var graph_generator = require(__dirname + '/../../semantic_modeling/graph.js');
var sparql = require(__dirname + '/../../semantic_modeling/sparql_queries.js');

// TODO: use query in sparql_queries.js for better consistencies in case of query changes
// TODO: Use done()
// TODO: Add test for add_direct_properties()

describe('Graph building test suite\n', function() {

    var ontology;

    before(function() {
        ontology = fs.readFileSync(__dirname + '/schema.ttl').toString();
    });

    var call_store = (ontology) => {
        return new Promise(function(resolve, reject) {
            rdfstore.create(function(err, store) {
                store.load('text/turtle', ontology, function(err, data) {
                    if (err) reject(err);
                    resolve(store);
                });
            });
        });
    }

    describe('Get class nodes from a graph', function() {
        var graph = new Graph();
        graph.setNode('a', {
            type: 'class_uri'
        });
        graph.setNode('b', {
            type: 'attribute_name'
        });
        it('\'a\' is a class_uri in the graph', function() {
            assert.deepEqual(['a'], graph_generator.get_class_nodes(graph));
        });
    });

    describe('Get direct object properties from domain ontologies between 2 classes included in the graph', function() {
        it('The direct property between schema:EducationalOrganization and schema:Organization should be rdfs:subClassOf', function() {
            var c_u = 'schema:EducationalOrganization'; // XXX When I put schema:Person the following test givis me an error
            var c_v = 'schema:Organization';
            var p_domain = 'schema:domainIncludes';
            var p_range = 'schema:rangeIncludes';
            var dp_query = `PREFIX schema: <http://schema.org/>
                             SELECT ?direct_properties WHERE {
                                 ?direct_properties ${p_domain} ${c_u} .
                                 ?direct_properties ${p_range} ${c_v} .
                             }`;
            call_store(ontology)
                .then(function(store) {
                    graph_generator.get_direct_properties(dp_query, store, c_u, c_v)
                        .then(function(direct_properties) {
                            assert.deepEqual(0, direct_properties.length);
                        });
                });
        });
    });

    describe('Get all direct object properties from different classes already included in the graph', function() {
        it('', function() {
            var all_classes = ['schema:Person', 'schema:Organization'];
            var p_domain = 'schema:domainIncludes';
            var p_range = 'schema:rangeIncludes';
            call_store(ontology)
                .then(function(store) {
                    graph_generator.get_all_direct_properties(store, all_classes, p_domain, p_range)
                        .then(function(all_direct_properties) {
                            // TODO
                        })
                });
        });
    });

    describe('Get all indirect properties from domain ontologies between 2 classes and their respective super classes', function() {
        it('The first indirect property between \'schema:AdultEntertainment\' and  \'schema:BusinessEvent\' should be \'schema:events\'', function() {
            var c_u = 'schema:AdultEntertainment';
            var c_v = 'schema:BusinessEvent';
            var super_classes = {
                'schema:AdultEntertainment': [
                    'schema:EntertainmentBusiness',
                    'schema:LocalBusiness',
                    'schema:Place',
                    'schema:Organization',
                    'schema:Thing',
                ],
                'schema:BusinessEvent': ['schema:Event', 'schema:Thing']
            }
            var p_domain = 'schema:domainIncludes';
            var p_range = 'schema:rangeIncludes';
            call_store(ontology)
                .then(function(store) {
                    graph_generator.get_indirect_properties(c_u, c_v, p_domain, p_range, super_classes, store)
                        .then(function(indirect_properties) {
                            assert.deepEqual('schema:events', indirect_properties[0]['property']);
                        });
                });
        });
    });

    describe('Get inherited and inverse object properties using the inherited object property function', function() {
        it('The first inherited properties between \'schema:Organization\' \'schema:Event\' should be \'schema:events\'', function() {
            var c1 = 'schema:Organization';
            var c2 = 'schema:Event';
            // Inherited properties query
            var ip_query = `PREFIX schema: <http://schema.org/>
                            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                            SELECT ?inherited_properties ?domain WHERE {
                                ?inherited_properties schema:domainIncludes ${c1} .
                                ?inherited_properties schema:rangeIncludes ${c2} .
                            }`;
            // Inverse inherited properties query
            var iip_query = `PREFIX schema: <http://schema.org/>
                             PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                             SELECT ?inherited_properties ?domain WHERE {
                                 ?inherited_properties schema:domainIncludes ${c2} .
                                 ?inherited_properties schema:rangeIncludes ${c1} .
                            }`;
            call_store(ontology)
                .then(function(store) {
                    graph_generator.get_inherited_and_inverse_properties(
                            ip_query,
                            iip_query,
                            store,
                            c1,
                            c2)
                        .then(function(properties) {
                            assert.deepEqual('schema:events', properties[0]['property']);
                            assert.deepEqual('schema:event', properties[1]['property']);
                            assert.deepEqual('schema:attendees', properties[2]['property']);
                        })
                });
        });
    });

    describe('Get inherited object properties from domain ontologies between 2 class nodes included in the graph', function() {
        it('The inherited object properties of \'schema:Person\' and \'schema:Organization\' should be \'schema:brand\', \'schema:affiliation\', \'schema:memberOf\'', function() {
            var c1 = 'schema:Person';
            var c2 = 'schema:Organization';
            var ip_query = `PREFIX schema: <http://schema.org/>
                            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                            SELECT ?inherited_properties ?domain WHERE {
                                ?inherited_properties schema:domainIncludes ${c1} .
                                ?inherited_properties schema:rangeIncludes ${c2} .
                            }`;
            call_store(ontology)
                .then(function(store) {
                    var inherited_properties = [];
                    graph_generator.get_inherited_properties(ip_query, store, c1, c2, inherited_properties)
                        .then(function(inherited_properties) {
                            assert.deepEqual('schema:brand', inherited_properties[0]['property']);
                            assert.deepEqual('schema:affiliation', inherited_properties[1]['property']);
                            assert.deepEqual('schema:memberOf', inherited_properties[2]['property']);
                        })
                        .catch(function(error) {
                            console.log('Something went wrong trying to get inherited object properties from domain ontologies: ' + error);
                        });
                });
        });
    });

    describe('Prepare super classes of two input classes in order to retrieve inherited object properties', function() {
        it('All super classes of \'schema:Person\' and \'schema:Organization\' are \'schema:Thing\'', function() {
            var c1 = 'schema:Person';
            var c2 = 'schema:Organization';
            var c1_query = `
                        PREFIX schema: <http://schema.org/>
                        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                        SELECT ?all_super_classes WHERE {
                            ${c1} rdfs:subClassOf ?all_super_classes
                        }`;
            var c2_query = `
                        PREFIX schema: <http://schema.org/>
                        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                        SELECT ?all_super_classes WHERE {
                            ${c2} rdfs:subClassOf ?all_super_classes
                        }`;
            call_store(ontology)
                .then(function(store) {
                    graph_generator.prepare_super_classes(c1, c2, c1_query, c2_query, store)
                        .then(function(super_classes) {
                            assert.deepEqual('schema:Thing', super_classes[c1][0]);
                            assert.deepEqual('schema:Thing', super_classes[c2][0]);
                        })
                        .catch(function(error) {
                            console.log('Something went wrong trying to prepare super classes: ' + error);
                        });
                });
        });
    });

    describe('Get all super classes from of domain ontologies of a class node included in the graph', function() {
        it('The father of schema:AdultEntertainment is schema:EntertainmentBusiness, the grandfather is schema:LocalBusiness, the great grandfather is schema:Place', function() {
            var class_node = 'schema:AdultEntertainment';
            var asc_query = `PREFIX schema: <http://schema.org/>
                             PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                             SELECT ?all_super_classes WHERE {
                                 ${class_node} rdfs:subClassOf ?all_super_classes
                             }`;

            call_store(ontology)
                .then(function(store) {
                    var all_super_classes = [];
                    graph_generator.get_all_super_classes(asc_query, store, all_super_classes)
                        .then(function(asc) {
                            assert.deepEqual('schema:EntertainmentBusiness', all_super_classes[0]);
                            assert.deepEqual('schema:LocalBusiness', all_super_classes[1]);
                            assert.deepEqual('schema:Place', all_super_classes[2]);
                        }, function(error) {
                            console.log(error);
                        });
                });
        });
    });

    describe('Add semantic types from different data sources', function() {
        it('The graph should have at least the following nodes: schema:Person, identifier, affiliation', function() {
            var graph = new Graph({
                multigraph: true
            });
            var types = JSON.parse(fs.readFileSync(__dirname + '/semantic_types_test.json', 'utf8'));
            for (var t in types) {
                updated_graph = graph_generator.add_semantic_types(types[t], graph);
            }
            assert.deepEqual(true, updated_graph.hasNode('schema:Person'));
            assert.deepEqual(true, updated_graph.hasNode('identifier'));
            assert.deepEqual(true, updated_graph.hasNode('affiliation'));
        });
    });

    describe('Add closures classes of a class node inside the graph', function() {
        it('The graph contanis the following class nodes: schema:Organization, schema:School, schema:CollegeOrUniversity', function() {
            var graph = new Graph();
            var closure_classes = ['schema:Organization', 'schema:School', 'schema:CollegeOrUniversity'];
            graph_generator.add_closures(closure_classes, graph)
                .then(function(updated_graph) {
                    assert.deepEqual(true, updated_graph.hasNode('schema:Organization'));
                    assert.deepEqual(true, updated_graph.hasNode('schema:School'));
                    assert.deepEqual(true, updated_graph.hasNode('schema:CollegeOrUniversity'));
                })
        });
    });

    describe('Get closures of a class node defined in the graph', function() {
        it('Some of the closure classes of schema:EducationalOrganization are: schema:Organization, schema:School, schema:CollegeOrUniversity, etc.', function() {
            var closure_query = `PREFIX schema: <http://schema.org/>
                                 PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                                 SELECT ?closure_classes
                                     WHERE {
                                         { schema:EducationalOrganization ?property ?closure_classes.
                                             ?closure_classes a rdfs:Class }
                                             UNION { ?closure_classes ?property schema:EducationalOrganization .
                                                 ?closure_classes a rdfs:Class }
                                             }`;
            call_store(ontology)
                .then(function(store) {
                    // Get closures
                    graph_generator.get_closures(closure_query, store, function(closure_classes) {
                        assert.deepEqual(closure_classes[0], 'schema:Organization');
                        assert.deepEqual(closure_classes[1], 'schema:School');
                        assert.deepEqual(closure_classes[2], 'schema:CollegeOrUniversity');
                    });
                });
        });
    });

    describe('Test on graph.js', function() {
        it('Multi Graph should be built', function() {
            var p_domain = 'schema:domainIncludes';
            var p_range = 'schema:rangeIncludes';
            graph_generator.build_graph(__dirname + '/semantic_types_test.json', __dirname + '/schema.ttl', p_domain, p_range)
                .then(function(graph) {
                    assert.deepEqual(true, graphlib.json.write(graph)['options']['multigraph']);
                    console.log(graphlib.json.write(graph));
                });
        });
    });
});
