var fs = require('fs');
var path = require('path');

// Read all directories in rodi directory
var path_dirs = 'data/rodi/';
var files = fs.readdirSync(path_dirs)
files = files.filter(f => fs.statSync(path.join(path_dirs, f)).isDirectory());

// Read input JSON of each scenario and split data
for (var i in files) {
    var json_path = path_dirs + files[i] + '/input/' + files[i] + '.json';
    var data = fs.readFileSync(json_path);
    var json = JSON.parse(data);
    for (var r in json) {
        var dir = path.dirname(json_path);
        var base = path.basename(json_path, '.json');
        var end = Object.keys(json[r])[0].toString();
        var file_data = JSON.stringify(json[r]);
        fs.writeFileSync(dir + '/' + base + '***' + end + '.json', file_data);
    }
}

// Generate scripts for semantic modeling
var keywords = ['graph', 'steiner', 'jarql', 'rdf'];

for (var i in files) {
    for (var t in keywords) {

        // Set name files of scripts
        var script_path = path_dirs + files[i] + '/scripts/' +
            files[i] + '_' + keywords[t] + '.sh';

        /*fs.writeFile(script_path, '', function(err) {
            if (err) return console.log(err);
            console.log();
        });*/

    }
}