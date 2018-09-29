var fs = require('fs');
var CsvReadableStream = require('csv-reader');

// Such object should be the default one for all kind of datasets
var csv_as_object = (headers, data) => {
    var csv_object = {};
    for (var i in headers) {
        var column_data = [];
        for (var j in data) {
            column_data.push(data[j][i]);
        }
        csv_object[headers[i]] = column_data;
    }
    return csv_object;
}

var json_as_object = (json_data) => {
    var json_object = {};
    var keys = Object.keys(json_data[0]);
    for (var k in keys) {
        json_object[keys[k]] = [];
    }
    for (var i in json_data) {
        for (var j in json_data[i]) {
            if (json_object[j] !== undefined) {
                json_object[j].push(json_data[i][j])
            }
        }
    }
    return json_object;
}

var read_csv = (path_file, delimiter) => {
    return new Promise(function(resolve, reject) {
        var is_header = true;
        var headers = [];
        var data = [];
        var inputStream = fs.createReadStream(path_file, 'utf8')
            .pipe(CsvReadableStream({
                parseNumbers: true,
                parseBooleans: true,
                delimiter: delimiter
            }))
            .on('error', function() {
                reject();
            })
            .on('data', function(row) {
                if (is_header) {
                    headers = row;
                    is_header = false;
                } else {
                    data.push(row);
                }
            })
            .on('end', function() {
                resolve(csv_as_object(headers, data));
            });
    });
}

var read_json = (path_file) => {
    return new Promise(function(resolve, reject) {
        fs.readFile(path_file, 'utf8', function (err, data) {
            if (err) throw err;
            var json_data = JSON.parse(data);
            resolve(json_as_object(json_data));
        });
    });
}

var read_sm = (path_file) => {
    return new Promise(function(resolve, reject) {
        var columns_map = [];
        var nodes = [];
        var links = [];
        fs.readFile(path_file, 'utf8', function(err, data) {
            if (err) reject(err);
            var sm = JSON.parse(data);
            columns_map = sm['sourceColumns'];
            nodes = sm['graph']['nodes'];
            links = sm['graph']['links'];
            var sm_data = [columns_map, nodes, links];
            resolve(sm_data);
        })
    });
}

exports.read_csv = read_csv;
exports.read_json = read_json;
exports.read_sm = read_sm;
