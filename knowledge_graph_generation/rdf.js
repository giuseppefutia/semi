var fs = require('fs');
var CsvReadableStream = require('csv-reader');
var subject_data = require(__dirname + '/subject.js');

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

var create_subjects = (nodes) => {
    var subjects = {}
    for (var n in nodes) {
        if (nodes[n]['type'] === 'InternalNode') {
            var uri_class = nodes[n]['label']['uri'];
            var index = subject_data.classes.indexOf(uri_class);
            if (index === undefined)
                throw new Error('Subject ' + uri_class + ' not found! Check subject.js');
            var uri = subject_data.uris[index];
            var field = subject_data.field_for_uris[index];
            subjects[uri_class] = {'uri': uri, 'field': field};
        }
    }
    return subjects;
}

var extract_subjects = (data, subjects, column_nodes) => {
    var subjects_uri = [];
    for (var i in column_nodes) {
        var user_st = column_nodes[i]['userSemanticTypes'][0]; // Basically, you have only one semantic type defined by the user
        var subject_class = subjects[user_st['domain']['uri']];
        var subject_field = subject_class['field'];
        if (user_st['type']['uri'] === subject_field) {
            var subject_entries = data[column_nodes[i]['columnName']];
            for (var j in subject_entries) {
                subjects_uri.push(subject_data.basic_uri + subject_class['uri'] + subject_entries[j].replace(/ /g,"_"));
            }
        }
    }
    return subjects_uri;
}

// TODO: Understand the better logic to create the most efficient attribution of rdf:type

// Generate a semantic type triple using the entry of a specific column
var st_entry = (subject, user_st, entry) => {
    var triple = {};
    triple['subject'] = subject;
    triple['predicate'] = user_st['type']['uri'];
    triple['object'] = entry;
    return triple;
}

// Generate semantic type triples of all the entries of a column
// TODO: In the high level function you need to identify the correct subject
var st_data_column = (subjects, user_st, column_data) => {
    var triples = [];
    for (var i in column_data) {
        triples.push(st_entry(subjects[i], user_st, column_data[i]));
    }
    return triples;
}

// Generate semantic type triples of all columns of a dataset
var create_st_triples = (internal_nodes, column_nodes, data) => {
    // TODO: At this level you need to the define the logic to choose the subject
    var triples = [];
    var subjects = create_subjects(internal_nodes);
    for (var i in column_nodes) {
        var column_data = data[column_nodes[i]['columnName']];
        var user_st = column_nodes[i]['userSemanticTypes'][0] // Basically, you have only one semantic type defined by the user
        var subjects_uri = extract_subjects(data, subjects, column_nodes);
        triples.push(st_data_column(subjects_uri, user_st, column_data));
    }
    return triples;
}

var create_from_csv = (data, sm) => {
    return new Promise(function(resolve, reject) {
        var nodes = sm[1];
        var internal_nodes = [];
        var column_nodes = [];
        for (var n in nodes) {
            if (nodes[n]['type'] === 'InternalNode')
                internal_nodes.push(nodes[n]);
            else if (nodes[n]['type'] === 'ColumnNode')
                column_nodes.push(nodes[n]);
            else throw new Error('Unknow node type: ' + nodes[n]['type']);
        }
        var triples = create_st_triples(internal_nodes, column_nodes, data);
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
exports.create_subjects = create_subjects;
exports.create_from_csv = create_from_csv;
