var fs = require('fs');
var utils = require(__dirname + '/../../src/semantic_modeling/utils.js');
const PREFIX = utils.get_prefix();
/**
 *
 * Processing taheriyan2016 ground truth data to prepare an initial version of the semantic type
 *
 */

var array_to_object = (arr, keyField) =>
    Object.assign({}, ...arr.map(item => ({
        [item[keyField]]: item
    })));

var get_base_uri = (uri) =>
    Object.keys(PREFIX).find(key => {
        return uri.includes(key);
    });

var create_st = (st, column, node, index) => {
    // Fill attributes
    st[0]['attributes'].push(column['columnName']);

    // Fill semantic types
    var st_domain = node['userSemanticTypes'][0]['domain']['uri'];
    var class_base_uri = get_base_uri(st_domain);
    var st_class = st_domain.replace(class_base_uri, PREFIX[class_base_uri]);
    var st_type = node['userSemanticTypes'][0]['type']['uri'];
    var prop_base_uri = get_base_uri(st_type);
    var st_property = st_type.replace(prop_base_uri, PREFIX[prop_base_uri]);
    st[0]['semantic_types'].push([st_class + '***' + st_property]);

    // Fill uris: default behaviour based on http://isi.edu/integration/karma/dev#classLink
    if (st_property.indexOf('http://isi.edu/integration/karma/dev#classLink') !== -1) {
        st[0]['uris'].push(true);
    } else {
        st[0]['uris'].push(false);
    }

    // Fill index of entities using links in the graph
    st[0]['entities'].push(index);
}

// Load data of the ground truth available in JSON format
var data_folder = process.argv.slice(2)[0];
var input_folder = 'evaluation/taheriyan2016/' + data_folder + '/semantic_models_gt/json/';

var files = fs.readdirSync(input_folder);

files.forEach(file_name => {
    var gt = JSON.parse(fs.readFileSync(input_folder + file_name, 'utf-8'));
    var gt_nodes = gt['graph']['nodes'];
    var gt_links = gt['graph']['links'];

    // Create and store semantic type file using nodes information of the ground truth
    var columns = array_to_object(gt['sourceColumns'], 'id');
    var st = [{}];

    st[0]['attributes'] = [];
    st[0]['entities'] = [];
    st[0]['uris'] = [];
    st[0]['semantic_types'] = [];

    for (var n of gt_nodes) {
        var column = columns[n['id']];
        if (column !== undefined) {

            // Get index of the entity from the links
            var link_for_index = gt_links.filter(i => {
                return i['id'].split('---')[2] === n['id'];
            });
            if (link_for_index.length > 1) {
                console.log('*** Warning: ' + n['id'] + ' in file ' + file_name + ' is used for more than once ***');
            }
            var index = link_for_index[0]['id'].split('---')[0].slice(-1);

            // Create semantic type
            create_st(st, column, n, index);

            file_name.split('.')[0];
            var output_st =
                'data/taheriyan2016/' +
                data_folder + '/semantic_types/auto/' +
                file_name.split('.')[0] + '_st.json';

            // Store semantic types
            fs.writeFileSync(output_st, JSON.stringify(st, null, 4));
        }
    }
});