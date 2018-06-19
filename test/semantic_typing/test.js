var elasticsearch = require('elasticsearch');
var elastic_client = require('../../semantic_typing/elastic_client')
const config = require('../../config');

var client = new elasticsearch.Client({
    host: config['dev']['elastic']['host'] + ':' + config['dev']['elastic']['port'],
    log: config['dev']['elastic']['log']
});

describe('Ping an elastic search server', function() {
    it('The elastic search server should response that All is Well', function() {
        elastic_client.ping(client, function(res) {
            assert.deepEqual('All is well', res)
        })
    });
});
