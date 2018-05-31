var fs = require('fs');
var CsvReadableStream = require('csv-reader');
var inputStream = fs.createReadStream('../../data/atti_di_concessione/input/metadata.csv', 'utf8');
var scrapers_map = require('./scrapers_map.js');
var scrapers = scrapers_map.get_scrapers();

inputStream
    .pipe(CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true }))
    .on('data', function (row) {
        // Check CSV files
        if (row[5] === "Csv") {
            //csvScraper(row[1], row[3])
        }
    })
    .on('end', function (data) {
        console.log('No more rows!');
    });

var csvScraper = function (name, url) {
    console.log('Download file of: ' + name);
    console.log('The file should be available at: ' + url);
    var scraper = require('' + scrapers[name]);
    scraper.download();
}

csvScraper('Asti', 'http://asti.etrasparenza.it/export_open_data_csv.php?id_criterio=127&id_oggetto=38&id_ente=15');
