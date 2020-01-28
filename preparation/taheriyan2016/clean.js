var fs = require('fs');
var utils = require('./clean_utils.js');
var task = process.argv.slice(2)[0];

var source_folder = 'data/taheriyan2016/' + task + '/sources/original_json/';
var output_folder = 'data/taheriyan2016/' + task + '/sources/updated_json/';
var st_folder = 'data/taheriyan2016/' + task + '/semantic_types/auto/';
var st_output_folder = 'data/taheriyan2016/' + task + '/semantic_types/updated/';

var sources = fs.readdirSync(source_folder);
var sts = fs.readdirSync(st_folder);

// Updates on sources and semantic types

var clean_brackets = (source_name, source) => {
    // Manage anomalies
    if (source_name === 's16-s-hammer.json') {
        source = source['collections']['collection'];
        console.log('   Anomaly case in the source');
        return source;
    } else if (source_name === 's18-s-indianapolis-artists.json') {
        source = source['artists']['artist'];
        console.log('   Anomaly case in the source');
        return source;
    } else if (source_name === 's19-s-indianapolis-artworks.json') {
        source = source['artworks']['artwork'];
        console.log('   Anomaly case in the source');
        return source;
    } else if (source_name === 's27-s-the-huntington.json') {
        source = source['drawings'];
        console.log('   Anomaly case in the source');
        return source;
    }

    var external_key = Object.keys(source)[0];
    var internal_key = Object.keys(source[external_key])[0];
    if (internal_key == 0) {
        // Less deep object
        source = source[external_key];
    } else {
        // More deep object
        source = source[external_key][internal_key];
    }
    return source;
}

var create_uri_field = (source_name, source, field, uri_field) => {

    // Manage anomalies in adding URIs

    // Anomaly
    if (source_name === 's16-s-hammer.json') {
        for (var obj of source) {
            for (var item of obj['item']) {
                item[uri_field] = item[field];
            }
        }
        console.log('\n   Add new field: ' + uri_field + ' \n   Get value from ' + field + ' field');
        return;
    }
    // Anomaly
    else if (source_name === 's26-s-san-francisco-moma.json') {
        for (var obj of source) {
            obj['art-work'][uri_field] = obj['art-work'][field];
        }
        console.log('\n   Add new field: ' + uri_field + ' \n   Get value from ' + field + ' field');
        return;
    }

    // Default behaviour
    else if (source[0][field] === undefined) return;
    else if (source[0][uri_field] !== undefined) return;
    for (var obj of source) {
        obj[uri_field] = obj[field];
    }
    console.log('\n   Add new field: ' + uri_field + ' \n   Get value from ' + field + ' field');
}

// Need to replace int with string in JSON values, due to JARQL issues
var from_int_to_string = (source, source_name) => {
    // s05-met.json
    if (source_name === 's05-met.json') {
        for (var obj of source) {
            obj['related-artworks'] = obj['related-artworks'].map(i => {
                return i.toString();
            });
        }
    }

    for (var obj in source) {
        if (source[obj] !== undefined) {
            for (var f in source[obj]) {
                if (source[obj][f] !== undefined && source[obj][f] !== null && typeof(source[obj][f]) !== 'object') {
                    source[obj][f] = source[obj][f].toString();
                    source[obj][f] = source[obj][f].replace(/\n/g, ' ');
                    source[obj][f] = source[obj][f].replace(/\r/g, ' ');
                }
            }
        }
    }
}

var special_semantic_types_update = (st_name, st) => {
    // s04-ima-artworks.json
    if (st_name === 's04-ima-artworks.json') {
        var attrs = st[0]['attributes'];
        var new_attrs = attrs.map(i => {
            if (i === 'keyword') {
                return 'keywords__' + i
            } else {
                return i;
            }
        });
        st[0]['attributes'] = new_attrs;
        console.log('\n   Semantic type issue: ');
        console.log('   There is an array in the source: add string "keywords." to the semantic type attributes');
    }
    // s19-s-indianapolis-artworks_st.json
    if (st_name === 's19-s-indianapolis-artworks_st.json') {
        var attrs = st[0]['attributes'];
        var new_attrs = attrs.map(i => {
            if (i === 'keyword') {
                return 'keywords__' + i;
            }
            //
            else if (i === 'relatedArtworksURL') {
                return 'relatedArtworks__' + i;
            }
            //
            else if (i === 'relatedArtworksTitle') {
                return 'relatedArtworks__' + i;
            }
            //
            else {
                return i;
            }
        });
        st[0]['attributes'] = new_attrs;
        console.log('\n   Semantic type issue: ');
    }

    // s16-s-hammer_st.json'
    if (st_name === 's16-s-hammer_st.json') {
        var attrs = st[0]['attributes'];
        var new_attrs = attrs.map(i => {
            if (i === 'name') {
                return i;
            } else {
                return 'item__' + i;
            }
        });
        st[0]['attributes'] = new_attrs;
        console.log('\n   Semantic type issue: ');
        console.log('   There is an array in the source: add string "item." to the semantic type attributes');
    }
    // s26-s-san-francisco-moma_st.json
    else if (st_name === 's26-s-san-francisco-moma_st.json') {
        var attrs = st[0]['attributes'];
        var new_attrs = attrs.map(i => {
            return 'art-work__' + i;
        });
        st[0]['attributes'] = new_attrs;
        console.log('\n   Semantic type issue: ');
        console.log('   There is an array in the source: add string "artwork." to the semantic type attributes');
    }
    // s27-s-the-huntington_st.json
    else if (st_name === 's27-s-the-huntington_st.json') {
        var attrs = st[0]['attributes'];
        new_attrs = attrs.map(i => {
            if (i === 'nationality' || i === 'name' || i === 'birth_date' || i === 'death_date') {
                return 'artist__' + i;
            } else if (i === 'dimensions_inch') {
                return 'dimensions__' + i;
            } else return i;
        });
        st[0]['attributes'] = new_attrs;
        console.log('\n   Semantic type issue');
    }
    // s28-wildlife-art.json
    else if (st_name === 's28-wildlife-art_st.json') {
        var attrs = st[0]['attributes'];
        new_attrs = attrs.map(i => {
            if (i === 'How Acquired?') {
                return 'How Acquired';
            } else return i;
        });
        st[0]['attributes'] = new_attrs;
        console.log('\n   Semantic type issue: replace How Acquired');
    }
}

var replace_classLink = (st) => {
    var semantic_types = st[0]['semantic_types'];
    var to_replace = 'http://isi.edu/integration/karma/dev#classLink';
    st[0]['semantic_types'] = semantic_types.map(i => {
        if (i[0].indexOf(to_replace) !== -1) {
            return [i[0].replace(to_replace, 'rdfs:label')];
        }
        return i;
    });
}

var replace_values = (st, attrs, attr_index, values) => {
    // Replace 'values' in semantic types with the related field in the source
    var field = values
    attrs[attr_index] = field;
    console.log('\n   Replace "values" with: ' + field);
    st[0]['attributes'] = attrs;
}

var clean_task_one = (a, attrs, source_name, source, attr_index, st) => {
    // Include non-trivial semantic type fields in sources
    utils.TASK_01_NEW_FIELDS[source_name].forEach(f => {
        // Anomaly
        if (source_name === 's26-s-san-francisco-moma.json') {
            for (var obj of source) {
                obj['art-work'][Object.keys(f)[0]] = obj['art-work'][Object.values(f)[0]];
            }
        }
        // Anomaly
        else if (source_name === 's16-s-hammer.json') {
            for (var obj of source) {
                for (var item of obj['item']) {
                    item[Object.keys(f)[0]] = item[Object.values(f)[0]];
                }
            }
        }
        // Anomaly
        else if (source_name === 's27-s-the-huntington.json') {
            for (var obj of source) {
                obj['artist_appellation_uri'] = obj['artist']['name'];
                obj['object_uri'] = obj['object_no'];
                obj['Nationality_URI'] = obj['artist']['nationality'];
                obj['artist_URI'] = obj['artist']['name'];
            }
        }
        // Anomaly related to JARQL issues
        else if (source_name === 's28-wildlife-art.json') {
            for (var obj of source) {
                obj['How Acquired'] = obj['How Acquired?'];
            }
        }
        // Default behaviour
        else {
            for (var obj of source) {
                obj[Object.keys(f)[0]] = obj[Object.values(f)[0]];
            }
        }
    });

}

var clean_task_two = (a, attrs, source_name, source, attr_index, st) => {
    // Include non-trivial semantic type fields in sources
    utils.TASK_02_NEW_FIELDS[source_name].forEach(f => {
        // Anomaly
        if (source_name === 's26-s-san-francisco-moma.json') {
            for (var obj of source) {
                obj['art-work'][Object.keys(f)[0]] = obj['art-work'][Object.values(f)[0]];
            }
        }
        // Anomaly
        else if (source_name === 's16-s-hammer.json') {
            for (var obj of source) {
                for (var item of obj['item']) {
                    item[Object.keys(f)[0]] = item[Object.values(f)[0]];
                }
            }
        }
        // Anomaly
        else if (source_name === 's27-s-the-huntington.json') {
            for (var obj of source) {
                obj['Death_URI'] = obj['artist']['death_date'];
                obj['artist_appellation_uri'] = obj['artist']['name'];
                obj['object_uri'] = obj['object_no'];
                obj['Nationality_URI'] = obj['artist']['nationality'];
                obj['Birth_URI'] = obj['artist']['birth_date'];
                obj['artist_URI'] = obj['artist']['name'];
            }
        }
        // Default behaviour
        else {
            for (var obj of source) {
                obj[Object.keys(f)[0]] = obj[Object.values(f)[0]];
            }
        }
    });
}

var clean_task_three = (source_name, st) => {
    // Change uris from false to true
    var attrs = st[0]['attributes'];
    attrs.forEach((a, index) => {
        utils.TASK_03_URIS[source_name].forEach(f => {
            if (a.indexOf(Object.values(f)[0]) !== -1) {
                st[0]['uris'][index] = true;
            } else if (Object.values(f)[0] === 'TODO') {
                st[0]['uris'][index] = true;
            }
        });
    });
}

var clean_task_four = (source_name, st) => {
    // Change uris from false to true
    var attrs = st[0]['attributes'];
    attrs.forEach((a, index) => {
        utils.TASK_04_URIS[source_name].forEach(f => {
            if (a.indexOf(Object.values(f)[0]) !== -1) {
                st[0]['uris'][index] = true;
            } else if (Object.values(f)[0] === 'TODO') {
                console.log('\n    *** WARNING: there is still a TODO');
            }
        });
    });
}

sources.forEach((source_name, index) => {
    var source_path = source_folder + source_name;
    var output_path = output_folder + source_name;
    var st_path = st_folder + sts[index];
    var st_output_path = st_output_folder + sts[index];

    console.log('\nProcessing source: ' + source_name + ' of ' + task + '...');

    if (source_name === 's21-s-met.json') {
        console.log('\n   Skip invalid file: ' + source_name);
        return;
    }
    var source = JSON.parse(fs.readFileSync(source_path, 'utf-8'));

    console.log('\n   Get semantic type: ' + sts[index]);
    var st = JSON.parse(fs.readFileSync(st_path, 'utf-8'));
    var attrs = st[0]['attributes'];

    // Clean redundant brackets
    if (utils.SOURCE_TO_CLEAN_BRACKETS[source_name] !== undefined) {
        console.log('\n   Clean brackets...');
        source = clean_brackets(source_name, source);
    }

    // Get special attributes from the semantic types
    var values_index = 0; // Useful to map "values" field of semantic types to the correct field in the source

    attrs.forEach((a, attr_index) => {

        // Check the following cases : '_uri', ' uri', 'uri'
        if (a.match(/_uri/gi) !== null) {
            var field = a.replace(/_uri/gi, '');
            create_uri_field(source_name, source, field, a);

        } else if (a.match(/ uri/gi) !== null) {
            var field = a.replace(/ uri/gi, '');
            create_uri_field(source_name, source, field, a);

        } else if (a.match(/uri/gi) !== null) {
            var field = a.replace(/uri/gi, '');
            create_uri_field(source_name, source, field, a);
        }

        // Task 01
        if (task === 'task_01') {
            // Check the 'value' cases
            if (a === 'values') {
                values = utils.TASK_01_VALUES[source_name][values_index];
                replace_values(st, attrs, attr_index, values);
                values_index++;
            }
            clean_task_one(a, attrs, source_name, source, attr_index, st);
        }
        // Task 02
        else if (task === 'task_02') {
            // Check the 'value' cases
            if (a === 'values') {
                values = utils.TASK_02_VALUES[source_name][values_index];
                replace_values(st, attrs, attr_index, values);
                values_index++;
            }
            clean_task_two(a, attrs, source_name, source, attr_index, st);
        }
        // Task 03
        else if (task === 'task_03') {
            // Check the 'value' cases
            if (a === 'values') {
                values = utils.TASK_03_VALUES[source_name][values_index];
                replace_values(st, attrs, attr_index, values);
                values_index++;
            }
        }
    });

    // Special cleaning on task_03 data
    if (task === 'task_03') {
        clean_task_three(source_name, st);
    }
    // Special cleaning on task_04 data
    if (task === 'task_04') {
        clean_task_four(source_name, st);
    }

    // Change integer values into strings XXX --> Problem during the JARQL generation
    from_int_to_string(source, source_name);

    // Special updates on semantic types
    special_semantic_types_update(sts[index], st);

    // Replace http://isi.edu/integration/karma/dev#classLink with rdfs:label
    replace_classLink(st);

    // Raise a warning if some values are present
    var values_in_sources = Object.keys(source[0]).filter(i => {
        return i.match(/values/gi);
    });
    if (values_in_sources.length > 0) {
        console.log('\n   *** WARNING: there are still some values in the source ***');
    }

    // Raise a warning message if there is no correspondance in uris in sources and semantic types
    var uri_in_sources = Object.keys(source[0]).filter(i => {
        return i.match(/uri/gi);
    });
    var uri_in_st_attributes = st[0]['attributes'].filter(i => {
        return i.match(/uri/gi);
    });
    if (uri_in_sources.length !== uri_in_st_attributes.length) {
        console.log('\n   *** WARNING: the number of uris is different! ***');
        console.log('   ' + uri_in_sources.length + ' vs ' + uri_in_st_attributes.length);
        console.log('    In source: ' + uri_in_sources.sort())
        console.log('    In semantic type: ' + uri_in_st_attributes.sort())
    }

    // Print updated sources and semantic types
    fs.writeFileSync(output_path, JSON.stringify(source, null, 4));
    fs.writeFileSync(st_output_path, JSON.stringify(st, null, 4));

    console.log('\n... end of processing of ' + source_name + '.\n\n');
});