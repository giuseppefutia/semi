/**
 * This approach is taken from the paper 'A fast algorithm for steiner trees' by L. Kou et. al.
 * https://github.com/usc-isi-i2/szeke/blob/master/src/main/java/edu/isi/karma/modeling/alignment/SteinerTree.java
 **/

// TODO: Move the function to create inverse edges in the graph.js file
// TODO: Rename this file

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

// We need to create inverse edges to simulate indirected graphs
var create_inverse_edges = (g) => {
    // The graph is serialized to get value object of labels.
    // See issue: https://github.com/giuseppefutia/phd/issues/66
    var graph = graphlib.json.write(g);
    var edges = graph['edges'];
    for (var e in edges) {
        var value = {
            type: edges[e]['value']['type'],
            label: edges[e]['value']['label'] + '***' + 'inverted'
        }
        g.setEdge(edges[e]['w'], edges[e]['v'], value, edges[e]['w'] + '***' + edges[e]['v'], edges[e]['weight']);
    }
    return g;
}

// TODO: correct according to the effective representation of the edge object
var get_path_edge_list = function(source, target, dijkstraOutput, graph) {
    var edges = [];
    var target_predecessor = dijkstraOutput[target]['predecessor'];
    while (target_predecessor != source) {
        // XXX Cannot understand why graph.edge() returns undefined and graph.getEdge() does not exist
        var weight = 'Infinity';
        var value = {};
        for (var e in graph.edges()) {
            var graph_edge = graph.edges()[e];
            if (graph_edge['v'] === target_predecessor && graph_edge['w'] === target) {
                weight = graph_edge['weight'];
                value = graph_edge['value'];
            }
        }
        // Create an object for target and target predecessor: I mantain the node information also in the steiner tree
        var target_predecessor_obj = {
            name: target_predecessor,
            type: graph.node(target_predecessor)['type'],
            label: graph.node(target_predecessor)['label']
        };

        var target_obj = {
            name: target,
            type: graph.node(target)['type'],
            label: graph.node(target)['label']
        }

        var intermediate_edge = {
            v: target_predecessor_obj,
            w: target_obj,
            value: value,
            name: target_predecessor + '***' + target,
            weight: weight
        };
        edges.push(intermediate_edge);
        target = target_predecessor;
        target_predecessor = dijkstraOutput[target]['predecessor']
    }
    var out_edges = graph.outEdges(source, target);

    var source_obj = {
        name: source,
        type: graph.node(source)['type'],
        label: graph.node(source)['label']
    }

    var target_obj = {
        name: target,
        type: graph.node(target)['type'],
        label: graph.node(target)['label']
    }

    var last_edge = {
        v: source_obj,
        w: target_obj,
        value: out_edges[0]['value'],
        name: source + '***' + target,
        weight: dijkstraOutput[target]['distance']
    };
    edges.push(last_edge);
    return edges;
}

// Implementation available on Wikipedia: https://en.wikipedia.org/wiki/Bellman%E2%80%93Ford_algorithm
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
        // Process edges
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
        // I use bellman ford because I can have negative values related to epsilon
        var path = bellman_ford(nodes, edges, steiner_nodes[source]);
        for (var target in steiner_nodes) {
            if (steiner_nodes[source] === steiner_nodes[target])
                continue; // Continue if the node are equals
            if (G1.nodeEdges(steiner_nodes[source], steiner_nodes[target]).length > 0)
                continue; // Continue if there are no edges between the source node and the target node
            G1.setEdge(steiner_nodes[source],
                steiner_nodes[target], {},
                steiner_nodes[source] + '***' + steiner_nodes[target],
                // Add and edge between the source and the target using the distances computed with bellman-ford
                path['distances'][steiner_nodes[target]]);
        }
    }
    return G1;
}

// Step 2: Find the minimal spanning tree, T1, of G1. (If there are several minimal spanning trees, pick an arbitrary one.)
var step_two = (graph) => {
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
var step_three = (G2, graph) => {
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
            if (G3.node(source['name']) === undefined) {
                G3.setNode(source['name'], {
                    type: source['type'],
                    label: source['label']
                });
            }
            if (G3.node(target) === undefined) {
                G3.setNode(target['name'], {
                    type: target['type'],
                    label: target['label']
                });
            }
            G3.setEdge(source['name'], target['name'], path_edges[i]['value'], source['name'] + '***' + target['name'], path_edges[i]['weight']);
        }
    }
    return G3;
}

// Find the minimal spanning tree, Ts, of Gs. (If there are several minimal spanning trees, pick an arbitrary one.) @param g3
var step_four = (G3) => {
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
        if (G4.node(edge.v) === undefined) {
            // Get information from node G3
            G4.setNode(edge.v, {
                type: G3.node(edge.v)['type'],
                label: G3.node(edge.v)['label']
            });
        }
        if (G4.node(edge.w) === undefined) {
            G4.setNode(edge.w, {
                type: G3.node(edge.w)['type'],
                label: G3.node(edge.w)['label']
            });
        }
        G4.setEdge(edge.v, edge.w, edge.value, edge.name, edge.weight);
    }
    return G4;
}

// Construct a Steiner tree, Th, from Ts by deleting edges in Ts,if necessary,
// so that all the leaves in Th are Steiner points.
var step_five = (G4, steiner_nodes) => {
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

var steiner_alg = (graph, steiner_nodes) => {
    var G1 = step_one(graph, steiner_nodes);
    var G2 = step_two(G1);
    var G3 = step_three(G2, graph);
    var G4 = step_four(G3);
    var G5 = step_five(G4, steiner_nodes);
    return G5;
}

exports.create_inverse_edges = create_inverse_edges;
exports.step_one = step_one;
exports.step_two = step_two;
exports.step_three = step_three;
exports.step_four = step_four;
exports.step_five = step_five;
exports.steiner_alg = steiner_alg;