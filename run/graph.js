var fs = require('fs');
var graphlib = require('graphlib');
var graph = require(__dirname + '/../semantic_modeling/graph.js');

var run = () => {
    if (arguments.length !== 5) {
        console.log('Number of arguments is wrong!');
        return;
    }
    var st_path = process.argv.slice(2)[0];
    var o_path = process.argv.slice(3)[0];
    var p_domain = process.argv.slice(4)[0];
    var p_range = process.argv.slice(5)[0];
    var o_class = process.argv.slice(6)[0];
    var graph_path = process.argv.slice(7)[0];

    graph.build_graph(st_path, o_path, p_domain, p_range, o_class)
        .then(function(graph) {
            fs.writeFileSync(graph_path + '.graph', JSON.stringify(graph, null, 4));
            console.log('The graph file is written in: ' + graph_path + '.graph');
            console.log('');
            var json_graph = graphlib.json.write(graph);
            fs.writeFileSync(graph_path + '.json', JSON.stringify(json_graph, null, 4));
            console.log('A beautified version of the graph file is written in: ' + graph_path + '.json');
        }).catch(function(err) {
            console.log('Something went wrong in the graph generation process');
            console.log(err);
        });
}

run();