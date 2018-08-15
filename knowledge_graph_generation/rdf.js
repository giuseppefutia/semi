var fs = require('fs');
var CsvReadableStream = require('csv-reader');

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
                var csv_data = { 'headers': headers, 'data': data };
                resolve(csv_data);
            });
    });
}

var read_sm = (path_file) => {
    return new Promise(function(resolve, reject) {
        var columns_map = [];
        var nodes = [];
        var links = [];
        fs.readFile(path_file, 'utf8', function (err, data) {
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

var create_from_csv = (data, sm) => {
    return new Promise(function(resolve, reject) {
        var ids = [];
        var st_triples = [];
        var triples = [];

        console.log(data['headers']);

        var columns_map = sm[0];
        for (var i in columns_map) {
            var key = columns_map[i]['id'];
            var value = columns_map[i]['column_name'];
            var id = {key: value};
            ids.push(id);
        }
        // TODO URIs management

        // Manage Semantic Types: TODO: it can be an external function
        var nodes = sm[1];
        for (var i in nodes) {
            var st_triple = [];
            if (ids.hasOwnProperty(nodes[i]['id'])) {
                // st_triple[0] =
            }
        }
    });
}

var create_rdf = (input, input_type, sm) => {
    if (input_type === 'csv')
        create_from_csv(input, sm)

}

var build_knowledge_graph = (inputs, sms) => {

}

exports.read_csv = read_csv;
exports.read_sm = read_sm;
exports.create_from_csv = create_from_csv;
