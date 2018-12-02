var elasticsearch = require('elasticsearch');
var elastic_client = require('../../semantic_typing/elastic_client');
var csv_indexer = require('../../semantic_typing/csv_indexer');
var assert = require('assert');
const config = require('../../config');
const index_rules = require('../../semantic_typing//index_rules');

describe('Elastic test suite\n', function() {
    var client;
    var host = config['dev']['elastic']['host'];
    var port = config['dev']['elastic']['port'];
    var log = config['dev']['elastic']['log'];

    var index_name = 'semi_index';
    var type_name = 'type';
    var id_name = 1;
    var label_name = 'beneficiary_name';
    var content_value = 'C.U.S. - CENTRO UNIVERSITARIO SPORTIVO DI ANCONA A.S.D. A.C. NUOVA FOLGORE A.S.D. LA CAROVANA ONLUS - ASSOCIAZIONE DI VOLONTARIATO';
    var properties_value = {
        'label': {
            'type': 'keyword',
        }
    }
    var query_value = {
        match: {
            'label': 'beneficiary_name'
        }
    }

    before(function() {
        client = elastic_client.create_client(host, port, log);
    });

    describe('Ping an elasticsearch server', function() {
        it('The elasticsearch server should response that All is Well', function(done) {
            elastic_client.ping(client, function(res) {
                assert.deepEqual('All is well', res);
                done();
            })
        });
    });

    describe('Delete all indices', function() {
        it('The response should be \'acknowledged: true\'', function(done) {
            elastic_client.delete_all_indices(client)
                .then(function(res) {
                    assert.deepEqual(true, res['acknowledged']);
                    done();
                }, function(error) {
                    assert.deepEqual('', error);
                    console.log('Error in deletion of all indeces: ' + error);
                    done();
                }).catch(function(error) {
                    console.log('Catch error in deletion of all indeces', error);
                    done();
                });
        });
    });

    describe('Create an index', function() {
        it('The created index should be called semi_index and the response should be \'acknowledged: true\'', function(done) {
            elastic_client.create_index(client, 'semi_index')
                .then(function(res) {
                    assert.deepEqual(true, res['acknowledged']);
                    assert.deepEqual('semi_index', res['index'])
                    done();
                }, function(error) {
                    assert.deepEqual('', error);
                    console.log('Index creation error: ' + error);
                    done();
                }).catch(function(error) {
                    console.log('Catch error in index cretion', error);
                    done();
                });
        });
    });

    describe('Add mapping to the index', function() {
        it('The response of mapping creation should be \'acknowledged: true\'', function(done) {
            elastic_client.create_mapping(client, index_name, type_name, properties_value)
                .then(function(res) {
                    assert.deepEqual(true, res['acknowledged']);
                    done();
                }, function(error) {
                    assert.deepEqual('', error);
                    console.log('Mapping addition error: ' + error);
                    done();
                }).catch(function(error) {
                    console.log('Catch error in mapping addition', error);
                    done();
                });
        });
    });

    describe('Get index mapping', function() {
        it('', function(done) {
            elastic_client.get_mapping(client, index_name, type_name)
                .then(function(res) {
                    var mapping_type = res[index_name]['mappings'][type_name]['properties']['label']['type'];
                    assert.deepEqual('keyword', mapping_type);
                    done();
                }, function(error) {
                    assert.deepEqual('', error);
                    console.log('Mapping get error: ' + error);
                    done();
                }).catch(function(error) {
                    console.log('Catch error in mapping get', error);
                    done();
                });
        });
    })

    describe('Add a new document to the index', function() {
        it('The response should be \'created: true\'', function(done) {
            elastic_client.add_document_to_index(client, index_name, id_name, type_name, label_name, content_value)
                .then(function(res) {
                    assert.deepEqual(index_name, res['_index']);
                    assert.deepEqual(1, res['_id']);
                    assert.deepEqual(1, res['_version']);
                    assert.deepEqual('created', res['result']);
                    done();
                }, function(error) {
                    assert.deepEqual('', error);
                    console.log('Document addition error: ' + error);
                    done();
                }).catch(function(error) {
                    console.log('Catch error in document addition', error);
                    done();
                });
        });
    });

    describe('Search a document in the index', function() {
        it('Hits total should be 1', function(done) {
            elastic_client.search_in_index(client, index_name, type_name, query_value)
                .then(function(res) {
                    assert.deepEqual(1, res['hits']['total']);
                    done();
                }, function(error) {
                    console.log('Error during search: ' + error);
                    done();
                }).catch(function(error) {
                    console.log('Catch error search', error);
                    done();
                });
        });
    });

    describe('Drop index', function() {
        it('Drop the index called semi_index', function(done) {
            elastic_client.drop_index(client, 'semi_index')
                .then(function(res) {
                    assert.deepEqual(true, res['acknowledged']);
                    done();
                }, function(error) {
                    assert.deepEqual('', error);
                    console.log('Index drop error: ' + error);
                    done();
                }).catch(function(error) {
                    console.log('Catch error in document addition', error);
                    done();
                });
        });
    });
});

/*
describe('CSV test suite\n', function() {
    var path = '/Arezzo.csv';
    var headers = ['Note', 'Titolo', 'Lorem_ispusm'];
    var name = 'Arezzo';
    var row = ['Note_data', 'Titolo_data', 'Lorem_ispusm_data'];

    describe('Set valid headers', function() {
        var index_data = [];
        csv_indexer.set_valid_headers(name, headers, index_rules, index_data);
        it('The length of index_data[\'Note\'] should be 0 and other similar checks', function(done) {
            assert.deepEqual(0, index_data['Note'].length);
            assert.deepEqual(0, index_data['Titolo'].length);
            assert.deepEqual(undefined, index_data['Lorem_ispusm']);
            done();
        });
    });

    describe('Build index data', function() {
        var index_data = [];
        index_data['Note'] = [];
        index_data['Titolo'] = [];
        csv_indexer.build_index_data(headers, row, index_data);
        it('In index_data[\'Note\'] you should find \'Note_data\'', function(done) {
            assert.deepEqual(['Note_data'], index_data['Note']);
            done();
        });
    });

    describe('Read a csv file', function() {
        it('The csv reader should responde \'End of csv!\'', function(done) {
            csv_indexer.read_csv(__dirname + path, function(res) {
                assert.deepEqual('End of csv!', res);
                done();
            });
        });
    });

});
*/
