var elasticsearch = require('elasticsearch');
const config = require('../config');

var client = new elasticsearch.Client({
    host: config['dev']['elastic']['host'] + ':' + config['dev']['elastic']['port'],
    log: config['dev']['elastic']['log']
});

var ping = function(c, cb) {
    c.ping({
        // ping usually has a 3000ms timeout
    }, function(error) {
        if (error) {
            cb('elasticsearch cluster is down!');
        } else {
            cb('All is well')
        }
    });
}

// Export for testing
exports.ping = ping;
