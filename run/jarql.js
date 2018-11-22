var fs = require('fs');
var jarql = require(__dirname + '/../semantic_modeling/jarql.js');

var run = () => {
    if (arguments.length !== 5) {
        console.log('Number of arguments is wrong!');
        return;
    }
    var st_path = process.argv.slice(2)[0];
    var sm_path = process.argv.slice(3)[0];
    var st = JSON.parse(fs.readFileSync(st_path))[0];
    var jarql_to_print = jarql.build_jarql(st);
    fs.writeFileSync(sm_path, jarql_to_print);
    console.log('JARQL file is written in: ' + sm_path);
}

run();