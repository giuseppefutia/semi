/**
 * Add semantic types to the graph
 * @param st - JSON structure describing semantic types
 *             See as example: data/pc/semantic_types/Z4ADEA9DE4_st.json
 * @param graph
 * @returns graph enriched with semantic types
 */
var add_semantic_types = (st, graph) => {
    var attributes = st['attributes'];
    var semantic_types = st['semantic_types']; // TODO: Move the function to create inverse edges in the graph.js file
    var entities = st['entities'];
    for (var i in attributes) {
        // Add data node
        var data_node = attributes[i];
        graph.setNode(data_node, {
            type: 'attribute_name',
            label: data_node
        });
        var class_node = semantic_types[i][0].split("***")[0]; // Remember: I put an index here, because I can expect candidates semantic types
        // Add class node
        graph.setNode(class_node + entities[i], {
            type: 'class_uri',
            label: class_node
        });
        // Add edge
        graph.setEdge(class_node + entities[i], data_node, {
            label: semantic_types[i][0].split("***")[1],
            type: 'st_property_uri'
        }, class_node + entities[i] + "***" + data_node, 1);
    }
    return graph;
}


/**
 * Support function to add diverse type of edges to the graph
 * @param graph
 * @param subject
 * @param property
 * @param object
 * @param type
 * @param weight
 */
var add_edges = (graph, subject, property, object, type, weight) => {
    var nodes = graph.nodes();
    for (var s in nodes) {
        var subject_label_node = graph.node(nodes[s])['label'];
        if (subject_label_node === subject) {
            for (var o in nodes) {
                var object_label_node = graph.node(nodes[o])['label'];
                if (object_label_node === object) {
                    graph.setEdge(nodes[s], nodes[o], {
                        label: property,
                        type: type
                    }, nodes[s] + '***' + nodes[o], weight);
                }
            }
        }
    }
}

exports.add_semantic_types = add_semantic_types;
exports.add_edges = add_edges;