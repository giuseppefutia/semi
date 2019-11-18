var fs = require('fs');
/**
 *
 * Clean sources and semantic types for semantic modeling with SeMi
 *
 **/

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

for (var obj of source) {
    obj['related-artworks'] = obj['related-artworks'].map(String);
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
source = source['artwork'];

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

source = source['Items']['Item'];

// NOTE: Add Artist_URI field
if (source[0]['Artist_URI'] === undefined) {
    for (var obj of source) {
        obj['Artist_URI'] = obj['Artistname'];
    }
}

// NOTE: Add Technique_uri field
if (source[0]['Technique_uri'] === undefined) {
    for (var obj of source) {
        obj['Technique_uri'] = obj['Typeofartwork'];
    }
}

// NOTE: Add Nationality_uri field
if (source[0]['Nationality_uri'] === undefined) {
    for (var obj of source) {
        obj['Nationality_uri'] = obj['Nationality'];
    }
}

// NOTE: Add Artist_Appellation_URI field
if (source[0]['Artist_Appellation_URI'] === undefined) {
    for (var obj of source) {
        obj['Artist_Appellation_URI'] = obj['Artistname'];
    }
}

fs.writeFileSync(output_path, JSON.stringify(source, null, 4));

console.log('... end of processing of s13-s-art-institute-of-chicago.json.\n\n');

/**
 *
 * s14-s-california-african-american.json-- Original file: JSON
 *
 **/

console.log('\nProcessing s14-s-california-african-american.json...\n');

var source_path = 'data/taheriyan2016/' + data_folder + '/sources/original_json/s14-s-california-african-american.json';
var output_path = 'data/taheriyan2016/' + data_folder + '/sources/updated_json/s14-s-california-african-american.json';
var source = JSON.parse(fs.readFileSync(source_path, 'utf-8'));

source = source['artworks'];

// NOTE: Add object_uri field
if (source[0]['object_uri'] === undefined) {
    for (var obj of source) {
        obj['object_uri'] = obj['title'];
    }
}

// NOTE: Add artist_uri field
if (source[0]['artist_uri'] === undefined) {
    for (var obj of source) {
        obj['artist_uri'] = obj['artist'];
    }
}

// NOTE: Add technique_uri field
if (source[0]['technique_uri'] === undefined) {
    for (var obj of source) {
        obj['technique_uri'] = obj['technique'];
    }
}

// NOTE: Add ethnicity_uri field
if (source[0]['ethnicity_uri'] === undefined) {
    for (var obj of source) {
        obj['ethnicity_uri'] = obj['enthnicity'];
    }
}

// NOTE: Add artist_appellation_uri field
if (source[0]['artist_appellation_uri'] === undefined) {
    for (var obj of source) {
        obj['artist_appellation_uri'] = obj['accessionId'];
    }
}

fs.writeFileSync(output_path, JSON.stringify(source, null, 4));

console.log('... end of processing of s14-s-california-african-american.json.\n\n');

/**
 *
 * s15-s-detroit-institute-of-art.json-- Original file: JSON
 *
 **/

console.log('\nProcessing s15-s-detroit-institute-of-art.json...\n');

var source_path = 'data/taheriyan2016/' + data_folder + '/sources/original_json/s15-s-detroit-institute-of-art.json';
var output_path = 'data/taheriyan2016/' + data_folder + '/sources/updated_json/s15-s-detroit-institute-of-art.json';
var source = JSON.parse(fs.readFileSync(source_path, 'utf-8'));

source = source['paintings'];

// NOTE: Add artist_uri field
if (source[0]['artist_uri'] === undefined) {
    for (var obj of source) {
        obj['artist_uri'] = obj['name'];
    }
}

// NOTE: Add object_uri field
if (source[0]['object_uri'] === undefined) {
    for (var obj of source) {
        obj['object_uri'] = obj['accession'];
    }
}

// NOTE: Add medium_URI field
if (source[0]['medium_URI'] === undefined) {
    for (var obj of source) {
        obj['medium_URI'] = obj['medium'];
    }
}

// NOTE: Add classification_URI field
if (source[0]['classification_URI'] === undefined) {
    for (var obj of source) {
        obj['classification_URI'] = obj['classification'];
    }
}

// NOTE: Add nationality_URI field
if (source[0]['nationality_URI'] === undefined) {
    for (var obj of source) {
        obj['nationality_URI'] = obj['nationality'];
    }
}

// NOTE: Add artist_appellation_uri field
if (source[0]['artist_appellation_uri'] === undefined) {
    for (var obj of source) {
        obj['artist_appellation_uri'] = obj['name'];
    }
}

fs.writeFileSync(output_path, JSON.stringify(source, null, 4));

console.log('... end of processing of s15-s-detroit-institute-of-art.json.\n\n');

/**
 *
 * s16-s-hammer.json-- Original file: XML
 *
 **/

console.log('\nProcessing s16-s-hammer.json...\n');

var source_path = 'data/taheriyan2016/' + data_folder + '/sources/original_json/s16-s-hammer.json';
var output_path = 'data/taheriyan2016/' + data_folder + '/sources/updated_json/s16-s-hammer.json';
var source = JSON.parse(fs.readFileSync(source_path, 'utf-8'));

source = source['collections']['collection'];

// WARNING: YOU HAVE NESTED JSONs

// NOTE: Add artist_uri field
if (source[0]['item'][0]['artist_uri'] === undefined) {
    for (var obj of source) {
        for (var item of obj['item']) {
            item['artist_uri'] = item['artist'];
        }
    }
}

// NOTE: Add technique_uri field
if (source[0]['item'][0]['technique_uri'] === undefined) {
    for (var obj of source) {
        for (var item of obj['item']) {
            item['technique_uri'] = item['technique'];
        }
    }
}

// NOTE: Add artist_appellation_uri field
if (source[0]['item'][0]['artist_appellation_uri'] === undefined) {
    for (var obj of source) {
        for (var item of obj['item']) {
            item['artist_appellation_uri'] = item['artist'];
        }
    }
}

fs.writeFileSync(output_path, JSON.stringify(source, null, 4));

console.log('... end of processing of s16-s-hammer.json.\n\n');

/**
 *
 * s17-s-houston-museum-of-fine-arts-- Original file: JSON
 *
 **/

console.log('\nProcessing s17-s-houston-museum-of-fine-arts.json...\n');

var source_path = 'data/taheriyan2016/' + data_folder + '/sources/original_json/s17-s-houston-museum-of-fine-arts.json';
var output_path = 'data/taheriyan2016/' + data_folder + '/sources/updated_json/s17-s-houston-museum-of-fine-arts.json';
var source = JSON.parse(fs.readFileSync(source_path, 'utf-8'));

// NOTE: Add artist_uri field
if (source[0]['artist_uri'] === undefined) {
    for (var obj of source) {
        obj['artist_uri'] = obj['artist'];
    }
}

// NOTE: technique_uri field
if (source[0]['technique_uri'] === undefined) {
    for (var obj of source) {
        obj['technique_uri'] = obj['technique'];
    }
}

// NOTE: nationality_URI field
if (source[0]['nationality_URI'] === undefined) {
    for (var obj of source) {
        obj['nationality_URI'] = obj['nationality'];
    }
}

// NOTE: artist_appellation_uri field
if (source[0]['artist_appellation_uri'] === undefined) {
    for (var obj of source) {
        obj['artist_appellation_uri'] = obj['artist'];
    }
}

fs.writeFileSync(output_path, JSON.stringify(source, null, 4));

console.log('... end of processing of s17-s-houston-museum-of-fine-arts.json.\n\n');

/**
 *
 * s18-s-indianapolis-artists.json-- Original file: JSON
 *
 **/

console.log('\nProcessing s18-s-indianapolis-artists.json...\n');

var source_path = 'data/taheriyan2016/' + data_folder + '/sources/original_json/s18-s-indianapolis-artists.json';
var output_path = 'data/taheriyan2016/' + data_folder + '/sources/updated_json/s18-s-indianapolis-artists.json';
var source = JSON.parse(fs.readFileSync(source_path, 'utf-8'));

source = source['artists']['artist'];

// NOTE: artist_uri field
if (source[0]['artist_uri'] === undefined) {
    for (var obj of source) {
        obj['artist_uri'] = obj['name'];
    }
}

// NOTE: nationality_URI field
if (source[0]['nationality_URI'] === undefined) {
    for (var obj of source) {
        obj['nationality_URI'] = obj['nationality'];
    }
}

// NOTE: artist_appellation_uri field
if (source[0]['artist_appellation_uri'] === undefined) {
    for (var obj of source) {
        obj['artist_appellation_uri'] = obj['name'];
    }
}

fs.writeFileSync(output_path, JSON.stringify(source, null, 4));

console.log('... end of processing of s18-s-indianapolis-artists.json.\n\n');

/**
 *
 * s19-s-indianapolis-artworks.json-- Original file: XML
 *
 **/

console.log('\nProcessing s19-s-indianapolis-artworks.json...\n');

var source_path = 'data/taheriyan2016/' + data_folder + '/sources/original_json/s19-s-indianapolis-artworks.json';
var output_path = 'data/taheriyan2016/' + data_folder + '/sources/updated_json/s19-s-indianapolis-artworks.json';
var source = JSON.parse(fs.readFileSync(source_path, 'utf-8'));

source = source['artworks']['artwork'];

// NOTE: artist_uri field
if (source[0]['artist_uri'] === undefined) {
    for (var obj of source) {
        obj['artist_uri'] = obj['artist'];
    }
}

// NOTE: material_URI field
if (source[0]['material_URI'] === undefined) {
    for (var obj of source) {
        obj['material_URI'] = obj['materials'];
    }
}

// NOTE: material_URI field
if (source[0]['material_URI'] === undefined) {
    for (var obj of source) {
        obj['material_URI'] = obj['materials'];
    }
}

// NOTE: provenance_type_uri field
if (source[0]['provenance_type_uri'] === undefined) {
    for (var obj of source) {
        obj['provenance_type_uri'] = obj['accessionNumber'];
    }
}

// NOTE: galleryLabel_type_uri field
if (source[0]['galleryLabel_type_uri'] === undefined) {
    for (var obj of source) {
        obj['galleryLabel_type_uri'] = obj['accessionNumber'];
    }
}

// NOTE: nationality_URI field
if (source[0]['nationality_URI'] === undefined) {
    for (var obj of source) {
        obj['nationality_URI'] = obj['nationality'];
    }
}

// NOTE: artist_appellation_uri field
if (source[0]['artist_appellation_uri'] === undefined) {
    for (var obj of source) {
        obj['artist_appellation_uri'] = obj['artist'];
    }
}

fs.writeFileSync(output_path, JSON.stringify(source, null, 4));

console.log('... end of processing of s19-s-indianapolis-artworks.json.\n\n');

/**
 *
 * s20-s-lacma.json-- Original file: XML
 *
 **/

console.log('\nProcessing s20-s-lacma.json...\n');

var source_path = 'data/taheriyan2016/' + data_folder + '/sources/original_json/s20-s-lacma.json';
var output_path = 'data/taheriyan2016/' + data_folder + '/sources/updated_json/s20-s-lacma.json';
var source = JSON.parse(fs.readFileSync(source_path, 'utf-8'));

source = source['Items']['Item'];

// NOTE: Artist_URI field
if (source[0]['Artist_URI'] === undefined) {
    for (var obj of source) {
        obj['Artist_URI'] = obj['Artist_Name'];
    }
}

// NOTE: Object_URI field
if (source[0]['Object_URI'] === undefined) {
    for (var obj of source) {
        obj['Object_URI'] = obj['ID'];
    }
}

// NOTE: Classification_URI field
if (source[0]['Classification_URI'] === undefined) {
    for (var obj of source) {
        obj['Classification_URI'] = obj['ID'];
    }
}

fs.writeFileSync(output_path, JSON.stringify(source, null, 4));

console.log('... end of processing of s20-s-lacma.json.\n\n');

/**
 *
 * s21-s-met.json-- Original file: JSON
 *
 **/

console.log('\nProcessing s21-s-met.json...\n');

var source_path = 'data/taheriyan2016/' + data_folder + '/sources/original_json/s21-s-met.json';
var output_path = 'data/taheriyan2016/' + data_folder + '/sources/updated_json/s21-s-met.json';

console.log('It seems to be an invalid JSON!!!');

/*

var source = JSON.parse(fs.readFileSync(source_path, 'utf-8'));

source = source['artWork'];

// NOTE: artistURI field
if (source[0]['artistURI'] === undefined) {
    for (var obj of source) {
        obj['artistURI'] = obj['artistName'];
    }
}

// NOTE: objectURI field
if (source[0]['objectURI'] === undefined) {
    for (var obj of source) {
        obj['objectURI'] = obj['accessionNumber'];
    }
}

// NOTE: medium_URI field
if (source[0]['medium_URI'] === undefined) {
    for (var obj of source) {
        obj['medium_URI'] = obj['medium'];
    }
}

// NOTE: classification_URI field
if (source[0]['classification_URI'] === undefined) {
    for (var obj of source) {
        obj['classification_URI'] = obj['classification'];
    }
}

// NOTE: nationality_URI field
if (source[0]['nationality_URI'] === undefined) {
    for (var obj of source) {
        obj['nationality_URI'] = obj['nationality'];
    }
}

// NOTE: nationality_URI field
if (source[0]['artistAppellationURI'] === undefined) {
    for (var obj of source) {
        obj['artistAppellationURI'] = obj['artistName'];
    }
}

fs.writeFileSync(output_path, JSON.stringify(source, null, 4));

console.log('... end of processing of s21-s-met.json.\n\n');
*/

/**
 *
 * s22-s-moca.json-- Original file: XML
 *
 **/

console.log('\nProcessing s22-s-moca.json...\n');

var source_path = 'data/taheriyan2016/' + data_folder + '/sources/original_json/s22-s-moca.json';
var output_path = 'data/taheriyan2016/' + data_folder + '/sources/updated_json/s22-s-moca.json';
var source = JSON.parse(fs.readFileSync(source_path, 'utf-8'));

source = source['artworks']['Artist_Name'];

// NOTE: person_uri field
if (source[0]['person_uri'] === undefined) {
    for (var obj of source) {
        obj['person_uri'] = obj['name'];
    }
}

// NOTE: object_uri field
if (source[0]['object_uri'] === undefined) {
    for (var obj of source) {
        obj['object_uri'] = obj['Assension_Number'];
    }
}

// NOTE: Artwork_Name field
if (source[0]['Artwork_Name'] === undefined) {
    for (var obj of source) {
        var name = obj['Artwork_Name_and_Year'].split(',');
        name.pop();
        name.join(',');
        obj['Artwork_Name'] = name[0];
    }
}

// NOTE: Artwork_Year field
if (source[0]['Artwork_Year'] === undefined) {
    for (var obj of source) {
        var year = obj['Artwork_Name_and_Year'].split(',').pop();
        obj['Artwork_Year'] = year;
    }
}

// NOTE: object_uri field
if (source[0]['person_appellation_uri'] === undefined) {
    for (var obj of source) {
        obj['person_appellation_uri'] = obj['name'];
    }
}

fs.writeFileSync(output_path, JSON.stringify(source, null, 4));

console.log('... end of processing of s22-s-moca.json.\n\n');

/**
 *
 * s23-s-national-portrait-gallery.json-- Original file: JSON
 *
 **/

console.log('\nProcessing s23-s-national-portrait-gallery.json...\n');

var source_path = 'data/taheriyan2016/' + data_folder + '/sources/original_json/s23-s-national-portrait-gallery.json';
var output_path = 'data/taheriyan2016/' + data_folder + '/sources/updated_json/s23-s-national-portrait-gallery.json';
var source = JSON.parse(fs.readFileSync(source_path, 'utf-8'));

// NOTE: Artist_URI field
if (source[0]['Artist_URI'] === undefined) {
    for (var obj of source) {
        obj['Artist_URI'] = obj['name'];
    }
}

// NOTE: Object_URI field
if (source[0]['Object_URI'] === undefined) {
    for (var obj of source) {
        obj['Object_URI'] = obj['Title'];
    }
}

// NOTE: Classification_URI field
if (source[0]['Classification_URI'] === undefined) {
    for (var obj of source) {
        obj['Classification_URI'] = obj['Classification'];
    }
}

// NOTE: Medium_URI field
if (source[0]['Medium_URI'] === undefined) {
    for (var obj of source) {
        obj['Medium_URI'] = obj['Medium'];
    }
}

// NOTE: Subclassification_URI field
if (source[0]['Subclassification_URI'] === undefined) {
    for (var obj of source) {
        obj['Subclassification_URI'] = obj['Subclassification'];
    }
}

// NOTE: Subclassification_URI field
if (source[0]['Artist_Appellation_URI'] === undefined) {
    for (var obj of source) {
        obj['Artist_Appellation_URI'] = obj['name'];
    }
}

fs.writeFileSync(output_path, JSON.stringify(source, null, 4));

console.log('... end of processing of s23-s-national-portrait-gallery.json.\n\n');

/**
 *
 * s24-s-norton-simon.json-- Original file: JSON
 *
 **/

console.log('\nProcessing s24-s-norton-simon.json...\n');

var source_path = 'data/taheriyan2016/' + data_folder + '/sources/original_json/s24-s-norton-simon.json';
var output_path = 'data/taheriyan2016/' + data_folder + '/sources/updated_json/s24-s-norton-simon.json';
var source = JSON.parse(fs.readFileSync(source_path, 'utf-8'));

// NOTE: artist_uri field
if (source[0]['artist_uri'] === undefined) {
    for (var obj of source) {
        obj['artist_uri'] = obj['artist'];
    }
}

// NOTE: object_uri field
if (source[0]['object_uri'] === undefined) {
    for (var obj of source) {
        obj['object_uri'] = obj['access'];
    }
}

// NOTE: birth_date field
if (source[0]['birth_date'] === undefined) {
    for (var obj of source) {
        obj['birth_date'] = obj['artist_period'].split('-')[0];
    }
}

// NOTE: death_date field
if (source[0]['death_date'] === undefined) {
    for (var obj of source) {
        obj['death_date'] = obj['artist_period'].split('-')[1];
    }
}

// NOTE: nationality_URI field
if (source[0]['nationality_URI'] === undefined) {
    for (var obj of source) {
        obj['nationality_URI'] = obj['nationality'];
    }
}

// NOTE: artist_appellation_uri field
if (source[0]['artist_appellation_uri'] === undefined) {
    for (var obj of source) {
        obj['artist_appellation_uri'] = obj['artist'];
    }
}

fs.writeFileSync(output_path, JSON.stringify(source, null, 4));

console.log('... end of processing of s24-s-norton-simon.json.\n\n');

/**
 *
 * s25-s-oakland-museum-paintings.json-- Original file: JSON
 *
 **/

console.log('\nProcessing s25-s-oakland-museum-paintings.json...\n');

var source_path = 'data/taheriyan2016/' + data_folder + '/sources/original_json/s25-s-oakland-museum-paintings.json';
var output_path = 'data/taheriyan2016/' + data_folder + '/sources/updated_json/s25-s-oakland-museum-paintings.json';
var source = JSON.parse(fs.readFileSync(source_path, 'utf-8'));

// NOTE: Artist_URI field
if (source[0]['Artist_URI'] === undefined) {
    for (var obj of source) {
        obj['Artist_URI'] = obj['ArtistName'];
    }
}

// NOTE: Object_uri field
if (source[0]['Object_uri'] === undefined) {
    for (var obj of source) {
        obj['Object_uri'] = obj['Accession_id'];
    }
}

// NOTE: BirthDate field
if (source[0]['BirthDate'] === undefined) {
    for (var obj of source) {
        obj['BirthDate'] = obj['BirthDeathDate'].split('-')[0];
    }
}

// NOTE: DeathDate field
if (source[0]['DeathDate'] === undefined) {
    for (var obj of source) {
        obj['DeathDate'] = obj['BirthDeathDate'].split('-')[1];
    }
}

// NOTE: Subtype_URI field
if (source[0]['Subtype_URI'] === undefined) {
    for (var obj of source) {
        obj['Subtype_URI'] = obj['Subtype_of_Art'];
    }
}

// NOTE: Type_URI field
if (source[0]['Type_URI'] === undefined) {
    for (var obj of source) {
        obj['Type_URI'] = obj['Type_of_Art'];
    }
}

// NOTE: Artist_Appellation_URI field
if (source[0]['Artist_Appellation_URI'] === undefined) {
    for (var obj of source) {
        obj['Artist_Appellation_URI'] = obj['ArtistName'];
    }
}

fs.writeFileSync(output_path, JSON.stringify(source, null, 4));

console.log('... end of processing of s25-s-oakland-museum-paintings.json.\n\n');

/**
 *
 * s26-s-san-francisco-moma-- Original file: JSON
 *
 **/

console.log('\nProcessing s26-s-san-francisco-moma.json...\n');

var source_path = 'data/taheriyan2016/' + data_folder + '/sources/original_json/s26-s-san-francisco-moma.json';
var output_path = 'data/taheriyan2016/' + data_folder + '/sources/updated_json/s26-s-san-francisco-moma.json';
var source = JSON.parse(fs.readFileSync(source_path, 'utf-8'));

source = source['art-works'];

// NOTE: artistURI field
if (source[0]['art-work']['artistURI'] === undefined) {
    for (var obj of source) {
        obj['art-work']['artistURI'] = obj['art-work']['artistName'];
    }
}

// NOTE: Type_URI field
if (source[0]['art-work']['Type_URI'] === undefined) {
    for (var obj of source) {
        obj['art-work']['Type_URI'] = obj['art-work']['type'];
    }
}

// NOTE: nationality_URI field
if (source[0]['art-work']['nationality_URI'] === undefined) {
    for (var obj of source) {
        obj['art-work']['nationality_URI'] = obj['art-work']['nationality'];
    }
}

// NOTE: artistAppellationURI field
if (source[0]['art-work']['artistAppellationURI'] === undefined) {
    for (var obj of source) {
        obj['art-work']['artistAppellationURI'] = obj['art-work']['artistName'];
    }
}

fs.writeFileSync(output_path, JSON.stringify(source, null, 4));

console.log('... end of processing of s26-s-san-francisco-moma.json.\n\n');

/**
 *
 * s27-s-the-huntington.json-- Original file: JSON
 *
 **/

console.log('\nProcessing s27-s-the-huntington.json...\n');

var source_path = 'data/taheriyan2016/' + data_folder + '/sources/original_json/s27-s-the-huntington.json';
var output_path = 'data/taheriyan2016/' + data_folder + '/sources/updated_json/s27-s-the-huntington.json';
var source = JSON.parse(fs.readFileSync(source_path, 'utf-8'));

source = source['drawings'];

// NOTE: artist_URI field
if (source[0]['artist']['artist_URI'] === undefined) {
    for (var obj of source) {
        obj['artist']['artist_URI'] = obj['artist']['name'];
    }
}

// NOTE: object_uri field
if (source[0]['object_uri'] === undefined) {
    for (var obj of source) {
        obj['object_uri'] = obj['object_no'];
    }
}

// NOTE: medium_uri field
if (source[0]['medium_uri'] === undefined) {
    for (var obj of source) {
        obj['medium_uri'] = obj['medium'];
    }
}

// NOTE: Nationality_URI field
if (source[0]['Nationality_URI'] === undefined) {
    for (var obj of source) {
        obj['Nationality_URI'] = obj['nationality'];
    }
}

// NOTE: Nationality_URI field
if (source[0]['artist']['artist_appellation_uri'] === undefined) {
    for (var obj of source) {
        obj['artist']['artist_appellation_uri'] = obj['artist']['name'];
    }
}

fs.writeFileSync(output_path, JSON.stringify(source, null, 4));

console.log('... end of processing of s27-s-the-huntington.json.\n\n');

/**
 *
 * s28-wildlife-art.json-- Original file: CSV
 *
 **/

console.log('\nProcessing s28-wildlife-art.json...\n');

var source_path = 'data/taheriyan2016/' + data_folder + '/sources/original_json/s28-wildlife-art.json';
var output_path = 'data/taheriyan2016/' + data_folder + '/sources/updated_json/s28-wildlife-art.json';
var source = JSON.parse(fs.readFileSync(source_path, 'utf-8'));

// NOTE: Maker_URI field
if (source[0]['Maker_URI'] === undefined) {
    for (var obj of source) {
        obj['Maker_URI'] = obj['Maker'];
    }
}

// NOTE: Object_URI field
if (source[0]['Object_URI'] === undefined) {
    for (var obj of source) {
        obj['Object_URI'] = obj['ID Number'];
    }
}

// NOTE: Maker Birth Date field
if (source[0]['Maker Birth Date'] === undefined) {
    for (var obj of source) {
        var first_split = obj['Maker Bio'].split(', ');
        if (first_split[1] !== undefined) {
            var second_split = first_split[1].split(' - ');
            if (second_split[0] !== undefined) {
                obj['Maker Birth Date'] = second_split[0];
            } else {
                obj['Maker Birth Date'] = '';
            }
        } else {
            obj['Maker Birth Date'] = '';
        }
    }
}

// NOTE: Maker Death Date field
if (source[0]['Maker Death Date'] === undefined) {
    for (var obj of source) {
        var first_split = obj['Maker Bio'].split(', ');
        if (first_split[1] !== undefined) {
            var second_split = first_split[1].split(' - ');
            if (second_split[0] !== undefined) {
                obj['Maker Death Date'] = second_split[1];
            } else {
                obj['Maker Death Date'] = '';
            }
        } else {
            obj['Maker Death Date'] = '';
        }
    }
}

// NOTE: Home Location URI field
if (source[0]['Home Location URI'] === undefined) {
    for (var obj of source) {
        obj['Home Location URI'] = obj['Home Location'];
    }
}

// NOTE: Category_URI field
if (source[0]['Category_URI'] === undefined) {
    for (var obj of source) {
        obj['Category_URI'] = obj['Category'];
    }
}

// NOTE: Materials_URI field
if (source[0]['Materials_URI'] === undefined) {
    for (var obj of source) {
        obj['Materials_URI'] = obj['Materials'];
    }
}

// NOTE: Collector_Information_typeURI
if (source[0]['Collector_Information_typeURI'] === undefined) {
    for (var obj of source) {
        obj['Collector_Information_typeURI'] = obj['Collector'];
    }
}

// NOTE: Nationality_URI
if (source[0]['Nationality_URI'] === undefined) {
    for (var obj of source) {
        obj['Nationality_URI'] = obj['Nationality'];
    }
}

// NOTE: Maker_Appellation_URI
if (source[0]['Maker_Appellation_URI'] === undefined) {
    for (var obj of source) {
        obj['Maker_Appellation_URI'] = obj['Maker'];
    }
}

// NOTE: Acquisition_URI
if (source[0]['Acquisition_URI'] === undefined) {
    for (var obj of source) {
        obj['Acquisition_URI'] = obj['How Acquired?'];
    }
}

fs.writeFileSync(output_path, JSON.stringify(source, null, 4));

console.log('... end of processing of s28-wildlife-art.json.\n\n');

/**
 *
 * s29-gilcrease.json-- Original file: CSV
 *
 **/

console.log('\nProcessing s29-gilcrease.json...\n');

var source_path = 'data/taheriyan2016/' + data_folder + '/sources/original_json/s29-gilcrease.json';
var output_path = 'data/taheriyan2016/' + data_folder + '/sources/updated_json/s29-gilcrease.json';
var source = JSON.parse(fs.readFileSync(source_path, 'utf-8'));

// NOTE: Attribution_URI
if (source[0]['Attribution_URI'] === undefined) {
    for (var obj of source) {
        obj['Attribution_URI'] = obj['Attribution'];
    }
}

// NOTE: Object_URI
if (source[0]['Object_URI'] === undefined) {
    for (var obj of source) {
        obj['Object_URI'] = obj['ObjectID'];
    }
}

// NOTE: Culture_URI
if (source[0]['Culture_URI'] === undefined) {
    for (var obj of source) {
        obj['Culture_URI'] = obj['Culture'];
    }
}

// NOTE: Type_URI
if (source[0]['Type_URI'] === undefined) {
    for (var obj of source) {
        obj['Type_URI'] = obj['Media'];
    }
}

// NOTE: Medium_URI
if (source[0]['Medium_URI'] === undefined) {
    for (var obj of source) {
        obj['Medium_URI'] = obj['Medium'];
    }
}

// NOTE: Attribution_Appellation_URI
if (source[0]['Attribution_Appellation_URI'] === undefined) {
    for (var obj of source) {
        obj['Attribution_Appellation_URI'] = obj['Attribution'];
    }
}

fs.writeFileSync(output_path, JSON.stringify(source, null, 4));

console.log('... end of processing of s29-gilcrease.json.\n\n');