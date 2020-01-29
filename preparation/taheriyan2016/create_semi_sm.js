var fs = require('fs');
var Graph = require('graphlib').Graph;
var graphlib = require('graphlib');
var dot = require("graphlib-dot");
var graph = require(__dirname + '/../../src/semantic_modeling/graph.js');
var steiner = require(__dirname + '/../../src/semantic_modeling/steiner_tree.js');
var jarql = require(__dirname + '/../../src/semantic_modeling/jarql.js');
var utils = require(__dirname + '/../../src/semantic_modeling/utils.js');
const PREFIX = utils.get_prefix();

/**
 *
 * Generate semantic models with SeMi from Taheriyan data
 *
 **/

var data_folder = process.argv.slice(2)[0];
var input_file = process.argv.slice(3)[0];
var input_folder = 'data/taheriyan2016/' + data_folder + '/sources/updated_json/';
var files = fs.readdirSync(input_folder);

var build_graph = (st_path, o_path, p_domain, p_range, o_class, paths, file_name, classes_path) => {
    graph.build_graph(st_path, o_path, p_domain, p_range, o_class)
        .then(function(multi_graph) {
            console.log('\nProcessing ' + file_name + ' ...\n');
            var start_file = new Date();

            var st = JSON.parse(fs.readFileSync(st_path, 'utf8'))[0];
            var attributes = st['attributes'];
            var f = file_name.split('.')[0];

            // Multigraph and its serializations

            // -- Graph serialization
            fs.writeFileSync(paths.plausibles_graph_path + f + '.graph', JSON.stringify(multi_graph, null, 4));

            // -- Beautified graph serialization
            var json_multigraph = graphlib.json.write(multi_graph);
            fs.writeFileSync(paths.plausibles_graph_path + f + '_graph.json', JSON.stringify(json_multigraph, null, 4));

            // -- JARQL serialization
            var jarql_multigraph = jarql.build_jarql(st, json_multigraph, classes_path);
            fs.writeFileSync(paths.plausibles_jarql_path + f + '.query', jarql_multigraph);

            // -- DOT serialization
            var dot_multigraph = dot.write(multi_graph);
            fs.writeFileSync(paths.plausibles_dot_path + f + '.dot', dot_multigraph);


            // Steiner serialization

            // -- Steiner graph serialization
            var enriched_graph = steiner.create_inverse_edges(multi_graph);
            var steiner_tree = steiner.steiner_alg(enriched_graph, attributes);
            fs.writeFileSync(paths.steiner_graph_path + f + '.steiner', JSON.stringify(steiner_tree, null, 4));
            fs.writeFileSync(paths.steiner_graph_path_eval + f + '.steiner', JSON.stringify(steiner_tree, null, 4));

            // -- Beautified steiner graph serialization
            var json_steiner = graphlib.json.write(steiner_tree);
            fs.writeFileSync(paths.steiner_graph_path + f + '_steiner.json', JSON.stringify(json_steiner, null, 4));
            fs.writeFileSync(paths.steiner_graph_path_eval + f + '_steiner.json', JSON.stringify(json_steiner, null, 4));

            // -- JARQL steiner serialization
            var jarql_steiner = jarql.build_jarql(st, json_steiner, classes_path);
            fs.writeFileSync(paths.steiner_jarql_path + f + '.query', jarql_steiner);
            fs.writeFileSync(paths.steiner_jarql_path_eval + f + '.query', jarql_steiner);

            // -- DOT steiner serialization
            var dot_steiner = dot.write(steiner_tree);
            fs.writeFileSync(paths.steiner_dot_path + f + '.dot', dot_steiner);
            fs.writeFileSync(paths.steiner_dot_path_eval + f + '.dot', dot_steiner);

            var end_file = new Date() - start_file;

            console.log(file_name + ' processed in %ds', end_file / 1000);
            console.log('\nEnd of processing ' + file_name + ' ...\n\n');

        }).catch(function(err) {
            console.log('Something went wrong in the graph generation process');
            console.log(err);
        });
}

var generate_sm = (file_name) => {
    var input_path = input_folder + file_name;
    var f = file_name.split('.')[0];
    var st_path = 'data/taheriyan2016/' + data_folder + '/semantic_types/updated/' + f + '_st.json';
    var o_path = 'data/taheriyan2016/' + data_folder + '/ontology/ontology.ttl';
    var classes_path = 'data/taheriyan2016/' + data_folder + '/ontology/classes.json';

    // Domain, range, and class of a traditional domain ontology
    var p_domain = 'rdfs:domain';
    var p_range = 'rdfs:range';
    var o_class = 'owl:Class';

    // Domain, range, and class of schema.org
    var p_domain_schema = 'schema:domainIncludes';
    var p_range_schema = 'schema:rangeIncludes';
    var o_class_schema = 'rdfs:Class';

    var obj_paths = {};

    // Paths for plausible semantic models
    obj_paths.plausibles_graph_path = 'data/taheriyan2016/' + data_folder + '/semantic_models/plausibles/graph/';
    obj_paths.plausibles_jarql_path = 'data/taheriyan2016/' + data_folder + '/semantic_models/plausibles/jarql/';
    obj_paths.plausibles_dot_path = 'data/taheriyan2016/' + data_folder + '/semantic_models/plausibles/dot/';

    // Paths for steiner semantic models
    obj_paths.steiner_graph_path = 'data/taheriyan2016/' + data_folder + '/semantic_models/steiner/graph/';
    obj_paths.steiner_jarql_path = 'data/taheriyan2016/' + data_folder + '/semantic_models/steiner/jarql/';
    obj_paths.steiner_dot_path = 'data/taheriyan2016/' + data_folder + '/semantic_models/steiner/dot/';

    obj_paths.steiner_graph_path_eval = 'evaluation/taheriyan2016/' + data_folder + '/semantic_models_steiner/graph/';
    obj_paths.steiner_jarql_path_eval = 'evaluation/taheriyan2016/' + data_folder + '/semantic_models_steiner/jarql/';
    obj_paths.steiner_dot_path_eval = 'evaluation/taheriyan2016/' + data_folder + '/semantic_models_steiner/dot/';

    if (data_folder === 'task_04') {
        build_graph(st_path, o_path, p_domain_schema, p_range_schema, o_class_schema, obj_paths, file_name, classes_path);
    } else {
        build_graph(st_path, o_path, p_domain, p_range, o_class, obj_paths, file_name, classes_path);
    }
}

console.log('Generate semantic models with SeMi from Taheriyan data...');

if (input_file === undefined) {
    files.forEach(file_name => {
        generate_sm(file_name);
    });
} else {
    generate_sm(input_file + '.json');
}