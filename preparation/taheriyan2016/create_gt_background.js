var rdfstore = require('rdfstore');
var fs = require('fs');

/**
 *
 * Processing RDF generated from the ground truth and from SeMi to prepare
 * training, validation, and test datasets for the deep learning model.
 * This processing require some cleaning operations.
 *
 * For task_01, task_02, and task_04 it creates a background considering
 * the leave-one-out setting.
 *
 */

var start = new Date();

var data_folder = process.argv.slice(2)[0];
var source_folder = 'data/taheriyan2016/' + data_folder + '/sources/updated_json/';
var rdf_folder = 'evaluation/taheriyan2016/' + data_folder + '/semantic_models_gt/rdf/';
var rdf_st_folder = 'evaluation/taheriyan2016/' + data_folder + '/semantic_models_gt/rdf_st/';
var background_folder = 'data/taheriyan2016/' + data_folder + '/background/';

var sources = fs.readdirSync(source_folder); // Iterate on cleaned and enriched source files

sources.forEach(source_name => {
    console.log('\nStart generating background KG for ' + source_name + '...\n');

    var background_file = background_folder + source_name.split('.')[0] + '.rdf';

    try {
        fs.unlinkSync(background_file);
        console.log('Remove ' + background_file + '\n');
    } catch {
        console.log(background_file + ' doest not exist yet and can not be removed!\n');
    }

    var writer = fs.createWriteStream(background_file);

    var rdfs = fs.readdirSync(rdf_folder); // Iterate on RDFs generated from ground truth data
    rdfs.forEach(rdf_name => {
        if (source_name.split('.')[0] === rdf_name.split('.')[0]) {
            console.log('Ignore ' + rdf_name + ' for the background KG of ' + source_name + '\n');
        } else {
            var rdf_file = fs.readFileSync(rdf_folder + rdf_name, 'utf-8');
            writer.write(rdf_file);
            console.log('Append ' + rdf_name + ' to ' + background_file + '\n');
        }
    });

    var rdfs_st = fs.readdirSync(rdf_st_folder);
    rdfs_st.forEach(rdf_name => {
        if (source_name.split('.')[0] === rdf_name.split('.')[0]) {
            var rdf_file = fs.readFileSync(rdf_folder + rdf_name, 'utf-8');
            writer.write(rdf_file);
            console.log('Append semantic types of ' + rdf_name + ' to ' + background_file + '\n');
        }
    });

    console.log('\nEnd generating background KG for ' + source_name + '.\n');
});

var end = new Date() - start;
console.log('Execution time: %d ms', end)