var fs = require('fs');

var get_prefix = function() {
    return PREFIX;
}

var get_prefix_strings = function() {
    return PREFIX_STRINGS;
}

var clean_prefix = function(uri) {
    for (var p in PREFIX) {
        if (uri.indexOf(p) !== -1)
            uri = uri.replace(p, PREFIX[p]);
    }
    return uri;
}

var get_clean_results = function(results, variable) {
    var r = [];
    for (var c in results) {
        var query_result = results[c][variable]['value'];
        query_result = clean_prefix(query_result);
        r.push(query_result);
    }
    return r;
}

var remove_array_duplicates = function(a) {
    for (var i = 0; i < a.length; ++i) {
        for (var j = i + 1; j < a.length; ++j) {
            if (a[i] === a[j])
                a.splice(j--, 1);
        }
    }
    return a;
}

var set_property = function(subject, property, object, type) {
    var o = {
        'subject': subject,
        'property': property,
        'object': object,
        'type': type
    }
    return o;
}

var generate_prefix_string = () => {
    prefix = PREFIX;
    var prefix_arr = Object.keys(prefix).map(function(k) {
        var white_space_length = 10 - prefix[k].length;
        var white_space = ' '
        for (var i = 0; i < white_space_length; i++) {
            white_space += ' ';
        }
        return 'PREFIX ' + prefix[k] + white_space + '<' + k + '>' + '\n'
    });

    var prefix_str =
        `${prefix_arr.join('_**_').split('_**_').map((item) => `${item}`).join('')}`
    return prefix_str;
}

var generate_instance_uris = (all_classes) => {

    var instances_uris = {};
    var classes = JSON.parse(fs.readFileSync(all_classes, 'utf8'))['all_classes'];
    for (var c in classes) {
        // Get the prefix to build the URIS of entities
        var value = classes[c].split(':')[0] + ':';
        var middle_uri = classes[c].split(':')[1].toLowerCase() + '/';
        var key = Object.keys(PREFIX).find(key => PREFIX[key] === value).replace('#', '');
        var basic_uri = key + '/' + middle_uri;
        instances_uris[classes[c].split(':')[1]] = basic_uri;
    }
    return instances_uris;
}

var PREFIX = {
    'http://schema.org/': 'schema:',
    'http://www.w3.org/2000/01/rdf-schema#': 'rdfs:',
    'http://purl.org/procurement/public-contracts#': 'pc:',
    'http://purl.org/goodrelations/v1#': 'gr:',
    'http://www.w3.org/2002/07/owl#': 'owl:',
    'http://www.w3.org/ns/adms#': 'adms:',
    'http://vocab.deri.ie/c4n#': 'c4n:',
    'http://purl.org/dc/terms/': 'dcterms:',
    'http://xmlns.com/foaf/0.1/': 'foaf:',
    'http://www.loted.eu/ontology#': 'loted:',
    'http://reference.data.gov.uk/def/payment#': 'payment:',
    'http://purl.org/linked-data/cube#': 'qb:',
    'http://www.w3.org/1999/02/22-rdf-syntax-ns#': 'rdf:',
    'http://www.w3.org/2004/02/skos/core#': 'skos:',
    'http://purl.org/vocab/vann/': 'vann:',
    'http://www.w3.org/2001/XMLSchema#': 'xsd:',
    'http://www.w3.org/2002/07/owl#': 'owl:',
    'http://conference#': 'conference:',
    'http://cmt#': 'cmt:',
    'http://sigkdd#': 'sigkdd:',
    'http://erlangen-crm.org/current/': 'crm:',
    'http://collection.britishmuseum.org/id/': 'id:',
    'http://collection.britishmuseum.org/id/thesauri/': 'idThes:',
    'http://www.w3.org/ns/prov#': 'prov:',
    'http://collection.britishmuseum.org/id/ontology/': 'bmo:',
    'http://www.americanartcollaborative.org/ontology/': 'aac-ont:',
    'http://www.w3.org/2008/05/skos#': 'skos2:',
    'http://rdvocab.info/ElementsGr2/': 'ElementsGr2:',
    'http://rdvocab.info/uri/schema/FRBRentitiesRDA/': 'rdvocab-schema:',
    'http://www.europeana.eu/schemas/edm/': 'edm:',
    'http://schema.dig.isi.edu/ontology/': 'schema-dig:',
    'http://www.w3.org/2003/01/geo/wgs84_pos#': 'geo:',
    'http://purl.org/vocab/frbr/core#': 'frbr:',
    'http://www.w3.org/2000/10/swap/pim/contact#': 'swap:',
    'http://www.cidoc-crm.org/rdfs/cidoc-crm#': 'cidoc-crm:',
    'http://metadata.net/harmony/abc#': 'abc:',
    'http://www.loa-cnr.it/ontologies/DOLCE-Lite.owl#': 'DOLCE-Lite:',
    'http://purl.org/dc/dcmitype/': 'dcmitype:',
    'http://web.resource.org/cc/': 'msg0:',
    'http://www.isi.edu/~pan/damltime/time-entry.owl#': 'time-entry:',
    'http://xmlns.com/wordnet/1.6/Work~2': 'wordnet:',
    'http://americanart.si.edu/ontology/': 'saam-ont:',
    'http://www.openarchives.org/ore/terms/': 'ore:',
    'http://scharp.usc.isi.edu/ontology/': 'scharp:',
    'http://dig.isi.edu/ontology/memex/': 'memex:',
    'http://purl.org/dc/elements/1.1/': 'dc:'
}

var PREFIX_STRINGS = generate_prefix_string();

exports.get_prefix = get_prefix;
exports.get_prefix_strings = get_prefix_strings;
exports.generate_instance_uris = generate_instance_uris;
exports.clean_prefix = clean_prefix;
exports.get_clean_results = get_clean_results;
exports.remove_array_duplicates = remove_array_duplicates;
exports.set_property = set_property;