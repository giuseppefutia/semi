var fs = require('fs');
var assert = require('assert');
var rdf = require(__dirname + '/../../knowledge_graph_generation/rdf.js');
var reader = require(__dirname + '/../../knowledge_graph_generation/reader.js');

describe('Knowledge Graph Generation test suite\n', function() {
    var csv_path = __dirname + '/s01-cb.csv';
    var json_path = __dirname + '/s05-met.json';
    var csv_sm_path = __dirname + '/s01-cb0.csv.model.json';
    var json_sm_path = __dirname + '/s05-met.json.model.json';

    describe('Create a knowledge graph from a CSV using a semantic model', function() {
        var csv_data = [];
        var semantic_model_data = [];
        var sequence = Promise.resolve()
            .then(function() {
                // Read CSV
                return reader.read_csv(csv_path, ',');
            })
            .then(function(csv) {
                csv_data = csv;
                // Read Semantic Model
                return reader.read_sm(csv_sm_path);
            })
            .then(function(sm) {
                semantic_model_data = sm;
                // Create RDF data
                return rdf.create_rdf(csv_data, semantic_model_data);
            })
            .then(function(triples) {
                rdf.generate_rdf_store(triples);
            });
    });

    describe('Create a knowledge graph from a JSON using a semantic model', function() {
        var json_data = [];
        var semantic_model_data = [];
        var sequence = Promise.resolve()
            .then(function() {
                // Read JSON
                return reader.read_json(json_path);
            })
            .then(function(json) {
                json_data = json;
                console.log(json_data);
                // Read Semantic Model
                return reader.read_sm(json_sm_path);
            })
            .then(function(sm) {
                semantic_model_data = sm;
                // Create RDF data
                return rdf.create_rdf(json_data, semantic_model_data);
            })
            .then(function(triples) {
                return rdf.generate_rdf_store(triples);
            })
            .then(function(rdf_data) {
                // console.log(rdf_data);
            });
    });

});
