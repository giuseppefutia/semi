var fs = require('fs');
var utils = require(__dirname + '/utils.js');

var JARQL = 'jarql:';
var JARQL_ROOT = JARQL + 'root';

// TODO Create an iterative call for deep jsons (and related deep semantic types) --> Maybe using keys?

var write_triple = (subject, predicate, object) => {
    return '    ' + subject + ' ' + predicate + ' ' + object + '.\n';
}

var write_bind = (base_uri, attribute_value, reference_entity) => {
    return '    BIND (URI(CONCAT(\'' + base_uri + '\',' + attribute_value + ')) as ' + reference_entity + ')\n';
}

var build_prefix = () => {
    return utils.get_prefix_strings() + '\n' + 'PREFIX jarql:     <http://jarql.com/>' + '\n\n'.toString();
}

/**
 * INIT OF CONSTRUCT SECTION
 */
var build_construct = (st, steiner) => {
    var body = '';
    var initial = 'CONSTRUCT {\n';
    var final = '}\n';
    var attributes = st.attributes;
    var entities = st.entities;
    var semantic_types = st.semantic_types;
    for (var i in attributes) {
        var ont_class = semantic_types[i][0].split('***')[0]; // XXX Pay attention to the index 0 of semantic types
        var ont_property = semantic_types[i][0].split('***')[1];
        var subject = '?' + ont_class.split(':')[1] + entities[i]; // I do not need the class of the semantic type, so I split on :
        var predicate = ont_property;
        var object = '?' + attributes[i];
        body += write_triple(subject, predicate, object);
    }
    body += create_semantic_relations(steiner);
    return initial + body + final;
}

var create_semantic_relations = (steiner) => {
    var body = '';
    var nodes = steiner.nodes;
    var edges = steiner.edges;
    for (var i in edges) {
        if (edges[i].value.type !== 'st_property_uri') { // Semantic types are already managed
            var label = edges[i].value.label;
            if (label.indexOf('inverted') === -1) {
                body += write_triple('?' + edges[i].v.split(':')[1], edges[i].value.label, '?' + edges[i].w.split(':')[1]);
            } else {
                body += write_triple('?' + edges[i].w.split(':')[1], edges[i].value.label.split('***')[0], '?' + edges[i].v.split(':')[1]);
            }
        }
    }
    return body;
}

/**
 * END OF CONSTRUCT SECTION
 */

/**
 * INIT OF WHERE SECTION
 */

var build_where_triples = (st) => {
    var body = '';
    var attributes = st.attributes;
    for (var i in attributes) {
        // For know I check only one level of the tree in semantic types
        if (attributes[i].split('__')[1] !== undefined) {
            var father = attributes[i].split('__')[0];
            var child = attributes[i].split('__')[1];
            var subject0 = JARQL_ROOT;
            var predicate0 = JARQL + father;
            var object0 = '?' + father;
            body += write_triple(subject0, predicate0, object0);
            var subject1 = object0;
            var predicate1 = JARQL + child;
            var object1 = '?' + attributes[i];
            body += write_triple(subject1, predicate1, object1);
        } else {
            var subject = JARQL_ROOT;
            var predicate = JARQL + attributes[i];
            var object = '?' + attributes[i];
            body += write_triple(subject, predicate, object);
        }
    }
    return body;
}

var build_where_bindings = (st) => {
    var body = '';
    var instances_uris = utils.get_instance_uris();
    var attributes = st.attributes;
    var entities = st.entities;
    var semantic_types = st.semantic_types;
    var uris = st.uris;
    var binded = {};
    for (var i in attributes) {
        var ont_class = semantic_types[i][0].split('***')[0]; // XXX Pay attention to the index 0 of semantic types
        var reference_entity = '?' + ont_class.split(':')[1] + entities[i]; // I do not need the class of the semantic type, so I split on :
        if (uris[i] === true && binded[reference_entity] === undefined) {
            binded[reference_entity] = 1;
            var base_uri = instances_uris[semantic_types[i][0].split('***')[0]]; // Check if this splitter is ok
            var attribute_value = '?' + attributes[i];
            // reference entity should be equal to the subject defined in the construct section
            var bind = write_bind(base_uri, attribute_value, reference_entity);
            body += bind;
        }
    }
    return body;
}

var build_where = (st) => {
    var body = ''
    var initial = 'WHERE {\n';
    var final = '}';
    var triples = build_where_triples(st);
    var bindings = build_where_bindings(st);
    return initial + triples + bindings + final;
}
/**
 * END OF WHERE SECTION
 */

var build_jarql = (semantic_types, steiner_tree) => {
    var prefix_section = build_prefix().replace(/^ +/gm, ''); // Remove white space at each line
    var construct_section = build_construct(semantic_types, steiner_tree);
    var where_section = build_where(semantic_types);
    var jarql_string = prefix_section + construct_section + where_section;
    return jarql_string;
}

// Export for testing
exports.build_prefix = build_prefix;
exports.build_construct = build_construct;
exports.build_where_triples = build_where_triples;
exports.build_where_bindings = build_where_bindings;
exports.build_where = build_where;
exports.build_jarql = build_jarql;