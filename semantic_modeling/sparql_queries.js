var utils = require(__dirname + '/utils.js');

var CLOSURE_QUERY = (class_node, ontology_class) => {
    return utils.get_prefix_strings() + `
           SELECT DISTINCT ?closures WHERE {
                {
                    ?property rdfs:domain ${class_node} .
                    ?property rdfs:range ?closures .
                    ?closures a ${ontology_class}
                }

                UNION {
                    ?property rdfs:domain ?closures .
                    ?property rdfs:range ${class_node} .
                    ?closures a ${ontology_class}
                }
            }`;
}

var SUPER_CLASSES_QUERY = (class_node) => {
    return utils.get_prefix_strings() + `
            SELECT ?all_super_classes WHERE {
                ${class_node} rdfs:subClassOf ?all_super_classes
            }`;
}

var DIRECT_PROPERTIES_QUERY = (c_u, c_v, p_domain, p_range) => {
    // p_range and p_domain can change according to ontologies
    return utils.get_prefix_strings() + `
            SELECT ?direct_properties WHERE {
                ?direct_properties ${p_domain} ${c_u} .
                ?direct_properties ${p_range} ${c_v} .
            }`;
}

var INHERITED_PROPERTIES_QUERY = (c_u, c_v, p_domain, p_range) => {
    return utils.get_prefix_strings() + `
            SELECT ?inherited_properties ?domain WHERE {
                ?inherited_properties ${p_domain} ${c_u} .
                ?inherited_properties ${p_range} ${c_v} .
            }`;
}

exports.CLOSURE_QUERY = CLOSURE_QUERY;
exports.SUPER_CLASSES_QUERY = SUPER_CLASSES_QUERY;
exports.DIRECT_PROPERTIES_QUERY = DIRECT_PROPERTIES_QUERY;
exports.INHERITED_PROPERTIES_QUERY = INHERITED_PROPERTIES_QUERY;