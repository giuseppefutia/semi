var elasticsearch = require('elasticsearch');
var elastic_client = require('../../semantic_typing/elastic_client');
var assert = require('assert');
const config = require('../../config');

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
    this.timeout(15000);
    it('The index is called semi_index, with a mapping called semi_index', function(done) {
        elastic_client.create_index(client, 'semi_index')
            .then(function(res) {
                assert.deepEqual(true, res['acknowledged']);
                assert.deepEqual('semi_index', res['index'])
                done();
            }, function(error) {
                console.log('Index creation error: ' + error);
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
                console.log('Index drop error: ' + error);
                done();
            });
    });
});
