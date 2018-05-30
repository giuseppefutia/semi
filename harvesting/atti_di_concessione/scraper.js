var fs = require('fs');
var CsvReadableStream = require('csv-reader');
var inputStream = fs.createReadStream('../../data/atti_di_concessione/input/metadata.csv', 'utf8');

inputStream
    .pipe(CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true }))
    .on('data', function (row) {
        console.log('A row arrived: ', row);
    })
    .on('end', function (data) {
        console.log('No more rows!');
    });

var scrapeIt = function () {

}

var getCSV = function () {

}
