var fs = require('fs');
/**
 *
 * Clean sources and semantic types for semantic modeling with SeMi
 *
 **/

/** BEGIN OF UTIL FUNCTIONS **/

var rename_keys = (obj, new_keys) => {
    const key_values = Object.keys(obj).map(key => {
        const new_key = new_keys[key] || key;
        return {
            [new_key]: obj[key]
        };
    });
    return Object.assign({}, ...key_values);
}

var replace_underscores_in_source = (obj) => {
    return Object.keys(obj).map(obj_without_ => {
        obj_with_ = obj_without_.replace(/\s/g, '_');
        return {
            [obj_without_]: obj_with_
        };
    });
}

var replace_underscores_in_st = (obj) => {
    var attrs = obj['attributes'];
    return attrs.map(item => {
        return item.replace(/\s/g, '_');
    })
}

var array_to_object = (arr) => {
    return arr.reduce((result, item) => {
        var key = Object.keys(item)[0];
        result[key] = item[key];
        return result;
    }, {})
}

var create_appellation = (obj, s_field, a_field) => {
    // Taheriyan sometimes includes an "appellation" field that is not listed in the input source.
    // For this reason I need to add such new appellation field in the input source.
    var updated_appellation = obj[s_field].split(' ');
    updated_appellation = updated_appellation[1] + ', ' + updated_appellation[0];
    return updated_appellation;
}

/** END OF UTIL FUNCTIONS **/

var data_folder = process.argv.slice(2)[0];

/**
 *
 * s03-ima-artists.json -- Original file: JSON
 *
 **/

console.log('\nProcessing s03-ima-artists.json...\n');

var source_path = 'data/taheriyan2016/' + data_folder + '/sources/updated_json/s03-ima-artists.json';
var source = JSON.parse(fs.readFileSync(source_path, 'utf-8'));

// NOTE: Add appellation field
if (source[0]['appellation'] === undefined) {
    for (var obj of source) {
        obj['appellation'] = obj['name'];
    }
}

fs.writeFileSync(source_path, JSON.stringify(source, null, 4));

console.log('... end of processing of s03-ima-artists...\n\n');









/** s01-cb.json -- Original file: JSON. **/

// NOTE: Add underscores in the source
// ***** MANUALLY DONE ***** //

// NOTE: Add underscores in the semantic type
// ***** MANUALLY DONE ***** //

// NOTE: Fields that become URI
// * Alpha_Sort
// * Title
// * Medium
// ***** MANUALLY DONE ***** //



/** s02-dma.json -- Original file: JSON **/

/*
var source_path = 'data/taheriyan2016/' + data_folder + '/sources/updated_json/s02-dma.json';
var st_path = 'data/taheriyan2016/' + data_folder + '/semantic_types/manual/s02-dma_st.json';

var source = JSON.parse(fs.readFileSync(source_path, 'utf-8'));
var st = JSON.parse(fs.readFileSync(st_path, 'utf-8'));

// NOTE: Add appellation field and value if necessary
if (source[0]['Artist_Appellation'] === undefined) {
    for (var obj of source) {
        var appellation = create_appellation(obj, 'Artist Name', 'Artist Appellation');
        obj['Artist Appellation'] = appellation;
    }
}

// NOTE: Replace keys with underscore within source
var updated_source = [];
for (var obj of source) {
    var new_keys = array_to_object(replace_underscores_in_source(obj));
    var updated_obj = rename_keys(obj, new_keys);
    updated_source.push(updated_obj);
}

fs.writeFileSync(source_path, JSON.stringify(updated_source, null, 4));

// NOTE: Replace st with underscores
for (var obj in st) {
    var attr = replace_underscores_in_st(st[obj]);
    st[obj]['attributes'] = attr;
}

// NOTE: Fields that become URI
// Object_Title
// Object_Link_Source
// Object_Work_Type
// Object_Facet_Value_1
// Artist_Nationality


fs.writeFileSync(st_path, JSON.stringify(st, null, 4));

console.log('End of processing of s02-dma.json...\n\n');



/** s03-ima-artists.json -- Original file: XML
console.log('\nProcessing s03-ima-artists.json...\n');

// NOTE: Remove external keys from the source (derived from the XML file)
// ***** MANUALLY DONE ***** //

// NOTE: Replace keys with underscore within source
// ***** MANUALLY DONE ***** //

// NOTE: Replace "name_first_last" with "name" in the semantic type. In fact, the name of the attribute in the source is name
// ***** MANUALLY DONE ***** //

// NOTE: Add "artist__" in the semantic type to enable the JSON parser

// NOTE: Fields that become URI
// artist__title
// artist__nationality
// artist__name

console.log('End of processing of s03-ima-artists.json...\n\n');



/** s04-ima-artworks.json -- Original file: XML
console.log('\nProcessing s04-ima-artworks.json...\n');

// TODO: this is a complex structure that requires update also in the SeMi code

// NOTE: Fields that become URI

console.log('End of processing of s04-ima-artworks.json...\n\n');



/** s05-met.json -- Original file: JSON
console.log('\nProcessing s05-met.json...\n');

// TODO: this is a complex structure that requires update also in the SeMi code

console.log('End of processing of s05-met.json...\n\n');


/** s05-met.json -- Original file: JSON
console.log('\nProcessing s06-met.json...\n');

// TODO: this is a complex structure that requires update also in the SeMi code

// NOTE: Fields that become URI

console.log('End of processing of s06-met.json...\n\n');*/