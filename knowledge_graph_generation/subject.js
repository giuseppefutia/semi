// Some scripts to manage the subjects
// TODO: Should be extended and merged in the pipeline

var basic_uri = 'http://localhost/'

var classes = ['http://www.americanartcollaborative.org/ontology/CulturalHeritageObject',
    'http://www.americanartcollaborative.org/ontology/Person',
    'http://www.w3.org/2008/05/skos#Concept',
    'http://xmlns.com/foaf/0.1/Document',
    'http://www.europeana.eu/schemas/edm/EuropeanaAggregation',
    'http://www.europeana.eu/schemas/edm/WebResource',
    'http://www.americanartcollaborative.org/ontology/Place'
];

var uris = ['cultural_objects/',
    'people/',
    'concepts/',
    'CONST',
    'aggregations/',
    'CONST',
    'places/'
];

var field_for_uris = ['http://purl.org/dc/terms/title',
    'http://rdvocab.info/ElementsGr2/nameOfThePerson',
    'http://www.w3.org/2008/05/skos#prefLabel',
    'http://isi.edu/integration/karma/dev#classLink',
    '',
    'http://isi.edu/integration/karma/dev#classLink',
    'http://www.w3.org/2000/01/rdf-schema#label'
];

exports.basic_uri = basic_uri;
exports.classes = classes;
exports.uris = uris;
exports.field_for_uris = field_for_uris;
