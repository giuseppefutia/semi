var fs = require('fs');
var graphlib = require('graphlib');
var Graph = require('graphlib').Graph;
var average = require(__dirname + '/average.js');
var graph = require(__dirname + '/../semantic_modeling/graph.js');


/**
 * Perform the refinement of the semantic model based on the triples score
 * @param st_path
 * @param score_path
 * @param init_sm_path
 * @param plausible_sm_path
 * @param ref_sm_path
 **/
var refine = (st_path, score_path, init_sm_path, plausible_sm_path, ref_sm_path) => {

    // Load semantic models data
    var plausible_sm = load_graph_sm(plausible_sm_path);
    var init_sm = load_graph_sm(init_sm_path);
    var semantic_types = JSON.parse(fs.readFileSync(st_path, 'utf8'));

    // Get scores obtained from the machine learning model
    var relation_scores = average.compute_score_average(score_path);

    // Get highest-scored paths included in plausible semantic models
    var paths = get_paths_between_semantic_types(init_sm, plausible_sm, relation_scores);

    // Reconstruct the graph with the highest-scored paths
    var refined_graph = reconstruct_sm_graph(semantic_types, plausible_sm, paths);

    return refined_graph;
}

var reconstruct_sm_graph = (semantic_types, plausible_sm, paths) => {
    var highest_score_paths = [];
    var edges = plausible_sm.edges();
    var refined_graph = new Graph({
        multigraph: true
    });

    for (var st of semantic_types) {
        refined_graph = graph.add_semantic_types(st, refined_graph)
    }

    // For each pair of semantic types set the path in which the average value
    // of each relation score is the highest
    for (var p in paths) {
        var highest_path = {};
        highest_path['src'] = paths[p]['src'];
        highest_path['dst'] = paths[p]['dst'];
        highest_path['path'] = set_path_with_highest_score(paths[p]['paths']);
        highest_score_paths.push(highest_path);
    }

    // Create the new graph with the refined semantic model
    // TODO: Need to simplify it!
    for (var h in highest_score_paths) {
        var path = highest_score_paths[h]['path'];
        for (var step of path) {
            for (var edge of edges) {
                if (step['src'] === edge['v'] &&
                    step['dst'] === edge['w'] &&
                    step['rel']['name'] === edge['value']['label']) {
                    graph.add_edges(
                        refined_graph, edge['v'],
                        edge['w'],
                        edge['value']['label'],
                        edge['value']['type'],
                        edge['weight']
                    );
                }
            }
        }
    }
    return refined_graph
}

var set_path_with_highest_score = (paths) => {
    var path_with_highest_score = [];
    var score = 0;
    for (var p in paths) {
        var average_rel_score = 0;
        var steps = paths[p];
        for (var s in steps) {
            average_rel_score += steps[s]['rel']['score'];
        }
        average_rel_score /= steps.length;

        if (average_rel_score > score) {
            path_with_highest_score = paths[p];
        }
    }
    return path_with_highest_score;
}

var get_node_pairs = (sm) => {
    var pairs = [];
    var edges = sm.edges()
    for (var i in edges) {
        // We do not consider semantic types in the refinement
        if (edges[i]['value']['type'] !== 'st_property_uri') {
            var pair;
            if (edges[i]['value']['label'].includes('***inverted')) {
                pair = [edges[i]['w'], edges[i]['v']];
            } else {
                pair = [edges[i]['v'], edges[i]['w']];
            }
            pairs.push(pair);
        }
    }
    return pairs;
}

/**
 * BEGINNING: Utility functions to get paths (nodes and relations) between pairs of nodes representing semantic types
 **/

var get_paths_between_semantic_types = (init_sm, plausible_sm, relation_scores) => {
    // Get subjects and objectd to check and eventually refine the path between them
    var node_pairs = get_node_pairs(init_sm);

    // Get all traversed nodes between all pairs of semantic types
    var traversed_nodes = get_traversed_nodes_between_pairs(node_pairs, plausible_sm);

    // Get all paths representing the steps to go from the src node to the dst node
    return get_paths(traversed_nodes, plausible_sm.edges(), relation_scores);
}

/**
 * Get paths among all pairs of nodes representing semantic types
 * @param traversed_nodes
 * @param edges
 **/
var get_paths = (traversed_nodes, edges, relation_scores) => {
    var paths = [];
    for (var t in traversed_nodes) {
        var path = {};
        path['src'] = traversed_nodes[t]['src'];
        path['dst'] = traversed_nodes[t]['dst'];
        path['paths'] = get_all_paths_between_traversed_nodes(traversed_nodes[t], edges, relation_scores);
        paths.push(path);
    }
    return paths;
}

/**
 * Get all possible paths, considering traversed nodes, between a pair of nodes
 * @param traversed_nodes
 * @param edges
 **/
var get_all_paths_between_traversed_nodes = (traversed_nodes_single_pair, edges, relation_scores) => {
    var tns = traversed_nodes_single_pair['traversed_nodes'];
    var paths = [];
    for (var t in tns) {
        var traversed_nodes = tns[t].split(',');
        paths.push(get_relations_between_node_pairs(traversed_nodes, edges, relation_scores));
    }
    return paths;
}

/**
 * Get possibile relations between a pair of nodes among the traversed nodes and assign the score produced by the ML model
 * @param traversed_nodes
 * @param edges
 **/
var get_relations_between_node_pairs = (traversed_nodes, edges, relation_scores) => {
    // Get relations at each step during the traversal of the nodes
    var src_index = 0;
    var dst_index = 1;
    var paths = [];
    while (dst_index < traversed_nodes.length) {
        var path = {}
        path['src'] = traversed_nodes[src_index];
        path['dst'] = traversed_nodes[dst_index];
        path['rel'] = [];

        var relation = {
            'name': 'test',
            'score': 0
        };

        // Loop in edges included in all plausible semantic models to get the relations
        for (var i in edges) {
            if (edges[i]['v'] === traversed_nodes[src_index] &&
                edges[i]['w'] === traversed_nodes[dst_index]) {
                // Set the relation with the highest score
                var relation_value = edges[i]['value']['label'];
                if (relation_scores[relation_value] === undefined) {
                    console.log('WARNING: relation ' + relation_value + ' does not have a score! Maybe you have evaluated your model on the wrong dataset!');
                }
                if (relation_scores[relation_value] > relation['score']) {
                    relation['name'] = relation_value;
                    relation['score'] = relation_scores[relation_value];
                }
            }
        }
        path['rel'] = relation;
        paths.push(path);
        src_index += 1;
        dst_index += 1;
    }
    return paths;
}

/**
 * END: Utility functions to get paths (nodes and relations) between pairs of nodes representing semantic types
 **/


/**
 * BEGINNING: Utility functions to get traversed nodes in the graph between pairs of nodes
 **/

// TODO: Maybe we can chose a more efficient algorithm

/**
 * Get all traversed nodes between all node pairs representing semantic types within plausible semantic models
 * @param node_pairs
 * @param plausible_sm
 **/
var get_traversed_nodes_between_pairs = (node_pairs, plausible_sm) => {
    var traversed_nodes = [];
    for (var i in node_pairs) {
        tn = {};
        tn['src'] = node_pairs[i][0];
        tn['dst'] = node_pairs[i][1];
        tn['traversed_nodes'] = get_traversed_nodes(node_pairs[i][0], node_pairs[i][1], plausible_sm);
        traversed_nodes.push(tn);
    }
    return traversed_nodes;
}


/**
 * Get possible traversed nodes between two nodes included in plausible semantic models
 * @param u
 * @param v
 * @param plausible_sm
 **/
var get_traversed_nodes = (u, v, plausible_sm) => {
    var nodes = plausible_sm.nodes();
    var edges = plausible_sm.edges()

    // Mark all the vertices as not visited
    var visited = {};
    for (var n in nodes) {
        visited[nodes[n]] = false;
    }

    // Create an array to store paths
    var path = [];
    get_traversed_nodes_util(u, v, visited, path, plausible_sm);

    // XXX For now, store all the paths in a file
    var traversed_nodes = fs.readFileSync('traversed_nodes.txt', 'utf-8')
        .split('\n')
        .filter(Boolean);
    fs.unlinkSync('traversed_nodes.txt');
    return traversed_nodes;
}

/**
 * Util function for a recursive retrieve of paths between two nodes
 * @param u
 * @param v
 * @param visited
 * @param path
 * @param plausible_sm
 **/
var get_traversed_nodes_util = (u, v, visited, path, plausible_sm) => {
    // Mark the current node as visited and store in path
    visited[u] = true;
    path.push(u);

    // If current vertex is same as destination, log the current path
    if (u === v) {
        // XXX For now, store all the paths in a file
        fs.appendFileSync('traversed_nodes.txt', path + '\n');
    } else {
        for (var i in plausible_sm.successors(u)) {
            var successor = plausible_sm.successors(u)[i];
            if (visited[successor] === false) {
                get_traversed_nodes_util(successor, v, visited, path, plausible_sm);
            }
        }
    }
    // Remove current vertex from path[] and mark it as unvisited
    path.pop()
    visited[u] = false;
}

/**
 * END: Utility functions to get traversed nodes in the graph between pairs of nodes
 **/

var load_graph_sm = (sm_path) => {
    var graph_sm = fs.readFileSync(sm_path, 'utf8');
    var sm = graphlib.json.read(JSON.parse(graph_sm));
    return sm;
}

exports.refine = refine;