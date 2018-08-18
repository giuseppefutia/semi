var fs = require('fs');
var assert = require('assert');
var rdf = require(__dirname + '/../../knowledge_graph_generation/rdf.js');

describe('Knowledge Graph Generation test suite\n', function() {
    var csv_path = __dirname + '/s01-cb.csv';;
    var sm_path = __dirname + '/s01-cb0.csv.model.json';

    describe('Create subjects exploiting internal nodes', function() {
        it('The data field of \'http://www.americanartcollaborative.org/ontology/Person\' should be \'http://rdvocab.info/ElementsGr2/nameOfThePerson\'', function() {
            var nodes = [];
            nodes[0] = {
                "id": "http://www.americanartcollaborative.org/ontology/CulturalHeritageObject1",
                "label": {
                    "uri": "http://www.americanartcollaborative.org/ontology/CulturalHeritageObject"
                },
                "type": "InternalNode",
                "modelIds": null
            }
            nodes[1] = {
                "id": "http://www.americanartcollaborative.org/ontology/Person1",
                "label": {
                    "uri": "http://www.americanartcollaborative.org/ontology/Person"
                },
                "type": "InternalNode",
                "modelIds": null
            }
            var subjects = rdf.create_subjects(nodes);
            assert.deepEqual('http://rdvocab.info/ElementsGr2/nameOfThePerson', subjects[nodes[1]['label']['uri']]['field']);
        });

    });

    describe('Create a knowledge graph from a CSV using a semantic model', function() {
        var csv_data = [];
        var semantic_model_data = [];
        var sequence = Promise.resolve()
            .then(function() {
                // Read CSV
                return rdf.read_csv(csv_path, ',');
            })
            .then(function(csv) {
                csv_data = csv;
                // Read Semantic Model
                return rdf.read_sm(sm_path);
            })
            .then(function(sm) {
                semantic_model_data = sm;
                // Create RDF data
                rdf.create_from_csv(csv_data, semantic_model_data);
            })
            .then(function(rdf_data) {
                // console.log(rdf_data);
            });
    });

});
