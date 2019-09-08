var fs = require('fs');
var graphlib = require('graphlib');
var refiner = require(__dirname + '/../semantic_refinement/refinement.js');

var run = () => {
    if (arguments.length !== 5) {
        console.log('Number of arguments is wrong!');
        return;
    }
    var semantic_type_path = process.argv.slice(2)[0];
    var score_path = process.argv.slice(3)[0];
    var initial_sm_path = process.argv.slice(4)[0];
    var plausible_sm_path = process.argv.slice(5)[0];
    var refined_sm_path = process.argv.slice(6)[0];

    var refined_graph = refiner.refine(
        semantic_type_path,
        score_path,
        initial_sm_path,
        plausible_sm_path,
        refined_sm_path
    );

    // Write the graph as it is
    fs.writeFileSync(refined_sm_path + '.graph', JSON.stringify(refined_graph, null, 4));
    console.log('The refined graph file is written in: ' + refined_sm_path + '.graph');
    console.log('');

    // Write the graph as beautified JSON
    var json_graph = graphlib.json.write(refined_graph);
    fs.writeFileSync(refined_sm_path + '_graph.json', JSON.stringify(json_graph, null, 4));
    console.log('A beautified version of the refined graph file is written in: ' + refined_sm_path + '_graph.json');
}

run();