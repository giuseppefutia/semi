var fs = require('fs');
var jarql = require(__dirname + '/../semantic_modeling/jarql.js');

var run = () => {
    if (arguments.length !== 5) {
        console.log('Number of arguments is wrong!');
        return;
    }
    var st_path = process.argv.slice(2)[0];
    var steiner_path = process.argv.slice(3)[0];
    var classes_path = process.argv.slice(4)[0];
    var sm_path = process.argv.slice(5)[0];
    var st = JSON.parse(fs.readFileSync(st_path))[0];
    var steiner_tree = JSON.parse(fs.readFileSync(steiner_path));
    var classes = JSON.parse(fs.readFileSync(classes_path))['classes'];
    var jarql_to_print = jarql.build_jarql(st, steiner_tree, classes_path);
    fs.writeFileSync(sm_path + '.query', jarql_to_print);
    console.log('The JARQL file is written in: ' + sm_path + '.query');
}

run();