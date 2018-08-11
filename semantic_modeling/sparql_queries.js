var CLOSURE_QUERY = (class_node) => {
    return `PREFIX schema: <http://schema.org/>
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            SELECT ?closure_classes WHERE {
                { ${class_node} ?property ?closure_classes.
                    ?closure_classes a rdfs:Class }
                UNION { ?closure_classes ?property ${class_node} .
                     ?closure_classes a rdfs:Class }
            }`;
}

var SUPER_CLASSES_QUERY = (class_node) => {
    return `PREFIX schema: <http://schema.org/>
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            SELECT ?all_super_classes WHERE {
                ${class_node} rdfs:subClassOf ?all_super_classes
            }`;
}

var DIRECT_PROPERTIES_QUERY = (class_u, class_v) => {
    return `PREFIX schema: <http://schema.org/>
            SELECT ?direct_properties WHERE {
                ${class_u} ?direct_properties ${class_v}
            }`;
}

var INHERITED_PROPERTIES_QUERY = (c_u, c_v, p_domain, p_range) => {
    // I need to specify also p_range and p_domain, because they can differ between ontologies
    // I use this function also for inverse inherited properties
    return `PREFIX schema: <http://schema.org/>
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            SELECT ?inherited_properties ?domain WHERE {
                ?inherited_properties ${p_domain} ${c_u} .
                ?inherited_properties ${p_range} ${c_v} .
            }`;
}

exports.CLOSURE_QUERY = CLOSURE_QUERY;
exports.SUPER_CLASSES_QUERY = SUPER_CLASSES_QUERY;
exports.DIRECT_PROPERTIES_QUERY = DIRECT_PROPERTIES_QUERY;
exports.INHERITED_PROPERTIES_QUERY = INHERITED_PROPERTIES_QUERY;
