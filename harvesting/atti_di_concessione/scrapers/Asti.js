var base = require('./lib/base.js');

exports.download = function () {
    var options = {'host': 'asti.etrasparenza.it',
                   'path': '/export_open_data_csv.php?id_criterio=127&id_oggetto=38&id_ente=15'};

    base.getFile(options, function (body) {
        console.log(body);
    });
}
