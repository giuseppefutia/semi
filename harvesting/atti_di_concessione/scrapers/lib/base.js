var http = require('http');

exports.getFile = function (options, callback) {
    var req = http.get(options, function (res) {
        var chunks = [];
        res.on('data', function (chunk) {
            chunks.push(chunk);
        });
        res.on('end', function () {
            var body = Buffer.concat(chunks);
            callback(body);
        });
    });
}
