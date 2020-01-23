var fs = require('fs');
var utils = require(__dirname + '/utils.js');

var JARQL = 'jarql:';
var JARQL_ROOT = '?root';

/**
 *
 * Create JARQL representation of semantic types, ignoring semantic relations.
 * TODO: better integration with the original JARQL script
 *
 */

var write_triple = (subject, predicate, object) => {
    return '    ' + subject + ' ' + predicate + ' ' + object + '.\n';
}

var write_optional_triple = (subject, predicate, object) => {
    return '    OPTIONAL { ' + subject + ' ' + predicate + ' ' + object + '. }\n';
}

var write_bind = (base_uri, attribute_value, reference_entity) => {
    return '    BIND (URI(CONCAT(\'' + base_uri + '\',' + attribute_value + ')) as ' + reference_entity + ')\n';
}

var build_prefix = () => {
    return utils.get_prefix_strings() + 'PREFIX jarql:     <http://jarql.com/>' + '\n\n'.toString();
}

/**
 * INIT OF CONSTRUCT SECTION
 */
var build_construct = (st, steiner, classes) => {
    var construct = {};
    var body = '';
    var initial = 'CONSTRUCT {\n';
    var final = '}\n';
    var attributes = st.attributes;
    var entities = st.entities;
    var semantic_types = st.semantic_types;

    // st_classes will contain classes of semantic types
    var st_classes = [];

    // Create semantic types
    for (var i in attributes) {
        var ont_class = semantic_types[i][0].split('***')[0]; // XXX Pay attention to the index 0 of semantic types
        var ont_property = semantic_types[i][0].split('***')[1];
        var subject = '?' + ont_class.split(':')[1] + entities[i]; // I do not need the class of the semantic type, so I split on :
        var predicate = ont_property;
        var object = '?' + attributes[i];
        body += write_triple(subject, predicate, object);
        body += write_triple(subject, 'rdf:type', ont_class);
        st_classes.push(subject);
    }

    return initial + body + final;
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
    body += write_triple('?root', 'a', 'jarql:Root')
    for (var i in attributes) {
        // TODO: For know I check only one level of the tree in semantic types (father and child)
        if (attributes[i].split('__')[1] !== undefined) {
            var father = attributes[i].split('__')[0];
            var child = attributes[i].split('__')[1];
            var subject0 = JARQL_ROOT;
            var predicate0 = JARQL + father;
            var object0 = '?' + father;
            body += write_optional_triple(subject0, predicate0, object0);
            var subject1 = object0;
            var predicate1 = JARQL + child;
            var object1 = '?' + attributes[i];
            body += write_optional_triple(subject1, predicate1, object1);
        } else {
            var subject = JARQL_ROOT;
            var predicate = JARQL + attributes[i];
            var object = '?' + attributes[i];
            body += write_optional_triple(subject, predicate, object);
        }
    }
    return body;
}

var build_where_bindings = (st, classes) => {
    var body = '';
    var instances_uris = utils.generate_instance_uris(classes);
    var attributes = st.attributes;
    var entities = st.entities;
    var semantic_types = st.semantic_types;
    var uris = st.uris;
    var binded = {};

    // Binding of semantic types
    for (var i in attributes) {
        var ont_class = semantic_types[i][0].split('***')[0]; // XXX Pay attention to the index 0 of semantic types
        var reference_entity = '?' + ont_class.split(':')[1] + entities[i]; // I do not need the class of the semantic type, so I split on :
        if (uris[i] === true && binded[reference_entity] === undefined) {
            binded[reference_entity] = 1;
            var base_uri = instances_uris[semantic_types[i][0].split('***')[0].split(':')[1]]; // Check if this splitter is ok
            var attribute_value = '?' + attributes[i];

            // XXX Special case in which attribute values are linked to thi Thing
            if (base_uri === undefined) {
                base_uri = 'http://subclass_of_thing/';
            }

            // Reference entity should be equal to the subject defined in the construct section
            var bind = write_bind(base_uri, attribute_value, reference_entity);
            body += bind;
        }
    }
    return body;
}

var build_where = (st, cl) => {
    var body = ''
    var initial = 'WHERE {\n';
    var final = '}';
    var triples = build_where_triples(st);
    var bindings = build_where_bindings(st, cl);
    return initial + triples + bindings + final;
}
/**
 * END OF WHERE SECTION
 */

var build_jarql = (semantic_types, steiner_tree, classes) => {
    var closure_entities = [];
    var closure_references = [];
    var prefix_section = build_prefix().replace(/^ +/gm, ''); // Remove white space at each line
    var construct_section = build_construct(semantic_types, steiner_tree, classes);
    var where_section = build_where(semantic_types, classes);
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