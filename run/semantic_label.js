var fs = require('fs');
var semantic_label = require(__dirname + '/../src/semantic_typing/semantic_label.js');

var run = () => {
    if (arguments.length !== 5) {
        console.log('Number of arguments is wrong!');
        return;
    }
    const index_name = process.argv.slice(2)[0];
    const input_file = process.argv.slice(3)[0];
    const st_file = process.argv.slice(4)[0];
    semantic_label.get_semantic_types(index_name, input_file, st_file);
}

run();