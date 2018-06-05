var Graph = require('graphlib').Graph;
var graph_generator = require(__dirname + '/../../semantic_modeling/graph.js');
var assert = require('assert');

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
    it('The graph should have at least the following nodes: schema:Person, schema:identifier, schema:legalName', function () {
        assert.deepEqual(true, updated_graph.hasNode('schema:Person'));
    });

});

describe('Test on graph.js', function () {
    it('Graph should be built', function () {
        graph_generator.buildGraph(__dirname + '/schema.ttl');
    });
});
