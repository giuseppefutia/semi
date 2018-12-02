var fs = require('fs');
var assert = require('assert');
var jarql = require(__dirname + '/../../semantic_modeling/jarql.js');

describe('Test JARQL', function() {
    var st = JSON.parse(fs.readFileSync(__dirname + '/public-contracts_semantic_types.json'))[0];
    var steiner_tree = JSON.parse(fs.readFileSync(__dirname + '/Z4ADEA9DE4_steiner.json'));

    describe('Build CONSTRUCT section for semantic types', function() {
        var construct_test = `
            CONSTRUCT {
                ?Contract0 dcterms:identifier ?cig.
                ?Contract0 rdfs:description ?oggetto.
                ?BusinessEntity0 dcterms:identifier ?strutturaProponente__codiceFiscaleProp.
                ?BusinessEntity1 dcterms:identifier ?partecipanti__identificativo.
                ?BusinessEntity1 rdfs:label ?partecipanti__ragioneSociale.
                ?BusinessEntity1 dcterms:identifier ?aggiudicatari__identificativo.
                ?BusinessEntity1 rdfs:label ?aggiudicatari__ragioneSociale.
                pc:Contract0 pc:contractingAuthority gr:BusinessEntity0.
                pc:Contract0 pc:contractingAuthority gr:BusinessEntity1.
            }`;
        var construct = jarql.build_construct(st, steiner_tree);
        it('construct and construct_test are equal', function() {
            // In the test I remove all white spaces for a correct step
            assert.deepEqual(construct.replace(/\s/g, ''), construct_test.replace(/\s/g, ''));
        });
    });

    describe('Build WHERE section for semantic types', function() {
        var where_test = `
            WHERE {
                jarql:root jarql:cig ?cig.
                jarql:root jarql:oggetto ?oggetto.
                jarql:root jarql:strutturaProponente ?strutturaProponente.
                ?strutturaProponente jarql:codiceFiscaleProp ?strutturaProponente__codiceFiscaleProp.
                jarql:root jarql:partecipanti ?partecipanti.
                ?partecipanti jarql:identificativo ?partecipanti__identificativo.
                jarql:root jarql:partecipanti ?partecipanti.
                ?partecipanti jarql:ragioneSociale ?partecipanti__ragioneSociale.
                jarql:root jarql:aggiudicatari ?aggiudicatari.
                ?aggiudicatari jarql:identificativo ?aggiudicatari__identificativo.
                jarql:root jarql:aggiudicatari ?aggiudicatari.
                ?aggiudicatari jarql:ragioneSociale ?aggiudicatari__ragioneSociale.
                BIND (URI(CONCAT('http://pc.org/contracts/',?cig)) as ?Contract0)
                BIND (URI(CONCAT('http://pc.org/businessEntities/',?strutturaProponente__codiceFiscaleProp)) as ?BusinessEntity0)
                BIND (URI(CONCAT('http://pc.org/businessEntities/',?partecipanti__identificativo)) as ?BusinessEntity1)
            }`;
        var where = jarql.build_where(st);
        it('where and where_test are equal', function() {
            assert.deepEqual(where.replace(/\s/g, ''), where_test.replace(/\s/g, ''));
        });
    });

    describe('Build WHERE triples section for semantic types', function() {
        var where_test = `
            jarql:root jarql:cig ?cig.
            jarql:root jarql:oggetto ?oggetto.
            jarql:root jarql:strutturaProponente ?strutturaProponente.
            ?strutturaProponente jarql:codiceFiscaleProp ?strutturaProponente__codiceFiscaleProp.
            jarql:root jarql:partecipanti ?partecipanti.
            ?partecipanti jarql:identificativo ?partecipanti__identificativo.
            jarql:root jarql:partecipanti ?partecipanti.
            ?partecipanti jarql:ragioneSociale ?partecipanti__ragioneSociale.
            jarql:root jarql:aggiudicatari ?aggiudicatari.
            ?aggiudicatari jarql:identificativo ?aggiudicatari__identificativo.
            jarql:root jarql:aggiudicatari ?aggiudicatari.
            ?aggiudicatari jarql:ragioneSociale ?aggiudicatari__ragioneSociale.
            `;
        var where = jarql.build_where_triples(st);
        it('where and where_test are equal', function() {
            assert.deepEqual(where.replace(/\s/g, ''), where_test.replace(/\s/g, ''));
        });
    });

    describe('Build WHERE bindings section for semantic types', function() {
        var where_test = `
            BIND (URI(CONCAT('http://pc.org/contracts/',?cig)) as ?Contract0)
            BIND (URI(CONCAT('http://pc.org/businessEntities/',?strutturaProponente__codiceFiscaleProp)) as ?BusinessEntity0)
            BIND (URI(CONCAT('http://pc.org/businessEntities/',?partecipanti__identificativo)) as ?BusinessEntity1)
        `;
        var where = jarql.build_where_bindings(st);
        it('where and where_test are equal', function() {
            assert.deepEqual(where.replace(/\s/g, ''), where_test.replace(/\s/g, ''));
        });
    });

    describe('Build JARQL', function() {
        var jarql_test = `
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
            PREFIX jarql: <http://jarql.com/>

            CONSTRUCT {
                ?Contract0 dcterms:identifier ?cig.
                ?Contract0 rdfs:description ?oggetto.
                ?BusinessEntity0 dcterms:identifier ?strutturaProponente__codiceFiscaleProp.
                ?BusinessEntity1 dcterms:identifier ?partecipanti__identificativo.
                ?BusinessEntity1 rdfs:label ?partecipanti__ragioneSociale.
                ?BusinessEntity1 dcterms:identifier ?aggiudicatari__identificativo.
                ?BusinessEntity1 rdfs:label ?aggiudicatari__ragioneSociale.
                pc:Contract0 pc:contractingAuthority gr:BusinessEntity0.
                pc:Contract0 pc:contractingAuthority gr:BusinessEntity1.
            }

            WHERE {
                jarql:root jarql:cig ?cig.
                jarql:root jarql:oggetto ?oggetto.
                jarql:root jarql:strutturaProponente ?strutturaProponente.
                ?strutturaProponente jarql:codiceFiscaleProp ?strutturaProponente__codiceFiscaleProp.
                jarql:root jarql:partecipanti ?partecipanti.
                ?partecipanti jarql:identificativo ?partecipanti__identificativo.
                jarql:root jarql:partecipanti ?partecipanti.
                ?partecipanti jarql:ragioneSociale ?partecipanti__ragioneSociale.
                jarql:root jarql:aggiudicatari ?aggiudicatari.
                ?aggiudicatari jarql:identificativo ?aggiudicatari__identificativo.
                jarql:root jarql:aggiudicatari ?aggiudicatari.
                ?aggiudicatari jarql:ragioneSociale ?aggiudicatari__ragioneSociale.
                BIND (URI(CONCAT('http://pc.org/contracts/',?cig)) as ?Contract0)
                BIND (URI(CONCAT('http://pc.org/businessEntities/',?strutturaProponente__codiceFiscaleProp)) as ?BusinessEntity0)
                BIND (URI(CONCAT('http://pc.org/businessEntities/',?partecipanti__identificativo)) as ?BusinessEntity1)
            }`;
        var jarql_generated = jarql.build_jarql(st, steiner_tree);
        it('jarql and jarql_test are equal', function() {
            assert.deepEqual(jarql_generated.replace(/\s/g, ''), jarql_test.replace(/\s/g, ''));
        });
    });
});