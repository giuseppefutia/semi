var fs = require('fs');
/**
 *
 * Check the coherence of manual modified semantic types with JSON-converted sources.
 * This process is necessary to automatically build semantic models from taheriyan2016 data.
 *
 */

var data_folder = process.argv.slice(2)[0];
var st_folder = 'data/taheriyan2016/' + data_folder + '/semantic_types/updated/';
var st_orig_folder = 'data/taheriyan2016/' + data_folder + '/semantic_types/auto/';

var files = fs.readdirSync(st_folder);
files.forEach(file_name => {
    console.log('\nChecking ' + file_name + '...\n');

    var st = JSON.parse(fs.readFileSync(st_folder + file_name, 'utf-8'));
    var st_orig = JSON.parse(fs.readFileSync(st_orig_folder + file_name, 'utf-8'));

    // Original number of entities in automatic-generated semantic types
    var entities_num = 0;
    var entity_str = 'http://isi.edu/integration/karma/dev#classLink';
    for (var s of st_orig[0]['semantic_types']) {
        if (s[0].indexOf(entity_str) !== -1) {
            entities_num++;
        }
    }

    var attrs_num = st[0]['attributes'].length;
    var ents_num = st[0]['entities'].length;
    var uris_num = st[0]['uris'].length;
    var sts_num = st[0]['semantic_types'].length;

    if (!(attrs_num === ents_num && ents_num === uris_num && uris_num === sts_num)) {
        throw ('Different dimension between arrays in semantic types!');
    }

    var entities_detected = 0;

    for (var u of st[0]['uris']) {
        if (u === true) entities_detected++;
    }

    if (entities_num !== entities_detected) {
        throw ('The number of entities is incorrect!');
    }

    console.log('Everything is fine!!\n')
});