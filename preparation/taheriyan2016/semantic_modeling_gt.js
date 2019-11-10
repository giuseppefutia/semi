var fs = require('fs');
var path = require('path');
var Graph = require('graphlib').Graph;
var graphlib = require('graphlib');
var graph_utils = require(__dirname + '/../../src/semantic_modeling/graph_utils.js');
var jarql = require(__dirname + '/../../src/semantic_modeling/jarql.js');
var utils = require(__dirname + '/../../src/semantic_modeling/utils.js');
const PREFIX = utils.get_prefix();

/**
 *
 * Processing taheriyan2016 data to prepare the ground truth
 *
 * The goal of the following scripts is to reconstruct the JARQL representation
 * of the JSON-serialized ground truth data
 *
 */

var array_to_object = (arr, keyField) =>
    Object.assign({}, ...arr.map(item => ({
        [item[keyField]]: item
    })));

var get_base_uri = (uri) =>
    Object.keys(PREFIX).find(key => {
        return uri.includes(key);
    });

var create_st = (st, stored_st, column, node) => {
    // Fill attributes
    st[0]['attributes'].push(column['columnName']);

    // Fill uris
    st[0]['uris'].push(false);

    // Fill semantic types
    var st_domain = node['userSemanticTypes'][0]['domain']['uri'];
    var class_base_uri = get_base_uri(st_domain);
    var st_class = st_domain.replace(class_base_uri, PREFIX[class_base_uri]);
    var st_type = node['userSemanticTypes'][0]['type']['uri'];
    var prop_base_uri = get_base_uri(st_type);
    var st_property = st_type.replace(prop_base_uri, PREFIX[prop_base_uri]);
    st[0]['semantic_types'].push([st_class + '***' + st_property]);

    // Fill index of entities
    if (stored_st[st_domain] === undefined) stored_st[st_domain] = 1;
    else stored_st[st_domain]++;
    st[0]['entities'].push(stored_st[st_domain]);
}

var create_edge = (edge_object) => {
    // Create new edge representation using the old edge representation
    var edge = {};
    var splitter = edge_object['id'].split('---');
    var s_base_uri = get_base_uri(splitter[0]);
    edge['subject'] = splitter[0].replace(s_base_uri, PREFIX[s_base_uri]);
    var p_base_uri = get_base_uri(splitter[1]);
    edge['property'] = splitter[1].replace(p_base_uri, PREFIX[p_base_uri]);
    var o_base_uri = get_base_uri(splitter[2]);
    edge['object'] = splitter[2].replace(o_base_uri, PREFIX[o_base_uri]);
    // For now type and weight have a default value
    edge['type'] = 'property';
    edge['weight'] = 1
    return edge;
}

// Load data of the ground truth available in JSON format
var data_folder = process.argv.slice(2)[0];
var input_folder = 'evaluation/taheriyan2016/' + data_folder + '/semantic_models_gt/json/';

var files = fs.readdirSync(input_folder);
files.forEach(file_name => {
    var gt = JSON.parse(fs.readFileSync(input_folder + file_name, 'utf-8'));
    var gt_nodes = gt['graph']['nodes'];
    var gt_edges = gt['graph']['links'];

    // Create and store semantic type file using nodes information of the ground truth
    var columns = array_to_object(gt['sourceColumns'], 'id');
    var st = [{}];
    var stored_st = {}

    st[0]['attributes'] = [];
    st[0]['entities'] = [];
    st[0]['uris'] = [];
    st[0]['semantic_types'] = [];

    for (var n of gt_nodes) {
        var column = columns[n['id']];
        if (column !== undefined && column['columnName'].toLowerCase().indexOf('uri') === -1) {
            create_st(st, stored_st, column, n);
            file_name.split('.')[0];
            var output_st =
                'data/taheriyan2016/' +
                data_folder + '/semantic_types/auto/' +
                file_name.split('.')[0] + '_st.json';

            // Store semantic types
            fs.writeFileSync(output_st, JSON.stringify(st, null, 4));
        }
    }

    // Create edges
    var edges = gt_edges
        .filter(e => {
            return e['type'] == 'ObjectPropertyLink';
        })
        .map(e_obj => {
            return create_edge(e_obj);
        });

    // Create and store graph and its beautified version
    var g = new Graph({
        multigraph: true
    });

    graph_utils.add_semantic_types(st[0], g);

    for (var e of edges) {
        g.setNode(e['subject'], {
            type: 'class_uri',
            label: e['subject'].slice(0, -1) // XXX Need to be fixed in case of many nodes of the same type
        });
        g.setNode(e['object'], {
            type: 'class_uri',
            label: e['object'].slice(0, -1) // XXX Need to be fixed in case of many nodes of the same type
        });
        g.setEdge(e['subject'], e['object'], {
            label: e['property'],
            type: e['type']
        }, e['subject'] + '***' + e['property'], e['weight']);
    }

    var graph_path = 'evaluation/taheriyan2016/' + data_folder + '/semantic_models_gt/graph/' + file_name.split('.')[0];
    fs.writeFileSync(graph_path + '.graph', JSON.stringify(g, null, 4));
    var json_graph = graphlib.json.write(g);
    fs.writeFileSync(graph_path + '_graph.json', JSON.stringify(json_graph, null, 4));

    // Create and store JARQL files from the graph representation
    var classes_path = 'data/taheriyan2016/' + data_folder + '/ontology/classes.json';
    var jarql_path = 'evaluation/taheriyan2016/' + data_folder + '/semantic_models_gt/jarql/' + file_name.split('.')[0];
    var classes = JSON.parse(fs.readFileSync(classes_path))['classes'];
    var jarql_to_print = jarql.build_jarql(st[0], graphlib.json.write(g), classes_path);
    fs.writeFileSync(jarql_path + '.query', jarql_to_print);
});