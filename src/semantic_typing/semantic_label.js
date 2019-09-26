const fs = require('fs');
const es_client = require('./elastic_client');

var get_semantic_types = async (index_name, input_file, st_file) => {
    // Prepare structure to get semantic type
    var semantic_type = [{
        "source": input_file,
        "attributes": [],
        "entities": [],
        "uris": [],
        "semantic_types": []
    }];

    // Get input data to prepare the search query
    const input_data = get_input_data(index_name, input_file);

    // Get a rank of semantic types for each field of the data source
    for (var i of input_data) {
        const payload = {
            query: {
                match_phrase_prefix: {
                    'body': i['value'].toString()
                }
            }
        }
        const res = await es_client.search(index_name, 'type', payload);

        // Add info to the semantic_type data structure
        var entities_index = 0;
        semantic_type[0]['attributes'].push(i['field']);
        semantic_type[0]['uris'].push(false); // Default behaviour (TODO: automatize?)
        semantic_type[0]['entities'].push(0); // Default behaviour (TODO: automatize?)
        if (res['hits']['hits'].length === 0) {
            semantic_type[0]['semantic_types'].push(['Not detected!']);
        } else {
            semantic_type[0]['semantic_types'].push([res['hits']['hits'][0]['_id']]);
        }
    }
    fs.writeFileSync(st_file, JSON.stringify(semantic_type, null, 4));
}

var get_input_data = (index_name, input_file) => {
    var input_data = [];
    if (index_name === 'pc') {
        input_data = get_pc_input_data(input_file);
    }
    return input_data;
}

var get_pc_input_data = (input_file) => {
    // This parser is adapt to the improved version of pc data
    var pc_input_data = [];
    const pc_data = JSON.parse(fs.readFileSync(input_file, 'utf8'));

    const pc_cig = {
        field: 'cig',
        value: pc_data['cig']
    };
    pc_input_data.push(pc_cig);

    const pc_oggetto = {
        field: 'oggetto',
        value: pc_data['oggetto']
    }
    pc_input_data.push(pc_oggetto);

    const pc_strutt_prop_id = {
        field: 'strutturaProponente__codiceFiscaleProp',
        value: pc_data['strutturaProponente']['codiceFiscaleProp']
    }
    pc_input_data.push(pc_strutt_prop_id);

    var partecipanti_id = [];
    for (var p of pc_data['partecipanti']) {
        partecipanti_id.push(p['identificativo']);
    }
    var pc_partecipanti_id = {
        field: 'partecipanti___identificativo',
        value: partecipanti_id.join(' ')
    }
    pc_input_data.push(pc_partecipanti_id);

    var partecipanti_label = [];
    for (var p of pc_data['partecipanti']) {
        partecipanti_label.push(p['ragioneSociale']);
    }
    var pc_partecipanti_label = {
        field: 'partecipanti___ragioneSociale',
        value: partecipanti_label.join(' ')
    }
    pc_input_data.push(pc_partecipanti_label);

    // TODO: should be finalized with other data

    return pc_input_data;
}

exports.get_semantic_types = get_semantic_types;