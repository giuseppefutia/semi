var fs = require('fs');
var CsvReadableStream = require('csv-reader');
var subject_data = require(__dirname + '/subject.js');

// TODO: General improvement of variables naming and function decomposition

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

var create_subjects = (nodes) => {
    var subjects = [];
    for (var n in nodes) {
        if (nodes[n]['type'] === 'InternalNode') {
            var id = nodes[n]['id'];
            var uri_class = nodes[n]['label']['uri'];
            var index = subject_data.classes.indexOf(uri_class);
            if (index === undefined)
                throw new Error('Subject ' + uri_class + ' not found! Check subject.js');
            var base_uri = subject_data.uris[index];
            var field = subject_data.field_for_uris[index];
            subjects.push({
                'id': id,
                'base_uri': base_uri,
                'field': field,
                'class': uri_class
            });
        }
    }
    return subjects;
}

// TODO: There are too cycles
var extract_subjects = (data, subjects, column_nodes) => {
    var subjects_uris = [];
    for (var i in column_nodes) {
        var user_st = column_nodes[i]['userSemanticTypes'][0]; // Basically, you have only one semantic type defined by the user
        for (var j in subjects) {
            if (user_st['domain']['uri'] === subjects[j]['class']) {
                var subject_id = subjects[j]['id'];
                var subject_class = subjects[j]['class'];
                var subject_field = subjects[j]['field'];
                var subject_base_uri = subjects[j]['base_uri'];
                if (user_st['type']['uri'] === subject_field) {
                    var entries = data[column_nodes[i]['columnName']];
                    var subject_entries = [];
                    for (var e in entries) {
                        subject_entries.push(subject_data.basic_uri + subject_base_uri + entries[e].replace(/ /g, "_"));
                    }
                    subjects_uris.push({
                        'id': subject_id,
                        'class': subject_class,
                        'entries': subject_entries
                    });
                }
            }
        }
    }
    return subjects_uris;
}

// TODO: Add information on the source of subjects

// Generate semantic type triples of all columns of a dataset
var create_st_triples = (subjects_uris, data_property_links, column_nodes, data) => {
    var triples = [];
    var link_ids = [];
    for (var i in data_property_links) {
        link_ids.push(data_property_links[i]['id'].split('---'));
    }

    for (var j in link_ids) {
        var s_uri = link_ids[j][0];
        var p_uri = link_ids[j][1];
        var o_id = link_ids[j][2];
        var subject_entries = [];
        var data_entries = [];

        for (var r in subjects_uris) {
            if (subjects_uris[r]['id'] === s_uri) {
                subject_entries = subjects_uris[r]['entries'];
            }
        }

        for (var t in column_nodes) {
            if (column_nodes[t]['id'] === o_id) {
                data_entries = data[column_nodes[t]['columnName']];
            }
        }

        for (var k in subject_entries) {
            var triple = [];
            triple[0] = subject_entries[k];
            triple[1] = p_uri;
            triple[2] = data_entries[k];
            triples.push(triple);
        }
    }

    return triples;
}

// Generate object property triples
var create_sm_triples = (subjects_uris, links) => {
    var triples = [];
    var link_ids = [];
    for (var i in links) {
        link_ids.push(links[i]['id'].split('---'));
    }
    for (var j in link_ids) {
        var subjects = [];
        var predicate = '';
        var objects = [];
        var subjects_type = [];
        var objects_type = [];
        var s_uri = link_ids[j][0];
        var p_uri = link_ids[j][1];
        var o_uri = link_ids[j][2];

        for (var t in subjects_uris) {
            if (subjects_uris[t]['id'] === s_uri) {
                subjects = subjects_uris[t]['entries'];
                subjects_type = subjects_uris[t]['class'];
            }
            if (subjects_uris[t]['id'] === o_uri) {
                objects = subjects_uris[t]['entries'];
                objects_type = subjects_uris[t]['class'];
            }
        }
        predicate = p_uri;

        for (var r in subjects) {
            // Object properties triples
            var triple = [];
            triple[0] = subjects[r];
            triple[1] = predicate;
            triple[2] = objects[r];
            triples.push(triple);

            // RDF Type triples
            var subject_type = [];
            subject_type[0] = subjects[r];
            subject_type[1] = 'https://www.w3.org/1999/02/22-rdf-syntax-ns#type';
            subject_type[2] = subjects_type;
            triples.push(subject_type);

            var object_type = [];
            object_type[0] = objects[r];
            object_type[1] = 'https://www.w3.org/1999/02/22-rdf-syntax-ns#type';
            object_type[2] = objects_type;
            triples.push(object_type);
        }
    }
    return triples;
}

var create_from_csv = (data, sm) => {
    return new Promise(function(resolve, reject) {
        var columns_map = sm[0];
        var nodes = sm[1];
        var links = sm[2];
        var internal_nodes = [];
        var column_nodes = [];
        var object_property_links = [];
        var data_property_links = [];

        for (var n in nodes) {
            if (nodes[n]['type'] === 'InternalNode')
                internal_nodes.push(nodes[n]);
            else if (nodes[n]['type'] === 'ColumnNode')
                column_nodes.push(nodes[n]);
            else throw new Error('Unknow node type: ' + nodes[n]['type']); // Just a check if there are strange things in the dataset
        }

        for (var l in links) {
            if (links[l]['type'] === 'ObjectPropertyLink')
                object_property_links.push(links[l]);
            else if (links[l]['type'] === 'DataPropertyLink')
                data_property_links.push(links[l]);
            else throw new Error('Unknow link type: ' + links[l]['type']); // Just a check if there are strange things in the dataset
        }

        var subjects_metadata = create_subjects(internal_nodes);
        var subjects_uris = extract_subjects(data, subjects_metadata, column_nodes);
        var sm_triples = create_sm_triples(subjects_uris, object_property_links);
        var st_triples = create_st_triples(subjects_uris, data_property_links, column_nodes, data);
        var triples = sm_triples.concat(st_triples);
        resolve(triples);
    });
}

var create_rdf = (input, input_type, sm) => {
    if (input_type === 'csv') {
        create_from_csv(input, sm)
            .then(function(triples) {
                
            });
    }
}

var build_knowledge_graph = (inputs, sms) => {

}

exports.read_csv = read_csv;
exports.read_sm = read_sm;
exports.create_subjects = create_subjects;
exports.create_from_csv = create_from_csv;
exports.create_rdf = create_rdf;
