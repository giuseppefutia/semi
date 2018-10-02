var PREFIX = {
    'http://schema.org/': 'schema:',
    'http://www.w3.org/2000/01/rdf-schema#': 'rdfs:',
    'http://purl.org/procurement/public-contracts#': 'pc',
    'http://purl.org/goodrelations/v1#' : 'gr',
    'http://www.w3.org/2002/07/owl#' : 'owl'
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

exports.clean_prefix = clean_prefix;
exports.get_clean_results = get_clean_results;
exports.remove_array_duplicates = remove_array_duplicates;
exports.set_property = set_property;
