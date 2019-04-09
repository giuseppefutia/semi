var fs = require('fs');
var path = require('path');

// Read the JSON as input
var json_path = process.argv.slice(2)[0];
var data = fs.readFileSync(json_path);
var json = JSON.parse(data);

// Split the JSON and save each object in a different file
for (var i in json) {
    var dir = path.dirname(json_path);
    var base = path.basename(json_path, '.json');
    var end = Object.keys(json[i])[0].toString();
    var file_data = JSON.stringify(json[i]);
    fs.writeFileSync(dir + '/' + base + '***' + end + '.json', file_data);
}