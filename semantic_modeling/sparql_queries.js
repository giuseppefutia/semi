// TODO These prefixes and the other mentioned in utils.js should be defined in a configuration file

var CLOSURE_QUERY = (class_node, ontology_class) => {
    return `
            PREFIX schema:    <http://schema.org/>
            PREFIX rdfs:      <http://www.w3.org/2000/01/rdf-schema#>
            PREFIX pc:        <http://purl.org/procurement/public-contracts#>
            PREFIX gr:        <http://purl.org/goodrelations/v1#>
            PREFIX owl:       <http://www.w3.org/2002/07/owl#>
            PREFIX adms:      <http://www.w3.org/ns/adms#>
            PREFIX c4n:       <http://vocab.deri.ie/c4n#>
            PREFIX dcterms:   <http://purl.org/dc/terms/>
            PREFIX foaf:      <http://xmlns.com/foaf/0.1/>
            PREFIX loted:     <http://www.loted.eu/ontology#>
            PREFIX payment:   <http://reference.data.gov.uk/def/payment#>
            PREFIX qb:        <http://purl.org/linked-data/cube#>
            PREFIX rdf:       <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX skos:      <http://www.w3.org/2004/02/skos/core#>
            PREFIX vann:      <http://purl.org/vocab/vann/>
            PREFIX xsd:       <http://www.w3.org/2001/XMLSchema#>
            PREFIX owl:       <http://www.w3.org/2002/07/owl#>
            SELECT DISTINCT ?closures WHERE {
                {
                    ?property rdfs:domain ${class_node} .
                    ?property rdfs:range ?closure .
                    ?closures a ${ontology_class}
                }

                UNION {
                    ?property rdfs:domain ?closure .
                    ?property rdfs:range ${class_node} .
                    ?closures a ${ontology_class}
                }
            }`;
}

var SUPER_CLASSES_QUERY = (class_node) => {
    return `
            PREFIX schema:    <http://schema.org/>
            PREFIX rdfs:      <http://www.w3.org/2000/01/rdf-schema#>
            PREFIX pc:        <http://purl.org/procurement/public-contracts#>
            PREFIX gr:        <http://purl.org/goodrelations/v1#>
            PREFIX owl:       <http://www.w3.org/2002/07/owl#>
            PREFIX adms:      <http://www.w3.org/ns/adms#>
            PREFIX c4n:       <http://vocab.deri.ie/c4n#>
            PREFIX dcterms:   <http://purl.org/dc/terms/>
            PREFIX foaf:      <http://xmlns.com/foaf/0.1/>
            PREFIX loted:     <http://www.loted.eu/ontology#>
            PREFIX payment:   <http://reference.data.gov.uk/def/payment#>
            PREFIX qb:        <http://purl.org/linked-data/cube#>
            PREFIX rdf:       <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX skos:      <http://www.w3.org/2004/02/skos/core#>
            PREFIX vann:      <http://purl.org/vocab/vann/>
            PREFIX xsd:       <http://www.w3.org/2001/XMLSchema#>
            SELECT ?all_super_classes WHERE {
                ${class_node} rdfs:subClassOf ?all_super_classes
            }`;
}

var DIRECT_PROPERTIES_QUERY = (c_u, c_v, p_domain, p_range) => {
    // I need to specify also p_range and p_domain, because they can differ between ontologies
    // I use this function also for inverse direct properties
    return `
            PREFIX schema:    <http://schema.org/>
            PREFIX rdfs:      <http://www.w3.org/2000/01/rdf-schema#>
            PREFIX pc:        <http://purl.org/procurement/public-contracts#>
            PREFIX gr:        <http://purl.org/goodrelations/v1#>
            PREFIX owl:       <http://www.w3.org/2002/07/owl#>
            PREFIX adms:      <http://www.w3.org/ns/adms#>
            PREFIX c4n:       <http://vocab.deri.ie/c4n#>
            PREFIX dcterms:   <http://purl.org/dc/terms/>
            PREFIX foaf:      <http://xmlns.com/foaf/0.1/>
            PREFIX loted:     <http://www.loted.eu/ontology#>
            PREFIX payment:   <http://reference.data.gov.uk/def/payment#>
            PREFIX qb:        <http://purl.org/linked-data/cube#>
            PREFIX rdf:       <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX skos:      <http://www.w3.org/2004/02/skos/core#>
            PREFIX vann:      <http://purl.org/vocab/vann/>
            PREFIX xsd:       <http://www.w3.org/2001/XMLSchema#>
            SELECT ?direct_properties WHERE {
                ?direct_properties ${p_domain} ${c_u} .
                ?direct_properties ${p_range} ${c_v} .
            }`;
}

var INHERITED_PROPERTIES_QUERY = (c_u, c_v, p_domain, p_range) => {
    // I need to specify also p_range and p_domain, because they can differ between ontologies
    // I use this function also for inverse inherited properties
    return `
            PREFIX schema:    <http://schema.org/>
            PREFIX rdfs:      <http://www.w3.org/2000/01/rdf-schema#>
            PREFIX pc:        <http://purl.org/procurement/public-contracts#>
            PREFIX gr:        <http://purl.org/goodrelations/v1#>
            PREFIX owl:       <http://www.w3.org/2002/07/owl#>
            PREFIX adms:      <http://www.w3.org/ns/adms#>
            PREFIX c4n:       <http://vocab.deri.ie/c4n#>
            PREFIX dcterms:   <http://purl.org/dc/terms/>
            PREFIX foaf:      <http://xmlns.com/foaf/0.1/>
            PREFIX loted:     <http://www.loted.eu/ontology#>
            PREFIX payment:   <http://reference.data.gov.uk/def/payment#>
            PREFIX qb:        <http://purl.org/linked-data/cube#>
            PREFIX rdf:       <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX skos:      <http://www.w3.org/2004/02/skos/core#>
            PREFIX vann:      <http://purl.org/vocab/vann/>
            PREFIX xsd:       <http://www.w3.org/2001/XMLSchema#>
            SELECT ?inherited_properties ?domain WHERE {
                ?inherited_properties ${p_domain} ${c_u} .
                ?inherited_properties ${p_range} ${c_v} .
            }`;
}

exports.CLOSURE_QUERY = CLOSURE_QUERY;
exports.SUPER_CLASSES_QUERY = SUPER_CLASSES_QUERY;
exports.DIRECT_PROPERTIES_QUERY = DIRECT_PROPERTIES_QUERY;
exports.INHERITED_PROPERTIES_QUERY = INHERITED_PROPERTIES_QUERY;
