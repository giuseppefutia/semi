const index_rules = {
    'Arezzo': {
        'Note': 'rdf_Description',
        'Titolo': 'gr_BusinessEntity_gr:legalName',
    },
    'Asti': {
        'Nominativo beneficiario': 'gr_BusinessEntity_gr:legalName',
        'Oggetto': 'rdf_Description'
    },
    'Caserta': {
        'Nominativo beneficiario': 'gr_BusinessEntity_gr:legalName',
        'Oggetto': 'rdf_Description'
    },
    'Comune di Balvano_comune.balvano.pz.it_2018-06-02_132418_0_4': {
        'CAUSALE': 'rdf_Description',
        'Cognome': 'gr_BusinessEntity_gr:legalName'
    }
}

module.exports = index_rules;
