var fs = require('fs');
var exec = require('child_process').execSync;

/**
 *
 * Run JARQL command to create RDF data from the JARQL-serialized ground truth data.
 * Generate RDF file will be used for creating data for the Deep Learning Model.
 *
 * Ground truth RDF are useful for creatingt background knowledge in task_01, task_02, task_04
 *
 */

// Get object keys and create an array of objects where keys are the old keys and
// values are the new keys in which white spaces are replaced with the string WSP
var replace_ws_in_source_keys = (obj) => {
    return Object.keys(obj).map(obj_with_ws => {
        obj_without_ws = obj_with_ws.replace(/\s/g, 'WSP');
        return {
            [obj_with_ws]: obj_without_ws
        };
    });
}

// Useful to transform array of objects generated with the previous function in an object
var array_to_object = (arr) => {
    return arr.reduce((result, item) => {
        var key = Object.keys(item)[0];
        result[key] = item[key];
        return result;
    }, {})
}

// Rename keys of an object based on the object generated in the previous function
var rename_keys = (obj, new_keys) => {
    const key_values = Object.keys(obj).map(key => {
        const new_key = new_keys[key] || key;
        return {
            [new_key]: obj[key]
        };
    });
    return Object.assign({}, ...key_values);
}

// Clean strings that are not detected with the regex
// XXX Should be updated
var clean_undetected_strings = (jarql_string) => {
    jarql_string = jarql_string.replace(/ObjectWSPWorkWSPType URI/g, 'ObjectWSPWorkWSPTypeWSPURI');
    jarql_string = jarql_string.replace(/Artist Appellation/g, 'ArtistWSPAppellation');
    jarql_string = jarql_string.replace(/name first last/g, 'nameWSPfirstWSPlast');
    jarql_string = jarql_string.replace(/TITLE NO AUTHOR/g, 'TITLEWSPNOWSPAUTHOR');
    jarql_string = jarql_string.replace(/Collector Information/g, 'CollectorWSPInformation');
    jarql_string = jarql_string.replace(/Maker Birth Date/g, 'MakerWSPBirthWSPDate');
    jarql_string = jarql_string.replace(/Maker Death Date/g, 'MakerWSPDeathWSPDate');
    jarql_string = jarql_string.replace(/HomeWSPLocation URI/g, 'HomeWSPLocationWSPURI');
    jarql_string = jarql_string.replace(/HowWSPAcquired\?/g, 'HowWSPAcquired');
    return jarql_string;
}

var data_folder = process.argv.slice(2)[0];
var input_file = process.argv.slice(3)[0];
var source_folder = 'data/taheriyan2016/' + data_folder + '/sources/updated_json/';
var jarql_folder = 'evaluation/taheriyan2016/' + data_folder + '/semantic_models_gt/jarql/';
var jarql_st_folder = 'evaluation/taheriyan2016/' + data_folder + '/semantic_models_gt/jarql_st/';
var jarql_output_folder = 'evaluation/taheriyan2016/' + data_folder + '/semantic_models_gt/rdf/';
var jarql_st_output_folder = 'evaluation/taheriyan2016/' + data_folder + '/semantic_models_gt/rdf_st/';

var start = new Date();

var generate_rdf = (file_name) => {
    console.log('\nStart processing ' + file_name + '...\n\n\n');
    var start_processing = new Date();

    var source_path = source_folder + file_name;
    var source = JSON.parse(fs.readFileSync(source_path, 'utf-8'));

    var jarql_path = jarql_folder + file_name.replace('.json', '') + '.query';
    var jarql_st_path = jarql_st_folder + file_name.replace('.json', '') + '.query';
    var jarql = fs.readFileSync(jarql_path, 'utf-8');
    var jarql_st = fs.readFileSync(jarql_st_path, 'utf-8');

    var jarql_output_path = jarql_output_folder + file_name.replace('.json', '') + '.rdf';
    var jarql_st_output_path = jarql_st_output_folder + file_name.replace('.json', '') + '.rdf';

    // Clean and store temporary sources keys replacing white spaces
    console.log('Clean the JARQL of semantic models ...');
    var tmp_source_path = source_folder + 'tmp_' + file_name;
    var new_keys = array_to_object(replace_ws_in_source_keys(source[0]));
    var tmp_source = [];
    for (var obj of source) {
        tmp_source.push(rename_keys(obj, new_keys)); // XXX: this replacement does not work for s02-dma.query. Should it be corrected at hand
    }
    fs.writeFileSync(tmp_source_path, JSON.stringify(tmp_source, null, 4));

    // Clean and store temporary JARQL, replacing whites spaces in variables
    var tmp_jarql_path = jarql_folder + 'tmp_' + file_name.replace('.json', '') + '.query';
    var tmp_jarql = jarql;
    for (var k in new_keys) {
        tmp_jarql = tmp_jarql.replace(new RegExp(k, 'g'), new_keys[k]);
    }

    tmp_jarql = clean_undetected_strings(tmp_jarql);

    fs.writeFileSync(tmp_jarql_path, tmp_jarql);

    // Execute JARQL for the entire semantic model
    exec(`./jarql.sh ${tmp_source_path} ${tmp_jarql_path} > ${jarql_output_path}`, {
        stdio: 'inherit'
    });

    console.log('Clean completed!');

    console.log('\nClean the JARQL of semantic types ...');
    // Clean and store temporary JARQL for semantic types, replacing white spaces in variables
    var tmp_jarql_st_path = jarql_st_folder + 'tmp_' + file_name.replace('.json', '') + '.query';
    var tmp_jarql_st = jarql_st;
    for (var k in new_keys) {
        tmp_jarql_st = tmp_jarql_st.replace(new RegExp(k, 'g'), new_keys[k]);
    }

    tmp_jarql_st = clean_undetected_strings(tmp_jarql_st);

    fs.writeFileSync(tmp_jarql_st_path, tmp_jarql_st);

    // Execute JARL for the semantic types
    exec(`./jarql.sh ${tmp_source_path} ${tmp_jarql_st_path} > ${jarql_st_output_path}`, {
        stdio: 'inherit'
    });

    console.log('Clean completed!');

    // Remove temporary files
    fs.unlinkSync(tmp_source_path);
    fs.unlinkSync(tmp_jarql_path);
    fs.unlinkSync(tmp_jarql_st_path);

    var end_processing = new Date() - start_processing;

    console.log('\n\nFile processed in %ds', end_processing / 1000)

    console.log('\n\n\nEnd processing ' + file_name + '.\n\n\n');
}

if (input_file === undefined) {
    var files = fs.readdirSync(source_folder); // Iterate on cleaned and enriched source files
    files.forEach(file_name => {
        generate_rdf(file_name)
    });
} else {
    generate_rdf(input_file + '.json');
}

var end = new Date() - start;
console.log('Execution time: %d minutes', end / 1000 / 60)