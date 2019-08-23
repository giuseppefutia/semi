var fs = require('fs');
var utils = require(__dirname + '/utils.js');

var JARQL = 'jarql:';
var JARQL_ROOT = JARQL + 'root';

// TODO Create an iterative call for deep jsons (and related deep semantic types) --> Maybe using keys?

// XXX Pay attention to this: for now it is a bad choice, but I run jarql.js for each file, so it should
// be enough safe
var closure_entities = [];
var closure_references = [];

var write_triple = (subject, predicate, object) => {
    return '    ' + subject + ' ' + predicate + ' ' + object + '.\n';
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

    // Create semantic_relations
    body += create_semantic_relations(steiner, st_classes, classes);
    return initial + body + final;
}

var create_semantic_relations = (steiner, st_classes, classes) => {
    var semantic_relations = {};
    var body = '';
    var nodes = steiner.nodes;
    var edges = steiner.edges;

    for (var i in edges) {
        if (edges[i].value.type !== 'st_property_uri') { // Semantic types are already managed in build_construct
            var label = edges[i].value.label;
            if (label.indexOf('inverted') === -1) {
                var triple = process_edge_values(edges[i].v, label, edges[i].w, st_classes, classes);
                body += write_triple(triple['subject'], triple['property'], triple['object']);
            } else {
                var subject = '?' + edges[i].w.split(':')[1];
                var triple = process_edge_values(edges[i].w, label.split('***')[0], edges[i].v, st_classes, classes);
                body += write_triple(triple['subject'], triple['property'], triple['object']);
            }
        }
    }
    return body;
}


// TODO: it should be simplified
/**
 * This function is very important, because it need to create entities from closure classes.
 * For semantic types, the algorithm has already created new entities exploiting, the
 * entities [0,1,0] field define in the semantic type file.
 * For the closure classes the algorithm needs to create the entities in an automatic way!
 */
var process_edge_values = (edge_subject, edge_property, edge_object, st_classes, classes) => {
    var triple = {};
    var instances_uris = utils.generate_instance_uris(classes);

    // Check if the subject or the object of the edges are included within
    // semantic types class
    var subject = '?' + edge_subject.split(':')[1];
    var property = edge_property
    var object = '?' + edge_object.split(':')[1];
    var is_subject_st_class = st_classes.indexOf(subject);
    var is_object_st_class = st_classes.indexOf(object);

    // Manage different cases for closure entities
    if (is_subject_st_class !== -1 && is_object_st_class !== -1) {
        // Both entities are semantic st_classes
        // subject and object remain the same
        subject = subject;
        object = object;
    } else if (is_subject_st_class !== -1 && is_object_st_class === -1) {
        // The subject is a semantic type and the object is not
        // Need to check if the object is owl:Thing
        if (object === '?Thing') object = 'owl:Thing';
        else {
            // Get last element of the subject (in other words its index)
            var st_index = subject.slice(-1)
            object = object + st_index;
            closure_entities.push(object);
            closure_references.push(subject);
        }
    } else if (is_subject_st_class === -1 && is_object_st_class !== -1) {
        // The object is a semantic type and the subject is not
        // Get the last element of the object (in other words its index)
        var st_index = object.slice(-1);
        subject = subject + st_index;
        closure_entities.push(subject);
        closure_references.push(object);
        if (object === '?Thing') object = 'owl:Thing';
    } else {
        // Both entities are not semantic types
        var subject_matches = closure_entities.filter(s => s.includes(subject))
        var subject_index = 0;
        for (s in subject_matches) {
            var index = closure_entities.indexOf(subject_matches[s]);
            if (index > subject_index) subject_index = index;
        }
        subject = subject + subject_index;
        if (object === '?Thing') object = 'owl:Thing';
        else {
            var object_matches = closure_entities.filter(s => s.includes(object))
            var object_index = 0;
            for (o in object_matches) {
                var index = closure_entities.indexOf(object_matches[o]);
                if (index > object_index) object_index = index;
                object = object + object_index;
            }
        }
    }
    triple['subject'] = subject;
    triple['property'] = property;
    triple['object'] = object
    return triple;
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
        // TODO: For know I check only one level of the tree in semantic types (father and child)
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

var build_where_bindings = (st, classes) => {
    var body = '';
    var instances_uris = utils.generate_instance_uris(classes);
    var attributes = st.attributes;
    var entities = st.entities;
    var semantic_types = st.semantic_types;
    var uris = st.uris;
    var binded = {};
    var closures_support = [];

    // Binding of semantic types
    for (var i in attributes) {
        var ont_class = semantic_types[i][0].split('***')[0]; // XXX Pay attention to the index 0 of semantic types
        var reference_entity = '?' + ont_class.split(':')[1] + entities[i]; // I do not need the class of the semantic type, so I split on :
        if (uris[i] === true && binded[reference_entity] === undefined) {
            binded[reference_entity] = 1;
            var base_uri = instances_uris[semantic_types[i][0].split('***')[0].split(':')[1]]; // Check if this splitter is ok
            var attribute_value = '?' + attributes[i];
            // Store reference_entity and attribute_value to help the binding of closures
            cl = {};
            cl['reference_entity'] = reference_entity;
            cl['attribute_value'] = attribute_value;
            closures_support.push(cl);
            // Reference entity should be equal to the subject defined in the construct section
            var bind = write_bind(base_uri, attribute_value, reference_entity);
            body += bind;
        }
    }

    // Binding of closure entities
    for (var c in closure_entities) {
        var reference_entity = closure_entities[c];
        var base_uri = instances_uris[reference_entity.substr(1).slice(0, -1)];
        var reference_st = closure_references[c];
        var index = closures_support.map(function(e) {
            return e['reference_entity'];
        }).indexOf(reference_st);
        var attribute_value = closures_support[index]['attribute_value'];
        var bind = write_bind(base_uri, attribute_value, reference_entity);
        body += bind;
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