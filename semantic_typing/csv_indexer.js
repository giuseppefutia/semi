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
            cb(index_data);
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

var write_csv_in_index = function(client, index_name, type_name, label_name, content_value) {
    elastic_client.add_document_to_index(client, index_name, id_name, type_name, label_name, content_value)
        .then(function() {
            console.log('Loaded!')
        })
        .catch(function(error) {

        });
}

var ingest_csvs = function() {
    // Set up elastic
    var client = elastic_client.create_client(host, port, log);
    // List data in the index
    var index_data = [];
    var path_file = './data/atti_di_concessione/input/Arezzo.csv';
    read_csv(path_file, function (data){
        write_csv_in_index(client, 'semi_index', 'semi_type', 'Titolo', 'Titolo', data['Titolo'].join(' '));
    });
}

// ingest_csvs();

// Export for testing
exports.read_csv = read_csv;
exports.set_valid_headers = set_valid_headers;
exports.build_index_data = build_index_data;
