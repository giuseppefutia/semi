var fs = require('fs');
var path = require('path');
var CsvReadableStream = require('csv-reader');
var elastic_client = require('../semantic_typing/elastic_client');
const config = require('../config');
const index_rules = require('./index_rules');

var host = config['dev']['elastic']['host'];
var port = config['dev']['elastic']['port'];
var log = config['dev']['elastic']['log'];

var read_csv = function(path_file, cb) {
    var is_header = true;
    var headers = [];
    var index_data = [];
    var inputStream = fs.createReadStream(path_file, 'utf8')
        .pipe(CsvReadableStream({
            parseNumbers: true,
            parseBooleans: true,
            delimiter: ';'
        }))
        .on('data', function(row) {
            if (is_header) {
                var name = path.parse(path_file)['name'];
                headers = row;
                is_header = false;
                set_valid_headers(name, headers, index_rules, index_data);
            } else {
                build_index_data(headers, row, index_data);
            }
        })
        .on('end', function(data) {
            cb('End of csv!');
        });
}

var set_valid_headers = function(name, headers, index_rules, index_data) {
    for (var i in headers) {
        if (index_rules[name][headers[i]] !== undefined)
            index_data[headers[i]] = [];
    }
}

var build_index_data = function(headers, row, index_data) {
    for (var i in row) {
        if (index_data[headers[i]] !== undefined && row[i] !== '')
            index_data[headers[i]].push(row[i])
    }
}

var write_csv_in_index = func

var ingest_csvs = function() {
    // Set up elastic
    var client = elastic_client.create_client(host, port, log);
    // List data in the index

}

// Export for testing
exports.read_csv = read_csv;
exports.set_valid_headers = set_valid_headers;
exports.build_index_data = build_index_data;
