var fs = require('fs');
var Graph = require('graphlib').Graph;
var graphlib = require('graphlib');
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

var generate_sm = (file_name) => {
    var input_path = input_folder + file_name;
    var f = file_name.split('.')[0];
    var st_path = 'data/taheriyan2016/' + data_folder + '/semantic_types/updated/' + f + '_st.json';
    var o_path = 'data/taheriyan2016/' + data_folder + '/ontology/ontology.ttl';
    var classes_path = 'data/taheriyan2016/' + data_folder + '/ontology/classes.json';
    var p_domain = 'rdfs:domain';
    var p_range = 'rdfs:range';
    var o_class = 'owl:Class';
    var output_graph = 'data/taheriyan2016/' + data_folder + '/semantic_models/graph/';
    var output_jarql = 'data/taheriyan2016/' + data_folder + '/semantic_models/jarql/';

    graph.build_graph(st_path, o_path, p_domain, p_range, o_class)
        .then(function(multi_graph) {
            console.log('\nProcessing ' + file_name + ' ...\n');

            var f = file_name.split('.')[0];

            // Multigraph and its JSON serialization
            fs.writeFileSync(output_graph + f + '.graph', JSON.stringify(multi_graph, null, 4));

            // Multigraph serialized as JSON
            var json_graph = graphlib.json.write(multi_graph);
            fs.writeFileSync(output_graph + f + '_graph.json', JSON.stringify(json_graph, null, 4));

            // Steiner tree and its JSON serialization
            var types = JSON.parse(fs.readFileSync(st_path, 'utf8'))[0];
            var attributes = types['attributes'];
            var graph_path = output_graph;
            var enriched_graph = steiner.create_inverse_edges(multi_graph);
            var steiner_tree = steiner.steiner_alg(enriched_graph, attributes);
            fs.writeFileSync(output_graph + f + '.steiner', JSON.stringify(steiner_tree, null, 4));
            var json_steiner = graphlib.json.write(steiner_tree);
            fs.writeFileSync(output_graph + f + '_steiner.json', JSON.stringify(json_steiner, null, 4));

            // JARQL serialization of the Steiner tree
            var steiner_path = output_graph + f + '_steiner.json';
            var jarql_path = output_jarql + f;
            var st = JSON.parse(fs.readFileSync(st_path))[0];
            var json_steiner = JSON.parse(fs.readFileSync(steiner_path));
            var jarql_to_print = jarql.build_jarql(st, json_steiner, classes_path);
            fs.writeFileSync(jarql_path + '.query', jarql_to_print);

            console.log('\nEnd of processing ' + file_name + ' ...\n\n');

        }).catch(function(err) {
            console.log('Something went wrong in the graph generation process');
            console.log(err);
        });
}

console.log('Generate semantic models with SeMi from Taheriyan data...');

if (input_file === undefined) {
    files.forEach(file_name => {
        generate_sm(file_name);
    });
} else {
    generate_sm(input_file + '.json');
}