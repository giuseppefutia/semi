var fs = require('fs');
var graphlib = require('graphlib');
var steiner = require(__dirname + '/../src/semantic_modeling/steiner_tree.js');

var run = () => {
    if (arguments.length !== 5) {
        console.log('Number of arguments is wrong!');
        return;
    }
    var st_path = process.argv.slice(2)[0];
    var graph_path = process.argv.slice(3)[0];
    var steiner_path = process.argv.slice(4)[0];

    var types = JSON.parse(fs.readFileSync(st_path, 'utf8'))[0];
    var attributes = types['attributes'];

    var graph_file = fs.readFileSync(graph_path, 'utf8');
    var graph = graphlib.json.read(JSON.parse(graph_file));
    var enriched_graph = steiner.create_inverse_edges(graph);
    var steiner_tree = steiner.steiner_alg(enriched_graph, attributes);

    fs.writeFileSync(steiner_path + '.steiner', JSON.stringify(steiner_tree, null, 4));
    console.log('The steiner tree file is written in: ' + graph_path + '.steiner');
    console.log('');

    var json_steiner = graphlib.json.write(steiner_tree);

    fs.writeFileSync(steiner_path + '_steiner.json', JSON.stringify(json_steiner, null, 4));
    console.log('A beautified version of the steiner tree file is written in: ' + steiner_path + '_steiner.json');
}

run();