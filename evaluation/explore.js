// These scripts are used to explore evaluation datasets
var fs = require('fs');

var show_internal_nodes = (path_dir) => {
    var internal_nodes = {};
    fs.readdir(path_dir, function(err, items) {
        if (err) console.log(err);
        for (var i in items) {
            var data = JSON.parse(fs.readFileSync(path_dir + '/' + items[i], 'utf8'));
            var nodes = data['graph']['nodes'];
            for (var n in nodes) {
                if (nodes[n]['type'] === 'InternalNode') {
                    if (internal_nodes[nodes[n]['label']['uri']] === undefined)
                        internal_nodes[nodes[n]['label']['uri']] = 1;
                    else internal_nodes[nodes[n]['label']['uri']]++;
                }
            }
        }
        console.log('Internal nodes');
        console.log(internal_nodes);
        console.log('\n')
        fs.writeFileSync('internal_nodes.json', JSON.stringify(internal_nodes, null, 4));
    });
}

var show_internal_nodes_type = (path_dir, domain_uri) => {
    var types = {}
    fs.readdir(path_dir, function(err, items) {
        for (var i in items) {
            var data = JSON.parse(fs.readFileSync(path_dir + '/' + items[i], 'utf8'));
            var nodes = data['graph']['nodes'];
            for (var n in nodes) {
                if (nodes[n]['type'] === 'ColumnNode') {
                    if (nodes[n]['userSemanticTypes'][0]['domain']['uri'] === domain_uri) {
                        if (types[nodes[n]['userSemanticTypes'][0]['type']['uri']] === undefined)
                            types[nodes[n]['userSemanticTypes'][0]['type']['uri']] = 1;
                        else  types[nodes[n]['userSemanticTypes'][0]['type']['uri']] ++;
                    }
                }
            }
        }
        console.log('Data Types associated with ' + domain_uri);
        console.log(types);
        console.log('\n');
    });
}

var main = () => {
    show_internal_nodes(__dirname + '/../data/evaluation/museum-29-edm/models-json');
    show_internal_nodes_type(__dirname + '/../data/evaluation/museum-29-edm/models-json', 'http://www.w3.org/2008/05/skos#Concept');
    show_internal_nodes_type(__dirname + '/../data/evaluation/museum-29-edm/models-json', 'http://www.americanartcollaborative.org/ontology/Person');
    show_internal_nodes_type(__dirname + '/../data/evaluation/museum-29-edm/models-json', 'http://www.americanartcollaborative.org/ontology/CulturalHeritageObject');
    show_internal_nodes_type(__dirname + '/../data/evaluation/museum-29-edm/models-json', 'http://xmlns.com/foaf/0.1/Document');
    show_internal_nodes_type(__dirname + '/../data/evaluation/museum-29-edm/models-json', 'http://www.europeana.eu/schemas/edm/EuropeanaAggregation');
    show_internal_nodes_type(__dirname + '/../data/evaluation/museum-29-edm/models-json', 'http://www.europeana.eu/schemas/edm/WebResource');
    show_internal_nodes_type(__dirname + '/../data/evaluation/museum-29-edm/models-json', 'http://www.americanartcollaborative.org/ontology/Place');
}

main();
