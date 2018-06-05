var Graph = require('graphlib').Graph;
var graph_generator = require(__dirname + '/../../semantic_modeling/graph.js');
var assert = require('assert');

describe('Add semantic types from different data sources', function () {
    var graph = new Graph();
    var updated_graph;
    before(function () {
        updated_graph = graph_generator.add_semantic_types(__dirname + '/semantic_types_test.json', graph)
    });
    it('The graph should have at least the following nodes: schema:Person, identifier, affiliation', function () {
        assert.deepEqual(true, updated_graph.hasNode('schema:Person'));
        assert.deepEqual(true, updated_graph.hasNode('identifier'));
        assert.deepEqual(true, updated_graph.hasNode('affiliation'));
    });
});

describe('Create semantic types nodes of a single data source', function () {
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
    before(function () {
        updated_graph = graph_generator.create_semantic_types_nodes(st, graph);
    });
    it('The graph should have at least the following nodes: schema:Person, identifier, affiliation', function () {
        assert.deepEqual(true, updated_graph.hasNode('schema:Person'));
        assert.deepEqual(true, updated_graph.hasNode('identifier'));
        assert.deepEqual(true, updated_graph.hasNode('affiliation'));
    });

});

describe('Get closures of class node defined in the graph', function () {
    it('', function (){

    });
});

describe('Test on graph.js', function () {
    it('Graph should be built', function () {
        graph_generator.buildGraph(__dirname + '/semantic_types_test.json', __dirname + '/schema.ttl');
    });
});
