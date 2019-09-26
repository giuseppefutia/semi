const fs = require('fs');
const path = require('path');
const es_client = require('./elastic_client');

// Elastic search mapping for SeMi
const mapping = {
    properties: {
        semantic_type: {
            type: "text"
        },
        body: {
            type: "text"
        },
    }
}

const pc_to_classify = [
    'Z4ADEA9DE4.json',
    'ZE8180442C.json',
    'ZE8183C83E.json',
    'ZE81959E49.json',
    'ZE81991D74.json'
];

var build_semantic_types = async (index_name, input_folder) => {
    var index_data = prepare_data(index_name, input_folder);

    console.log('Check if ' + index_name + ' index exists...');
    // Create index if it does not exist
    const exist = await es_client.index_exist(index_name);
    if (!exist) {
        await es_client.create_index(index_name);
        console.log(index_name + ' index does not exist. Create it...');
    }

    // Add mapping to the index
    await es_client.add_mapping_to_index(index_name, 'type', mapping);

    console.log('Add mapping to ' + index_name + ' index...');

    // Add data to the index
    for (var i in index_data) {
        var data = {
            'semantic_type': i,
            'body': index_data[i]
        }
        await es_client.insert_doc(index_name, i, 'type', data);
    }

    console.log('Add ' + index_name + ' data to the index...');

    // Get info on the the index and count the doc
    const index_info = await es_client.cat_index(index_name);

    console.log('Get info on' + index_name + ':');

    console.log(index_info);
}

var prepare_data = (index_name, input_folder) => {
    // Prepare data according to the specific input
    var index_data = [];
    if (index_name === 'pc') {
        index_data = prepare_pc_data(input_folder);
    }
    return index_data;
}


/**
 * BEGINNING: Parsers
 **/
var prepare_pc_data = (input_folder) => {
    var index_fields = {};
    index_fields['pc:Contract***dcterms:identifier'] = [];
    index_fields['pc:Contract***rdfs:description'] = [];
    index_fields['gr:BusinessEntity***dcterms:identifier'] = [];
    index_fields['gr:BusinessEntity***rdfs:label'] = [];

    fs.readdirSync(input_folder).forEach(file_name => {
        if (!pc_to_classify.includes(file_name)) {
            var file = JSON.parse(fs.readFileSync(input_folder + file_name, 'utf8'));
            try {
                index_fields['pc:Contract***rdfs:description'].push(file['oggetto']);
                index_fields['pc:Contract***dcterms:identifier'].push(file['cig']);
                index_fields['gr:BusinessEntity***dcterms:identifier'].push(file['strutturaProponente']['codiceFiscaleProp']);
                index_fields['gr:BusinessEntity***rdfs:label'].push(file['strutturaProponente']['denominazione']);

                for (var p of file['partecipanti']['partecipante']) {
                    index_fields['gr:BusinessEntity***dcterms:identifier'].push(p['codiceFiscale']);
                    index_fields['gr:BusinessEntity***dcterms:identifier'].push(p['ragioneSociale']);
                }

                for (var p of file['aggiudicatari']['aggiudicatario']) {
                    index_fields['gr:BusinessEntity***dcterms:identifier'].push(p['codiceFiscale']);
                    index_fields['gr:BusinessEntity***dcterms:identifier'].push(p['ragioneSociale']);
                }
            } catch (e) {
                //
            } finally {
                //
            }
        }
    });
    index_fields['pc:Contract***dcterms:identifier'] = index_fields['pc:Contract***dcterms:identifier'].join(' ');
    index_fields['pc:Contract***rdfs:description'] = index_fields['pc:Contract***rdfs:description'].join(' ');
    index_fields['gr:BusinessEntity***dcterms:identifier'] = index_fields['gr:BusinessEntity***dcterms:identifier'].join(' ');
    index_fields['gr:BusinessEntity***rdfs:label'] = index_fields['gr:BusinessEntity***rdfs:label'].join(' ');

    return index_fields;
}

var prepare_rodi_data = (input_folder) => {
    // TODO
}
/**
 * END: Parsers
 **/

exports.build_semantic_types = build_semantic_types;