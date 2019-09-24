const es_client = require('./client');

es_client.ping({
    // ping usually has a 3000ms timeout
    requestTimeout: 10000
}, function(error) {
    if (error) {
        console.trace('elasticsearch cluster is down!');
    } else {
        console.log('All is well');
    }
});