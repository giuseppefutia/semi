/**
 * This approach is taken from the paper 'A fast algorithm for steiner trees' by L. Kou et. al.
 * https://github.com/usc-isi-i2/szeke/blob/master/src/main/java/edu/isi/karma/modeling/alignment/SteinerTree.java
 **/

var Graph = require('graphlib').Graph;
var graphlib = require('graphlib');
var _ = require('underscore');


var get_weight = (e) => {
    return e['weight'];
}

var degree = (g, n) => {
    var d = 0;
    var edges = g.edges();
    for (var e in edges) {
        if (edges[e]['v'] === n)
            d++;
        else if (edges[e]['w'] === n)
            d++;
    }
    return d;
}

var touched_edges = (g, n) => {
    var te = [];
    var edges = g.edges();
    for (var e in edges) {
        if (edges[e]['v'] === n)
            te.push(edges[e]);
        else if (edges[e]['w'] === n)
            te.push(edges[e]);
    }
    return te;
}

// TODO: correct according to the effective representation of the edge object
var get_path_edge_list = function(source, target, dijkstraOutput, graph) {
    var edges = [];
    var target_predecessor = dijkstraOutput[target]['predecessor'];
    while (target_predecessor != source) {
        // XXX Cannot understan why graph.edge() returns undefined and graph.getEdge() does not exist
        var weight = 'Infinity';
        for (var e in graph.edges()) {
            var graph_edge = graph.edges()[e];
            if (graph_edge['v'] === target_predecessor && graph_edge['w'] === target)
                weight = graph_edge['weight'];
        }
        var object = {
            label: target_predecessor + '_' + target
        }
        var intermediate_edge = {
            v: target_predecessor,
            w: target,
            value: object,
            name: target_predecessor + '_' + target,
            weight: weight
        };
        edges.push(intermediate_edge);
        target = target_predecessor;
        target_predecessor = dijkstraOutput[target]['predecessor']
    }
    var object = {
        label: source + '_' + target
    }
    var last_edge = {
        v: source,
        w: target,
        value: object,
        name: source + '_' + target,
        weight: dijkstraOutput[target]['distance']
    };
    edges.push(last_edge);
    return edges;
}

var bellman_ford = (nodes, edges, source) => {
    var distances = {};
    var parents = {};
    var c;
    if (source) {
        // Initialization: all distances are Infinity, all parents are null
        for (var i = 0; i < nodes.length; i++) {
            distances[nodes[i]] = Infinity;
            parents[nodes[i]] = null;
        }
        distances[source] = 0;

        for (i = 0; i < nodes.length - 1; i++) {
            for (var j = 0; j < edges.length; j++) {
                c = edges[j];
                if (distances[c.v] + c.weight < distances[c.w]) {
                    distances[c.w] = distances[c.v] + c.weight;
                    parents[c.w] = c.v;
                }
            }
        }

        // Check negative edges
        for (i = 0; i < edges.length; i += 1) {
            c = edges[i];
            if (distances[c.v] + c.weight < distances[c.w]) {
                return undefined;
            }
        }
    }
    return {
        parents: parents,
        distances: distances
    };
}

// TODO: do not use the underscore library
var kruskal = (nodes, edges) => {
    // Init new graph that will contain minimum spanning tree of original graph.
    var mst = [];
    var forest = _.map(nodes, function(node) {
        return [node];
    });
    var sortedEdges = _.sortBy(edges, function(edge) {
        return -edge.weight;
    });
    while (forest.length > 1) {
        var edge = sortedEdges.pop();
        var n1 = edge['v'],
            n2 = edge['w'];

        var t1 = _.filter(forest, function(tree) {
            return _.include(tree, n1);
        });

        var t2 = _.filter(forest, function(tree) {
            return _.include(tree, n2);
        });

        if (JSON.stringify(t1) != JSON.stringify(t2)) {
            forest = _.without(forest, t1[0], t2[0]);
            forest.push(_.union(t1[0], t2[0]));
            mst.push(edge);
        }
    }
    return mst;
}


// Step1: construct the complete undirected distance graph G1 = (V1,E1,d1) from G and S
var step_one = (graph, steiner_nodes) => {
    var G1 = new Graph({
        multigraph: true,
    });
    // Create a graph with only steiner nodes: the semantic types, in our case
    for (var i in steiner_nodes) {
        G1.setNode(steiner_nodes[i]);
    }
    var nodes = graph.nodes(); // Return ids of the nodes
    var edges = graph.edges(); // Return edge objects {v: .., w: .., name: .., weight: ..}

    for (var source in steiner_nodes) {
        // Get the minimum spanning tree according to the bellman-ford algorithm
        var path = bellman_ford(nodes, edges, steiner_nodes[source]);
        for (var target in steiner_nodes) {
            if (steiner_nodes[source] === steiner_nodes[target]) // Continue if the node are equals
                continue;
            if (G1.nodeEdges(steiner_nodes[source], steiner_nodes[target]).length > 0) // Continue if there are no edges between the soruce node and the target node
                continue;
            G1.setEdge(steiner_nodes[source],
                steiner_nodes[target], {
                    label: steiner_nodes[source] + '_' + steiner_nodes[target]
                },
                steiner_nodes[source] + '_' + steiner_nodes[target],
                path['distances'][steiner_nodes[target]]); // Add and edge between the source and the target using the distances computed with bellman-ford
        }
    }
    return G1;
}

// Step 2: Find the minimal spanning tree, T1, of G1. (If there are several minimal spanning trees, pick an arbitrary one.)
function step_two(graph) {
    var G2 = new Graph({
        multigraph: true
    });
    var nodes = graph.nodes();
    var edges = graph.edges();
    var kruskal_edges = kruskal(nodes, edges);
    var sortedEdges = _.sortBy(kruskal_edges, function(edge) {
        return edge.name;
    });
    for (var e in sortedEdges) {
        var edge = sortedEdges[e];
        G2.setEdge(edge.v, edge.w, {}, edge.name, edge.weight);
    }
    return G2;
}

// Construct the subgraph, Gs, of G by replacing each edge in T1 by its corresponding shortest path in G.
// (If there are several shortest paths, pick an arbitrary one.)
// In this case graph is the original graph
function step_three(G2, graph) {
    var G3 = new Graph({
        multigraph: true
    });
    var edges = G2.edges();

    for (var e in edges) {
        var source = edges[e]['v'];
        var target = edges[e]['w'];

        // XXX dijkstra can work only with a complete graph
        var path = graphlib.alg.dijkstra(graph, source, get_weight);
        var path_edges = get_path_edge_list(source, target, path, graph);

        // XXX: in the Mohsen code, he ckeck if the path_edges is null. Actually, I assume that I work on a complete graph (I always put the Thing concept)
        for (var i in path_edges) {
            if (G3.nodeEdges(path_edges['v'], path_edges['w']) != undefined)
                continue;
            source = path_edges[i]['v'];
            target = path_edges[i]['w'];
            if (G3.node(source) === undefined)
                G3.setNode(source);
            if (G3.node(target) === undefined)
                G3.setNode(target);
            G3.setEdge(source, target, {}, source + '_' + target, path_edges[i]['weight']);
        }
    }
    return G3;
}

// Find the minimal spanning tree, Ts, of Gs. (If there are several minimal spanning trees, pick an arbitrary one.) @param g3
function step_four(G3) {
    var G4 = new Graph({
        multigraph: true
    });
    var nodes = G3.nodes();
    var edges = G3.edges();
    var kruskal_edges = kruskal(nodes, edges);
    var sortedEdges = _.sortBy(kruskal_edges, function(edge) {
        return edge.name;
    });
    for (var e in sortedEdges) {
        var edge = sortedEdges[e];
        G4.setEdge(edge.v, edge.w, {}, edge.name, edge.weight);
    }
    return G4;
}

// Construct a Steiner tree, Th, from Ts by deleting edges in Ts,if necessary,
// so that all the leaves in Th are Steiner points.
function step_five(G4, steiner_nodes) {
    var G5 = G4;
    var non_steiner_leaves = [];
    var nodes = G4.nodes();
    for (var n in nodes) {
        if (degree(G5, nodes[n]) == 1 && steiner_nodes.indexOf(nodes[n]) == -1)
            non_steiner_leaves.push(nodes[n]);
    }
    var source,
        target;
    for (var i in non_steiner_leaves) {
        source = non_steiner_leaves[i];
        do {
            var first_edge = touched_edges(G5, source)[0];
            target = first_edge['w'];
            // Mohsen put a check in which source is equal to target, but in theory we do not have
            G5.removeNode(source);
            source = target;
        } while (degree(G5, source) == 1 && steiner_nodes.indexOf(source) == -1);
    }
    return G5;
}

var steiner_alg = (graph, steiner_nodes) {
    var G1 = step_one(graph, steiner_nodes);
    var G2 = step_two(G1);
    var G3 = step_three(G2, graph);
    var G4 = step_four(G3);
    var G5 = step_five(G4, steiner_nodes);
    return G5;
}

exports.step_one = step_one;
exports.step_two = step_two;
exports.step_three = step_three;
exports.step_four = step_four;
exports.step_five = step_five;
exports.steiner_alg = steiner_alg;
