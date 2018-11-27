var fs = require('fs');
var rdfstore = require('rdfstore');
var assert = require('assert');
var graphlib = require('graphlib');
var Graph = require('graphlib').Graph;
var steiner = require(__dirname + '/../../semantic_modeling/steiner_tree.js');
var graph_generator = require(__dirname + '/../../semantic_modeling/graph.js');

describe('Steiner algorithm test suite\n', function() {

    describe('Test creation of inverse edges', function() {
        var graph = new Graph({
            multigraph: true,
        });
        graph.setEdge('V9', 'V1', {
            label: 'property_label',
            type: 'property'
        }, 'V9***V1', 1);
        graph.setEdge('V9', 'V8', {
            type: 'property',
            label: 'property_label'
        }, 'V9***V8', 0.5);
        graph.setEdge('V8', 'V7', {
            type: 'property',
            label: 'property_label'
        }, 'V8***V7', 0.5);

        var new_graph = steiner.create_inverse_edges(graph);

        it('It should crate the following edges: V1***V9', function() {
            assert.deepEqual(new_graph.edges()[3]['name'], 'V1***V9');
        });
    });

    describe('Test Steiner tree algorithm with a general graph', function() {
        // Algorithm tested with the example available here: https://www.researchgate.net/publication/227056882_A_Fast_Algorithm_for_Steiner_Trees.
        var graph = new Graph({
            multigraph: true,
        });

        graph.setEdge('V9', 'V1', {
            type: 'property',
            label: 'This is the edge from V9 to V1'
        }, 'V9***V1', 1);
        graph.setEdge('V9', 'V8', {
            type: 'property',
            label: 'This is the edge from V9 to V8'
        }, 'V9***V8', 0.5);
        graph.setEdge('V8', 'V7', {
            type: 'property',
            label: 'This is the edge from V8 to V7'
        }, 'V8***V7', 0.5);
        graph.setEdge('V7', 'V6', {
            type: 'property',
            label: 'This is the edge from V7 to V6'
        }, 'V7***V6', 1);
        graph.setEdge('V6', 'V5', {
            type: 'property',
            label: 'This is the edge from V6 to V5'
        }, 'V6***V5', 1);
        graph.setEdge('V9', 'V5', {
            type: 'property',
            label: 'This is the edge from V9 to V5'
        }, 'V9***V5', 1);
        graph.setEdge('V5', 'V4', {
            type: 'property',
            label: 'This is the edge from V5 to V4'
        }, 'V5***V4', 2);
        graph.setEdge('V4', 'V3', {
            type: 'property',
            label: 'This is the edge from V4 to V3'
        }, 'V4***V3', 9);
        graph.setEdge('V5', 'V3', {
            type: 'property',
            label: 'This is the edge from V5 to V3'
        }, 'V5***V3', 2);
        graph.setEdge('V3', 'V2', {
            type: 'property',
            label: 'This is the edge from V3 to V2'
        }, 'V3***V2', 8);
        graph.setEdge('V2', 'V6', {
            type: 'property',
            label: 'This is the edge from V2 to V6'
        }, 'V2***V6', 1);
        graph.setEdge('V1', 'V2', {
            type: 'property',
            label: 'This is the edge from V1 to V2'
        }, 'V1***V2', 10);

        var graph = steiner.create_inverse_edges(graph);

        var s = ['V1', 'V2', 'V3', 'V4'];

        var G1 = steiner.step_one(graph, s);
        var G2 = steiner.step_two(G1);
        var G3 = steiner.step_three(G2, graph);
        var G4 = steiner.step_four(G3);
        var G5 = steiner.step_five(G4, s);

        // Reminder: you artificially create inverse edges to make the graph undirected.
        // For such reasons, the label of the test node must be the same of the original dat
        var test_edges = [{
                v: 'V1',
                w: 'V9',
                name: 'V1***V9',
                value: {
                    type: 'property',
                    label: 'This is the edge from V9 to V1'
                },
                weight: 1
            },
            {
                v: 'V2',
                w: 'V6',
                name: 'V2***V6',
                value: {
                    type: 'property',
                    label: 'This is the edge from V2 to V6'
                },
                weight: 1
            },
            {
                v: 'V3',
                w: 'V5',
                name: 'V3***V5',
                value: {
                    type: 'property',
                    label: 'This is the edge from V5 to V3'
                },
                weight: 2
            },
            {
                v: 'V5',
                w: 'V4',
                name: 'V5***V4',
                value: {
                    type: 'property',
                    label: 'This is the edge from V5 to V4'
                },
                weight: 2
            },
            {
                v: 'V6',
                w: 'V5',
                name: 'V6***V5',
                value: {
                    type: 'property',
                    label: 'This is the edge from V6 to V5'
                },
                weight: 1
            },
            {
                v: 'V9',
                w: 'V5',
                name: 'V9***V5',
                value: {
                    type: 'property',
                    label: 'This is the edge from V9 to V5'
                },
                weight: 1
            }
        ];

        it('Test Steiner tree algorithm with public contracts data', function() {
            assert.deepEqual(graphlib.json.write(G5)['edges'], test_edges);
        });
    });

    describe('Test with other semantic types (more similar to our case)', function() {
        var graph = new Graph({
            multigraph: true
        });

        var sampleData = {
            'source': 'data/schema.csv',
            'attributes': ['authority_identifier', 'contract_identifier', 'business_entity_identifier'], // Removed affiliation from starting sample
            'entities': [0, 0, 1],
            'semantic_types': [
                ['gr:BusinessEntity_dcterms:identifier'],
                ['pc:Contract_dcterms:identifier'],
                ['gr:BusinessEntity_dcterms:identifier']
            ],
        };
        // Add semantic types
        graph_generator.add_semantic_types(sampleData, graph);

        // Add edges between semantic types
        graph.setEdge('pc:Contract0', 'gr:BusinessEntity0', {}, 'pc:Contract0***gr:BusinessEntity0', 1);
        graph.setEdge('pc:Contract0', 'gr:BusinessEntity1', {}, 'pc:Contract0***gr:BusinessEntity1', 5);
        graph.setEdge('pc:Contract0', 'pc:Tender0', {}, 'pc:Contract0***pc:Tender0', 1);
        graph.setEdge('pc:Tender0', 'gr:BusinessEntity1', {}, 'pc:Tender0***gr:BusinessEntity1', 1);

        // Add inverse edges
        var graph = steiner.create_inverse_edges(graph);

        var steiner_nodes = sampleData['attributes'];
        var G1 = steiner.step_one(graph, steiner_nodes);
        var G2 = steiner.step_two(G1);
        var G3 = steiner.step_three(G2, graph);
        var G4 = steiner.step_four(G3);
        var G5 = steiner.step_five(G4, steiner_nodes);

        //console.log(graphlib.json.write(graph));

        var test_edges = [{
                v: 'authority_identifier',
                w: 'gr:BusinessEntity0',
                name: 'authority_identifier***gr:BusinessEntity0',
                value: {
                    "label": "dcterms:identifier",
                    "type": "st_property_uri"
                },
                weight: 1
            },
            {
                v: 'contract_identifier',
                w: 'pc:Contract0',
                name: 'contract_identifier***pc:Contract0',
                value: {
                    "label": "dcterms:identifier",
                    "type": "st_property_uri"
                },
                weight: 1
            },
            {
                v: 'gr:BusinessEntity0',
                w: 'pc:Contract0',
                name: 'gr:BusinessEntity0***pc:Contract0',
                value: {},
                weight: 1
            },
            {
                v: 'gr:BusinessEntity1',
                w: 'business_entity_identifier',
                name: 'gr:BusinessEntity1***business_entity_identifier',
                value: {
                    "label": "dcterms:identifier",
                    "type": "st_property_uri"
                },
                weight: 1
            },
            {
                v: 'pc:Contract0',
                w: 'pc:Tender0',
                name: 'pc:Contract0***pc:Tender0',
                value: {},
                weight: 1
            },
            {
                v: 'pc:Tender0',
                w: 'gr:BusinessEntity1',
                name: 'pc:Tender0***gr:BusinessEntity1',
                value: {},
                weight: 1
            }
        ];

        it('The graph should have the edges defined in the test', function() {
            assert.deepEqual(graphlib.json.write(G5)['edges'], test_edges);
        });
    });
});