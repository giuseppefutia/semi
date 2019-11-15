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
 * s01-cb.json -- Original file: CSV
 *
 **/
console.log('\nProcessing s01-cb.json...\n');
var source_path = 'data/taheriyan2016/' + data_folder + '/sources/original_json/s01-cb.json';
var output_path = 'data/taheriyan2016/' + data_folder + '/sources/updated_json/s01-cb.json';
var source = JSON.parse(fs.readFileSync(source_path, 'utf-8'));

// NOTE: Add Actor_URI field
if (source[0]['Actor_URI'] === undefined) {
    for (var obj of source) {
        obj['Actor_URI'] = obj['Alpha Sort'];
    }
}

// NOTE: Add Medium_URI field
if (source[0]['Medium_URI'] === undefined) {
    for (var obj of source) {
        obj['Medium_URI'] = obj['Medium'];
    }
}

// NOTE: Add Artist_Appellation_URI field
if (source[0]['Artist_Appellation_URI'] === undefined) {
    for (var obj of source) {
        obj['Artist_Appellation_URI'] = obj['Attribution'];
    }
}

fs.writeFileSync(output_path, JSON.stringify(source, null, 4));

/**
 *
 * s02-dma.json -- Original file: CSV
 *
 **/
console.log('\nProcessing s02-dma.json...\n');
var source_path = 'data/taheriyan2016/' + data_folder + '/sources/original_json/s02-dma.json';
var output_path = 'data/taheriyan2016/' + data_folder + '/sources/updated_json/s02-dma.json';
var source = JSON.parse(fs.readFileSync(source_path, 'utf-8'));

// NOTE: Add Artist URI field
if (source[0]['Artist URI'] === undefined) {
    for (var obj of source) {
        obj['Artist URI'] = obj['Artist Name'];
    }
}

// NOTE: Add Object_URI field
if (source[0]['Object_URI'] === undefined) {
    for (var obj of source) {
        obj['Object_URI'] = obj['Object ID'];
    }
}

// NOTE: Add Museum URI field
if (source[0]['Museum URI'] === undefined) {
    for (var obj of source) {
        obj['Museum URI'] = obj['Object Link Source'];
    }
}

// NOTE: Add Object Work Type URI field
if (source[0]['Object Work Type URI'] === undefined) {
    for (var obj of source) {
        obj['Object Work Type URI'] = obj['Object Work Type'];
    }
}

// NOTE: Add Medium URI field
if (source[0]['Medium URI'] === undefined) {
    for (var obj of source) {
        obj['Medium URI'] = obj['Object Facet Value 1'];
    }
}

// NOTE: Add Nationality_URI field
if (source[0]['Nationality_URI'] === undefined) {
    for (var obj of source) {
        obj['Nationality_URI'] = obj['Artist Nationality'];
    }
}

// NOTE: Add Nationality_URI field
if (source[0]['Nationality_URI'] === undefined) {
    for (var obj of source) {
        obj['Nationality_URI'] = obj['Artist Nationality'];
    }
}

// NOTE: Artist Appellation field
if (source[0]['Artist Appellation'] === undefined) {
    for (var obj of source) {
        obj['Artist Appellation'] = obj['Artist Name'];
    }
}

console.log('... end of processing of s01-cb.json.\n\n');

fs.writeFileSync(output_path, JSON.stringify(source, null, 4));

console.log('... end of processing of s02-dma.json.\n\n');


/**
 *
 * s03-ima-artists.json -- Original file: XML
 *
 **/

console.log('\nProcessing s03-ima-artists.json...\n');
var source_path = 'data/taheriyan2016/' + data_folder + '/sources/original_json/s03-ima-artists.json';
var output_path = 'data/taheriyan2016/' + data_folder + '/sources/updated_json/s03-ima-artists.json';
var source = JSON.parse(fs.readFileSync(source_path, 'utf-8'));

source = source['artists']['artist'];

// NOTE: Add appellation field
if (source[0]['appellation'] === undefined) {
    for (var obj of source) {
        obj['appellation'] = obj['name'];
    }
}

fs.writeFileSync(output_path, JSON.stringify(source, null, 4));

console.log('... end of processing of s03-ima-artists.json.\n\n');

/**
 *
 * s04-ima-artworks.json -- Original file: XML
 *
 **/

console.log('\nProcessing s04-ima-artworks.json...\n');

var source_path = 'data/taheriyan2016/' + data_folder + '/sources/original_json/s04-ima-artworks.json';
var output_path = 'data/taheriyan2016/' + data_folder + '/sources/updated_json/s04-ima-artworks.json';
var source = JSON.parse(fs.readFileSync(source_path, 'utf-8'));

source = source['artworks']['artwork'];

// NOTE: Add appellation field
if (source[0]['appellation'] === undefined) {
    for (var obj of source) {
        obj['appellation'] = obj['artist'];
    }
}

// NOTE: add materialsURI field
if (source[0]['materialsURI'] === undefined) {
    for (var obj of source) {
        obj['materialsURI'] = obj['materials'];
    }
}

// NOTE: add provenanceTypeURI field
if (source[0]['provenanceTypeURI'] === undefined) {
    for (var obj of source) {
        obj['provenanceTypeURI'] = obj['accessionNumber'];
    }
}

// NOTE: add galleryLabelTypeURI field
if (source[0]['galleryLabelTypeURI'] === undefined) {
    for (var obj of source) {
        obj['galleryLabelTypeURI'] = obj['title'];
    }
}

fs.writeFileSync(output_path, JSON.stringify(source, null, 4));

console.log('... end of processing of s04-ima-artworks.json.\n\n');

/**
 *
 * s05-met.json -- Original file: JSON
 *
 **/

console.log('\nProcessing s05-met.json...\n');

var source_path = 'data/taheriyan2016/' + data_folder + '/sources/original_json/s05-met.json';
var output_path = 'data/taheriyan2016/' + data_folder + '/sources/updated_json/s05-met.json';
var source = JSON.parse(fs.readFileSync(source_path, 'utf-8'));

// NOTE: Add Person URI field
if (source[0]['Person URI'] === undefined) {
    for (var obj of source) {
        obj['Person URI'] = obj['Who'];
    }
}

// NOTE: add Object URI field
if (source[0]['Object URI'] === undefined) {
    for (var obj of source) {
        obj['Object URI'] = obj['id'];
    }
}

// NOTE: add Classification URI field
if (source[0]['Classification URI'] === undefined) {
    for (var obj of source) {
        obj['Classification URI'] = obj['Classification'];
    }
}

// NOTE: add Culture URI field
if (source[0]['Culture URI'] === undefined) {
    for (var obj of source) {
        obj['Culture URI'] = obj['Culture'];
    }
}

// NOTE: add Medium URI field
if (source[0]['Medium URI'] === undefined) {
    for (var obj of source) {
        obj['Medium URI'] = obj['Medium'];
    }
}

// NOTE: add Medium URI field
if (source[0]['ProvenanceTypeURI'] === undefined) {
    for (var obj of source) {
        obj['ProvenanceTypeURI'] = obj['id'];
    }
}

// NOTE: add Appellation URI field
if (source[0]['Appellation URI'] === undefined) {
    for (var obj of source) {
        obj['Appellation URI'] = obj['Who'];
    }
}

fs.writeFileSync(output_path, JSON.stringify(source, null, 4));

console.log('... end of processing of s05-met.json.\n\n');

/**
 *
 * s06-npg.json -- Original file: JSON
 *
 **/

console.log('\nProcessing s06-npg.json...\n');

var source_path = 'data/taheriyan2016/' + data_folder + '/sources/original_json/s06-npg.json';
var output_path = 'data/taheriyan2016/' + data_folder + '/sources/updated_json/s06-npg.json';
var source = JSON.parse(fs.readFileSync(source_path, 'utf-8'));

// NOTE: Add Artist_URI field
if (source[0]['Artist_URI'] === undefined) {
    for (var obj of source) {
        obj['Artist_URI'] = obj['Artist'];
    }
}

// NOTE: Add ObjectURI field
if (source[0]['ObjectURI'] === undefined) {
    for (var obj of source) {
        obj['ObjectURI'] = obj['title'];
    }
}

// NOTE: Add OwnerURI field
if (source[0]['OwnerURI'] === undefined) {
    for (var obj of source) {
        obj['OwnerURI'] = obj['Owner'];
    }
}

// NOTE: Add ClassificationURI field
if (source[0]['ClassificationURI'] === undefined) {
    for (var obj of source) {
        obj['ClassificationURI'] = obj['Classification'];
    }
}

// NOTE: Add MediumURI field
if (source[0]['MediumURI'] === undefined) {
    for (var obj of source) {
        obj['MediumURI'] = obj['Medium'];
    }
}

// NOTE: Add ArtistAppellation_URI field
if (source[0]['ArtistAppellation_URI'] === undefined) {
    for (var obj of source) {
        obj['ArtistAppellation_URI'] = obj['Artist'];
    }
}

fs.writeFileSync(output_path, JSON.stringify(source, null, 4));

console.log('... end of processing of s06-npg.json.\n\n');

/**
 *
 * s07-s-13.json -- Original file: JSON
 *
 **/

console.log('\nProcessing s07-s-13.json...\n');

var source_path = 'data/taheriyan2016/' + data_folder + '/sources/original_json/s07-s-13.json';
var output_path = 'data/taheriyan2016/' + data_folder + '/sources/updated_json/s07-s-13.json';
var source = JSON.parse(fs.readFileSync(source_path, 'utf-8'));

// NOTE: Add Artist_uri field
if (source[0]['Artist_uri'] === undefined) {
    for (var obj of source) {
        obj['Artist_uri'] = obj['name'];
    }
}

// NOTE: Add Artist_uri field
if (source[0]['Object_URI'] === undefined) {
    for (var obj of source) {
        obj['Object_URI'] = obj['title'];
    }
}

// NOTE: Add Artist_uri field
if (source[0]['Object_URI'] === undefined) {
    for (var obj of source) {
        obj['Object_URI'] = obj['title'];
    }
}

// NOTE: Add technique_uri field
if (source[0]['technique_uri'] === undefined) {
    for (var obj of source) {
        obj['technique_uri'] = obj['technique'];
    }
}

// NOTE: Add technique_uri field
if (source[0]['technique_uri'] === undefined) {
    for (var obj of source) {
        obj['technique_uri'] = obj['technique'];
    }
}

// NOTE: Add technique_uri field
if (source[0]['label_type_uri'] === undefined) {
    for (var obj of source) {
        obj['label_type_uri'] = obj['technique'];
    }
}

// NOTE: Add label_type_uri field
if (source[0]['label_type_uri'] === undefined) {
    for (var obj of source) {
        obj['label_type_uri'] = obj['Label_on_page'];
    }
}

// NOTE: Add origin_type_uri field
if (source[0]['origin_type_uri'] === undefined) {
    for (var obj of source) {
        obj['origin_type_uri'] = obj['origin'];
    }
}

// NOTE: Add nationality_uri field
if (source[0]['nationality_uri'] === undefined) {
    for (var obj of source) {
        obj['nationality_uri'] = obj['nationality'];
    }
}

// NOTE: Add Artist_appellation_uri field
if (source[0]['Artist_appellation_uri'] === undefined) {
    for (var obj of source) {
        obj['Artist_appellation_uri'] = obj['name'];
    }
}

fs.writeFileSync(output_path, JSON.stringify(source, null, 4));

console.log('... end of processing of s07-s-13.json.\n\n');

/**
 *
 * s08-s-17-edited.json -- Original file: XML
 *
 **/

console.log('\nProcessing s08-s-17-edited.json...\n');

var source_path = 'data/taheriyan2016/' + data_folder + '/sources/original_json/s08-s-17-edited.json';
var output_path = 'data/taheriyan2016/' + data_folder + '/sources/updated_json/s08-s-17-edited.json';
var source = JSON.parse(fs.readFileSync(source_path, 'utf-8'));
source = source['ARCHIVE']['ENTRY'];

// NOTE: Add AUTHOR_URI field
if (source[0]['AUTHOR_URI'] === undefined) {
    for (var obj of source) {
        obj['AUTHOR_URI'] = obj['AUTHOR'];
    }
}

// NOTE: Add TITLE NO AUTHOR field
if (source[0]['TITLE NO AUTHOR'] === undefined) {
    for (var obj of source) {
        obj['TITLE NO AUTHOR'] = obj['TITLE'].split(': ')[1];
    }
}

// NOTE: Add VIDEO_TYPE_URI field
if (source[0]['VIDEO_TYPE_URI'] === undefined) {
    for (var obj of source) {
        obj['VIDEO_TYPE_URI'] = obj['VIDEO'];
    }
}

// NOTE: Add AUTHOR_APPELLATION_URI field
if (source[0]['AUTHOR_APPELLATION_URI'] === undefined) {
    for (var obj of source) {
        obj['AUTHOR_APPELLATION_URI'] = obj['AUTHOR'];
    }
}

fs.writeFileSync(output_path, JSON.stringify(source, null, 4));

console.log('... end of processing of s08-s-17-edited.json.\n\n');

/**
 *
 * s09-s-18-artists.json -- Original file: JSON
 *
 **/

console.log('\nProcessing s09-s-18-artists.json...\n');

var source_path = 'data/taheriyan2016/' + data_folder + '/sources/original_json/s09-s-18-artists.json';
var output_path = 'data/taheriyan2016/' + data_folder + '/sources/updated_json/s09-s-18-artists.json';
var source = JSON.parse(fs.readFileSync(source_path, 'utf-8'));

// NOTE: Add AUTHOR_APPELLATION_URI field
if (source[0]['artist_uri'] === undefined) {
    for (var obj of source) {
        obj['artist_uri'] = obj['name'];
    }
}

// NOTE: Add AUTHOR_APPELLATION_URI field
if (source[0]['artist_appellation_uri'] === undefined) {
    for (var obj of source) {
        obj['artist_appellation_uri'] = obj['name'];
    }
}

// NOTE: Add birthValue field
if (source[0]['birthValue'] === undefined) {
    for (var obj of source) {
        if (obj['birth_death_date'].length > 0) {
            obj['birthValue'] = obj['birth_death_date'][0].split(' - ')[0];
        } else obj['birthValue'] = [];
    }
}

// NOTE: Add deathValue field
if (source[0]['deathValue'] === undefined) {
    for (var obj of source) {
        if (obj['birth_death_date'].length > 0) {
            obj['deathValue'] = obj['birth_death_date'][0].split(' - ')[1];
        } else obj['deathValue'] = [];
    }
}

fs.writeFileSync(output_path, JSON.stringify(source, null, 4));

console.log('... end of processing of s09-s-18-artists.json.\n\n');

/**
 *
 * s10-s-18-artworks.json -- Original file: JSON
 *
 **/

console.log('\nProcessing s10-s-18-artworks.json...\n');

var source_path = 'data/taheriyan2016/' + data_folder + '/sources/original_json/s10-s-18-artworks.json';
var output_path = 'data/taheriyan2016/' + data_folder + '/sources/updated_json/s10-s-18-artworks.json';
var source = JSON.parse(fs.readFileSync(source_path, 'utf-8'));

// NOTE: Add auther_uri field
if (source[0]['auther_uri'] === undefined) {
    for (var obj of source) {
        obj['auther_uri'] = obj['artist'];
    }
}

// NOTE: Add object_uri field
if (source[0]['object_uri'] === undefined) {
    for (var obj of source) {
        obj['object_uri'] = obj['accession_id'];
    }
}

// NOTE: Add material_uri field
if (source[0]['material_uri'] === undefined) {
    for (var obj of source) {
        obj['material_uri'] = obj['materials'];
    }
}

// NOTE: Add material_uri field
if (source[0]['author_appellation_uri'] === undefined) {
    for (var obj of source) {
        obj['author_appellation_uri'] = obj['artist'];
    }
}

fs.writeFileSync(output_path, JSON.stringify(source, null, 4));

console.log('... end of processing of s10-s-18-artworks.json.\n\n');

/**
 *
 * s11-s-19-artists.json -- Original file: JSON
 *
 **/

console.log('\nProcessing s11-s-19-artists.json...\n');

var source_path = 'data/taheriyan2016/' + data_folder + '/sources/original_json/s11-s-19-artists.json';
var output_path = 'data/taheriyan2016/' + data_folder + '/sources/updated_json/s11-s-19-artists.json';
var source = JSON.parse(fs.readFileSync(source_path, 'utf-8'));
source = source['getty_artists']

// NOTE: Add biography_type_uri field
if (source[0]['biography_type_uri'] === undefined) {
    for (var obj of source) {
        obj['biography_type_uri'] = obj['artist_name'];
    }
}

// NOTE: Add occupation_type_uri field
if (source[0]['occupation_type_uri'] === undefined) {
    for (var obj of source) {
        obj['occupation_type_uri'] = obj['occupation'];
    }
}

// NOTE: Add occupation_type_uri field
if (source[0]['nationality_uri'] === undefined) {
    for (var obj of source) {
        obj['nationality_uri'] = obj['nationality'];
    }
}

fs.writeFileSync(output_path, JSON.stringify(source, null, 4));

console.log('... end of processing of s11-s-19-artists.json.\n\n');

/**
 *
 * s12-s-19-artworks.json -- Original file: XML
 *
 **/

console.log('\nProcessing s12-s-19-artworks.json...\n');

var source_path = 'data/taheriyan2016/' + data_folder + '/sources/original_json/s12-s-19-artworks.json';
var output_path = 'data/taheriyan2016/' + data_folder + '/sources/updated_json/s12-s-19-artworks.json';
var source = JSON.parse(fs.readFileSync(source_path, 'utf-8'));
source = source['artwork']

// NOTE: Add artist_uri field
if (source[0]['artist_uri'] === undefined) {
    for (var obj of source) {
        obj['artist_uri'] = obj['artist_name'];
    }
}

// NOTE: Add object_uri field
if (source[0]['object_uri'] === undefined) {
    for (var obj of source) {
        obj['object_uri'] = obj['access_id'];
    }
}

// NOTE: Add nationality_uri field
if (source[0]['nationality_uri'] === undefined) {
    for (var obj of source) {
        obj['nationality_uri'] = obj['nationality'];
    }
}

// NOTE: Add artist_appellation_uri field
if (source[0]['artist_appellation_uri'] === undefined) {
    for (var obj of source) {
        obj['artist_appellation_uri'] = obj['artist_name'];
    }
}

fs.writeFileSync(output_path, JSON.stringify(source, null, 4));

console.log('... end of processing of s12-s-19-artworks.json.\n\n');

/**
 *
 * s13-s-art-institute-of-chicago.json-- Original file: XML
 *
 **/

console.log('\nProcessing s13-s-art-institute-of-chicago.json...\n');

var source_path = 'data/taheriyan2016/' + data_folder + '/sources/original_json/s13-s-art-institute-of-chicago.json';
var output_path = 'data/taheriyan2016/' + data_folder + '/sources/updated_json/s13-s-art-institute-of-chicago.json';
var source = JSON.parse(fs.readFileSync(source_path, 'utf-8'));

fs.writeFileSync(output_path, JSON.stringify(source, null, 4));

console.log('... end of processing of s13-s-art-institute-of-chicago.json.\n\n');




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