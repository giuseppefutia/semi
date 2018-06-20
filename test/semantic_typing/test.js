var elasticsearch = require('elasticsearch');
var elastic_client = require('../../semantic_typing/elastic_client');
var assert = require('assert');
const config = require('../../config');

// TODO: Improve the use of done() function for better management of documents in the index

var client = new elasticsearch.Client({
    host: config['dev']['elastic']['host'] + ':' + config['dev']['elastic']['port'],
    log: config['dev']['elastic']['log']
});

describe('Ping an elasticsearch server', function() {
    it('The elasticsearch server should response that All is Well', function(done) {
        elastic_client.ping(client, function(res) {
            assert.deepEqual('All is well', res);
            done();
        })
    });
});

describe('Create an index', function() {
    it('The created index should be called semi_index', function(done) {
        elastic_client.create_index(client, 'semi_index')
            .then(function(res) {
                assert.deepEqual(true, res['acknowledged']);
                assert.deepEqual('semi_index', res['index'])
                done();
            }, function(error) {
                assert.deepEqual(true, res['acknowledged']);
                assert.deepEqual('semi_index', res['index'])
                console.log('Index creation error: ' + error);
                done();
            });
    });
});

describe('Add document', function() {
    it('There should be a new document in the index with a label \'beneficiary_name\'', function(done) {
        var index_name = 'semi_index';
        var id_name = 1;
        var type_name = 'type';
        var label_name = 'beneficiary_name';
        var content_value = 'C.U.S. - CENTRO UNIVERSITARIO SPORTIVO DI ANCONA A.S.D. A.C. NUOVA FOLGORE A.S.D. LA CAROVANA ONLUS - ASSOCIAZIONE DI VOLONTARIATO';

        elastic_client.add_document_to_index(client, index_name, id_name, type_name, label_name, content_value)
            .then(function(res) {
                assert.deepEqual(index_name, res['_index']);
                assert.deepEqual(1, res['_id']);
                assert.deepEqual(1, res['_version']);
                assert.deepEqual('created', res['result']);
                client.count({index: index_name, type: type_name}, function(err, res, status) {
                    done();
                });
            }, function(error) {
                assert.deepEqual(index_name, res['_index']);
                assert.deepEqual(1, res['_id']);
                assert.deepEqual(1, res['_version']);
                assert.deepEqual('created', res['result']);
                console.log('Addition document error: ' + error);
                done();
            });
    });
});

describe('Search document', function() {
    it('Search documents should contain the string CENTRO UNIVERSITARIO', function(done) {
        var index_name = 'semi_index';
        var type_name = 'type';
        var query_value = {
            term: {
                'label': 'beneficiary_name'
            }
        }
        elastic_client.search_in_index(client, index_name, type_name, query_value)
            .then(function(res) {
                console.log(res);
                done();
            }, function(error) {
                console.log('Error during search: ' + error);
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
                assert.deepEqual(true, res['acknowledged']);
                console.log('Index drop error: ' + error);
                done();
            });
    });
});
