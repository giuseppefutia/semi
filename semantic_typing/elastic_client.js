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
            cb('All is well');
        }
    });
}

var create_index = function(c, index_name) {
    return new Promise(function(resolve, reject) {
        c.indices.create({
            index: index_name
        }, function(err, res, status) {
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        });
    });
}

var add_document_to_index = function(c, index_name, id_name, type_name, label_name, content_value) {
    return new Promise(function(resolve, reject) {
        c.index({
            index: index_name,
            id: id_name,
            type: type_name,
            body: {
                'label': label_name,
                'content': content_value,
            }
        }, function(err, res, status) {
            if (err) {
                reject(err);
            } else {
                console.log(res);
                resolve(res);
            }
        });
    });
}

// TODO
var create_bulk = function() {

}

var search_in_index = function(c, index_name, type_name, query_value) {
    return new Promise(function(resolve, reject) {
        console.log(query_value);
        c.search({
            index: index_name,
            type: type_name,
            body: {
                query: query_value
            }
        }, function(err, res, status){
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        });
    });
}

var drop_index = function(c, index_name) {
    return new Promise(function(resolve, reject) {
        c.indices.delete({
            index: index_name
        }, function(err, res, status) {
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        });
    });
}

// Export for testing
exports.ping = ping;
exports.create_index = create_index;
exports.add_document_to_index = add_document_to_index;
exports.search_in_index = search_in_index;
exports.drop_index = drop_index;
