const es = require('elasticsearch');
const es_client = new es.Client({
    host: 'localhost:9200',
    log: 'info'
});

module.exports = es_client;