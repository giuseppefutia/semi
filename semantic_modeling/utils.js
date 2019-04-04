var get_prefix_strings = function() {
    return PREFIX_STRINGS;
}

var get_instance_uris = function() {
    return INSTANCE_URIS;
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

var generate_prefix_string = (prefix) => {
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
}

var PREFIX_STRINGS = generate_prefix_string(PREFIX)

var INSTANCE_URIS = {
    'pc:Contract': 'http://pc.org/contracts/',
    'gr:BusinessEntity': 'http://pc.org/businessEntities/'
}

exports.get_prefix_strings = get_prefix_strings;
exports.get_instance_uris = get_instance_uris;
exports.clean_prefix = clean_prefix;
exports.get_clean_results = get_clean_results;
exports.remove_array_duplicates = remove_array_duplicates;
exports.set_property = set_property;