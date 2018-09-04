var fs = require('fs');
var rdfstore = require('rdfstore');
var assert = require('assert');
var graphlib = require('graphlib');
var Graph = require('graphlib').Graph;
var steiner = require(__dirname + '/../../semantic_modeling/fast-steiner-tree.js');

describe('Steiner algorithm test suite\n', function() {

    describe('Test the algorithm', function() {
        var graph = new Graph({
            multigraph: true,
        });

        // Since it is an undirected graph, I have to represent both-directional edges
        // Bellman-Ford works only with directed graphs, so I need to specify this kind of edges for testing
        graph.setEdge('V1', 'V9', {}, 'V1---V9', 1);
        graph.setEdge('V9', 'V1', {}, 'V9---V1', 1);

        graph.setEdge('V9', 'V8', {}, 'V9---V8', 0.5);
        graph.setEdge('V8', 'V9', {}, 'V8---V9', 0.5);

        graph.setEdge('V8', 'V7', {}, 'V8---V7', 0.5);
        graph.setEdge('V7', 'V8', {}, 'V7---V8', 0.5);

        graph.setEdge('V7', 'V6', {} , 'V7---V6', 1);
        graph.setEdge('V6', 'V7', {} , 'V6---V7', 1);

        graph.setEdge('V6', 'V5', {} , 'V6---V5', 1);
        graph.setEdge('V5', 'V6', {} , 'V5---V6', 1);

        graph.setEdge('V9', 'V5', {} , 'V9---V5', 1);
        graph.setEdge('V5', 'V9', {} , 'V5---V9', 1);

        graph.setEdge('V5', 'V4', {} , 'V5---V4', 2);
        graph.setEdge('V4', 'V5', {} , 'V4---V5', 2);

        graph.setEdge('V4', 'V3', {} , 'V4---V3', 9);
        graph.setEdge('V3', 'V4', {} , 'V3---V4', 9);

        graph.setEdge('V5', 'V3', {} , 'V5---V3', 2);
        graph.setEdge('V3', 'V5', {} , 'V3---V5', 2);

        graph.setEdge('V3', 'V2', {} , 'V3---V2', 8);
        graph.setEdge('V2', 'V3', {} , 'V2---V3', 8);

        graph.setEdge('V2', 'V6', {} , 'V2---V6', 1);
        graph.setEdge('V6', 'V2', {} , 'V6---V2', 1);

        graph.setEdge('V1', 'V2', {} , 'V1---V2', 10);
        graph.setEdge('V2', 'V1', {} , 'V2---V1', 10);

        var s = ['V1', 'V2', 'V3', 'V4'];

        var G1 = steiner.step_one(graph, s);
        var G2 = steiner.step_two(G1);
        var G3 = steiner.step_three(G2, graph);
        var G4 = steiner.step_four(G3);
        var G5 = steiner.step_five(G4, s);
        console.log('Steiner Tree of a general graph: ');
        console.log(graphlib.json.write(G5));
        console.log('\n');
    });

    describe('Test with semantic types', function() {
        var graph = new Graph({
            multigraph: true,
        });

        var sampleData = [{
            'source': 'data/schema.csv',
            'attributes': ['identifier', 'name', 'birth_date'], // Removed affiliation from starting sample
            'semantic_types': [
                ['schema:Person_schema:identifier'],
                ['schema:Person_schema:name'], // Removed ['schema:Organization_schema:legalName,'] from starting sample
                ['schema:Person_schema:birth_date']
            ],
            'scores': [
                [0.5],
                [0.7],
                [0.1],
                [0.4]
            ]
        }];

        var attributes = sampleData[0]['attributes'];
        var semantic_types = sampleData[0]['semantic_types'];

        for (var i in attributes) {
            // Add class node
            // TODO: check if a class node already exists in the graph.
            var class_node = semantic_types[i][0].split('_')[0];
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
                label: semantic_types[i][0].split('_')[1],
                type: 'property_uri'
            }, semantic_types[i][0].split('_')[1], 1);
        }

        // TODO: Understand why I need to add this edge
        graph.setEdge('identifier', 'schema:Person', {}, 'test', 3);

        var steiner_nodes = attributes;
        var G1 = steiner.step_one(graph, steiner_nodes);
        var G2 = steiner.step_two(G1);
        var G3 = steiner.step_three(G2, graph);
        var G4 = steiner.step_four(G3);
        var G5 = steiner.step_five(G4, steiner_nodes);
        console.log('Steiner Tree of a RDF-similar and weighted graph: ');
        console.log(graphlib.json.write(G5));
    });
});
