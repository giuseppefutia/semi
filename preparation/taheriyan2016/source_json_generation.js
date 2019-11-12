var path = require('path');
var fs = require('fs');
var csvjson = require('csvjson');
var xmljson = require('xml2json');

/**
 *
 * Process taheriyan2016 sources data to prepare JSONs for SeMi
 *
 */

var convert_csv = (input_folder, file_name, output_path) => {
    var csv_data = fs.readFileSync(input_folder + file_name, 'utf8');
    var options = {
        delimiter: ',',
        quote: '"'
    };
    var json_data = csvjson.toObject(csv_data, options);
    var json_string = JSON.stringify(json_data, null, 2);
    fs.writeFileSync(output_path, json_string);
}

var convert_xml = (input_folder, file_name, output_path) => {
    var xml_data = fs.readFileSync(input_folder + file_name, 'utf8');
    try {
        var json_data = xmljson.toJson(xml_data);
        fs.writeFileSync(output_path, json_data);
    } catch (e) {
        console.log('Cannot convert ' + input_folder + file_name);
    }
}

var data_folder = process.argv.slice(2)[0];
var input_folder = 'data/taheriyan2016/' + data_folder + '/sources/original/';

var files = fs.readdirSync(input_folder);
files.forEach(file_name => {
    var output_path = 'data/taheriyan2016/' + data_folder + '/sources/original_json/' + file_name.split('.')[0] + '.json';

    if (path.extname(file_name) === '.csv') {
        convert_csv(input_folder, file_name, output_path);
    } else if (path.extname(file_name, output_path) === '.xml') {
        convert_xml(input_folder, file_name, output_path);
    } else if (path.extname(file_name) === '.json') {
        fs.copyFileSync(input_folder + file_name, output_path);
    }
});