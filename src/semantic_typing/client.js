const es = require('elasticsearch');
const es_client = new es.Client({
    host: 'localhost:9200',
    log: 'trace'
});

module.exports = es_client;