var Graph = require('graphlib').Graph;
var rdfstore = require('rdfstore');
var fs = require('fs');
var graph_generator = require(__dirname + '/../../semantic_modeling/graph.js');
var assert = require('assert');

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
        var class_u = 'schema:EducationalOrganization';
        var class_v = 'schema:Organization';
        var dp_query = `PREFIX schema: <http://schema.org/>
                         SELECT ?direct_properties WHERE {
                             ${class_u} ?direct_properties ${class_v}
                         }`;
        // TODO rdf store should be created before all functions that exploit it
        rdfstore.create(function(err, store) {
            var ontology = fs.readFileSync(__dirname + '/schema.ttl').toString();
            store.load('text/turtle', ontology, function(err, data) {
                graph_generator.get_direct_properties(dp_query, store, function(direct_properties) {
                    assert.deepEqual(direct_properties[0], 'rdfs:subClassOf');
                });
            });
        });
    });
});

describe('Get all inherited object properties from domain ontologies from all super classes of 2 classes', function() {
    it('', function() {
        var c_u = 'schema:AdultEntertainment';
        var c_v = 'schema:BusinessEvent"';
        var c_u_superclasses = [
            'schema:EntertainmentBusiness',
            'schema:LocalBusiness',
            'schema:Place',
            'schema:Organization',
            'schema:Thing',
            'schema:Thing'
        ]
        var c_v_superclasses = ['schema:Event', 'schema:Thing'];
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
        rdfstore.create(function(err, store) {
            var ontology = fs.readFileSync(__dirname + '/schema.ttl').toString();
            store.load('text/turtle', ontology, function(err, data) {
                graph_generator.get_inherited_properties(ip_query, store, function(inherited_properties) {
                    assert.deepEqual('schema:brand', inherited_properties[0]);
                    assert.deepEqual('schema:affiliation', inherited_properties[1]);
                    assert.deepEqual('schema:memberOf', inherited_properties[2]);
                });
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
        rdfstore.create(function(err, store) {
            var ontology = fs.readFileSync(__dirname + '/schema.ttl').toString();
            store.load('text/turtle', ontology, function(err, data) {
                var super_classes = graph_generator.prepare_super_classes(c1, c2, c1_query, c2_query, store)
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
});

describe('Get all super classes from of domain ontologies of a class node included in the graph', function() {
    it('The father of schema:AdultEntertainment is schema:EntertainmentBusiness, the grandfather is schema:LocalBusiness, the great grandfather is schema:Place', function() {
        var class_node = 'schema:AdultEntertainment';
        var asc_query = `PREFIX schema: <http://schema.org/>
                         PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                         SELECT ?all_super_classes WHERE {
                             ${class_node} rdfs:subClassOf ?all_super_classes
                         }`;
        // TODO rdf store should be created before all functions that exploit it
        rdfstore.create(function(err, store) {
            var ontology = fs.readFileSync(__dirname + '/schema.ttl').toString();
            store.load('text/turtle', ontology, function(err, data) {
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
});

describe('Add semantic types from different data sources', function() {
    var graph = new Graph();
    var updated_graph;
    before(function() {
        updated_graph = graph_generator.add_semantic_types(__dirname + '/semantic_types_test.json', graph)
    });
    it('The graph should have at least the following nodes: schema:Person, identifier, affiliation', function() {
        assert.deepEqual(true, updated_graph.hasNode('schema:Person'));
        assert.deepEqual(true, updated_graph.hasNode('identifier'));
        assert.deepEqual(true, updated_graph.hasNode('affiliation'));
    });
});

describe('Create semantic types nodes of a single data source', function() {
    var graph = new Graph();
    var st = {
        'source': 'data/schema.csv',
        'attributes': ['identifier', 'name', 'affiliation', 'birth_date'],
        'semantic_types': [
            ['schema:Person_schema:identifier'],
            ['schema:Person_schema:name'],
            ['schema:Organization_schema:legalName,'],
            ['schema:Person_schema:birth_date']
        ],
        'scores': [
            [0.5],
            [0.7],
            [0.1],
            [0.4]
        ]
    };
    var updated_graph;
    before(function() {
        updated_graph = graph_generator.create_semantic_types_nodes(st, graph);
    });
    it('The graph should have at least the following nodes: schema:Person, identifier, affiliation', function() {
        assert.deepEqual(true, updated_graph.hasNode('schema:Person'));
        assert.deepEqual(true, updated_graph.hasNode('identifier'));
        assert.deepEqual(true, updated_graph.hasNode('affiliation'));
    });
});

describe('Add closures classes of a class node inside the graph', function() {
    it('The graph contanis the following class nodes: schema:Organization, schema:School, schema:CollegeOrUniversity', function() {
        var graph = new Graph();
        var closure_classes = ['schema:Organization', 'schema:School', 'schema:CollegeOrUniversity'];
        var updated_graph = graph_generator.add_closures(closure_classes, graph);
        assert.deepEqual(true, updated_graph.hasNode('schema:Organization'));
        assert.deepEqual(true, updated_graph.hasNode('schema:School'));
        assert.deepEqual(true, updated_graph.hasNode('schema:CollegeOrUniversity'));
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
        // TODO rdf store should be created before all functions that exploit it
        rdfstore.create(function(err, store) {
            var ontology = fs.readFileSync(__dirname + '/schema.ttl').toString();
            store.load('text/turtle', ontology, function(err, data) {
                // Get closures
                graph_generator.get_closures(closure_query, store, function(closure_classes) {
                    assert.deepEqual(closure_classes[0], 'schema:Organization');
                    assert.deepEqual(closure_classes[1], 'schema:School');
                    assert.deepEqual(closure_classes[2], 'schema:CollegeOrUniversity');
                });
            });
        });
    });
});

describe('Test on graph.js', function() {
    it('Graph should be built', function() {
        graph_generator.buildGraph(__dirname + '/semantic_types_test.json', __dirname + '/schema.ttl');
    });
});
