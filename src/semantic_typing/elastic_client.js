const es_client = require('./client');

const index_exist = async function(index_name) {
    return await es_client.indices.exists({
        index: index_name
    });
}

const create_index = async function(index_name) {
    return await es_client.indices.create({
        index: index_name
    });
}

const add_mapping_to_index = async function(index_name, mapping_type, mapping) {
    return await es_client.indices.putMapping({
        index: index_name,
        type: mapping_type,
        body: mapping,
        include_type_name: true
    });
}

const insert_doc = async function(index_name, _id, mapping_type, data) {
    return await es_client.index({
        index: index_name,
        type: mapping_type,
        id: _id,
        body: data
    });
}

const cat_index = async function(index_name) {
    return await es_client.cat.count({
        index: index_name,
        v: true
    });
}

const search = async function(index_name, mapping_type, payload) {
    return await es_client.search({
        index: index_name,
        type: mapping_type,
        body: payload
    });
}

// Export functions
exports.index_exist = index_exist;
exports.create_index = create_index;
exports.add_mapping_to_index = add_mapping_to_index;
exports.insert_doc = insert_doc;
exports.cat_index = cat_index;
exports.search = search;