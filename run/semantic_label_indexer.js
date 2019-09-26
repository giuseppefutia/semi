var fs = require('fs');
var semantic_label_indexer = require(__dirname + '/../src/semantic_typing/semantic_label_indexer.js');

var run = () => {
    if (arguments.length !== 5) {
        console.log('Number of arguments is wrong!');
        return;
    }

    var index_name = process.argv.slice(2)[0];
    var input_dir = process.argv.slice(3)[0];
    semantic_label_indexer.build_semantic_types(index_name, input_dir);
}

run();