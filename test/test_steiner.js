var Graph = require('graphlib').Graph;
var graphlib = require('graphlib');
var steiner = require(__dirname + '/../src/semantic_modeling/steiner_tree.js');

var test_graph = new Graph({
    multigraph: true
});

// Set nodes

test_graph.setNode('V1', {
    type: 'steiner',
    label: 'V1'
});

test_graph.setNode('V2', {
    type: 'steiner',
    label: 'V2'
});

test_graph.setNode('V3', {
    type: 'steiner',
    label: 'V3'
});

test_graph.setNode('V4', {
    type: 'steiner',
    label: 'V4'
});

test_graph.setNode('V5', {
    type: 'internal',
    label: 'V5'
});

test_graph.setNode('V6', {
    type: 'internal',
    label: 'V6'
});

test_graph.setNode('V7', {
    type: 'internal',
    label: 'V7'
});

test_graph.setNode('V8', {
    type: 'internal',
    label: 'V8'
});

test_graph.setNode('V9', {
    type: 'internal',
    label: 'V9'
});

// Set edges
test_graph.setEdge('V1', 'V2', {
    label: 'V1***V2',
    type: 'edge',
    weight: 10
}, 'V1***V10', 10);

test_graph.setEdge('V1', 'V9', {
    label: 'V1***V9',
    type: 'edge',
    weight: 10
}, 'V1***V9', 10);

test_graph.setEdge('V1', 'V9', {
    label: 'V1***V9',
    type: 'edge',
    weight: 0.0033432423
}, 'V1***V9', 0.0033432423);

test_graph.setEdge('V1', 'V9', {
    label: 'V1***V9',
    type: 'edge',
    weight: 5
}, 'V1***V9', 5);

test_graph.setEdge('V9', 'V8', {
    label: 'V9***V8',
    type: 'edge',
    weight: 0.5
}, 'V9***V8', 0.5);

test_graph.setEdge('V8', 'V7', {
    label: 'V8***V7',
    type: 'edge',
    weight: 0.5
}, 'V8***V7', 0.5);

test_graph.setEdge('V7', 'V6', {
    label: 'V7***V6',
    type: 'edge',
    weight: 1
}, 'V7***V6', 1);

test_graph.setEdge('V6', 'V5', {
    label: 'V6***V5',
    type: 'edge',
    weight: 1
}, 'V6***V5', 1);

test_graph.setEdge('V9', 'V5', {
    label: 'V9***V5',
    type: 'edge',
    weight: 1
}, 'V9***V5', 1);

test_graph.setEdge('V2', 'V6', {
    label: 'V2***V6',
    type: 'edge',
    weight: 1
}, 'V2***V6', 1);

test_graph.setEdge('V5', 'V4', {
    label: 'V5***V4',
    type: 'edge',
    weight: 2
}, 'V5***V4', 2);

test_graph.setEdge('V4', 'V3', {
    label: 'V4***V3',
    type: 'edge',
    weight: 0.05
}, 'V4***V3', 0.05);

test_graph.setEdge('V2', 'V3', {
    label: 'V2***V3',
    type: 'edge',
    weight: 8
}, 'V2***V3', 8);

test_graph.setEdge('V5', 'V3', {
    label: 'V5***V3',
    type: 'edge',
    weight: 20
}, 'V5***V3', 20);

test_graph.setEdge('V5', 'V3', {
    label: 'V5***V3',
    type: 'edge',
    weight: 1
}, 'V5***V3', 1);


test_graph.setEdge('V4', 'V3', {
    label: 'V4***V3',
    type: 'edge',
    weight: 0.1
}, 'V4***V3', 0.1);

var enriched_graph = steiner.create_inverse_edges(test_graph);
var steiner_tree = steiner.steiner_alg(enriched_graph, ['V1', 'V2', 'V3', 'V4']);
var json_steiner = graphlib.json.write(steiner_tree);

console.log(json_steiner)