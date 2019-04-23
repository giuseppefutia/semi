var fs = require('fs');
var path = require('path');

// Read all directories in rodi directory
var basic = 'data/rodi/';
var files = fs.readdirSync(basic)
files = files.filter(f => fs.statSync(path.join(basic, f)).isDirectory());

// Read input JSON of each scenario and split data
for (var i in files) {
    var json_path = basic + files[i] + '/input/' + files[i] + '.json';
    var data = fs.readFileSync(json_path);
    var json = JSON.parse(data);
    for (var r in json) {
        var dir = path.dirname(json_path);
        var base = path.basename(json_path, '.json');
        var end = Object.keys(json[r])[0].toString();
        var file_data = JSON.stringify(json[r]);
        fs.writeFileSync(dir + '/' + base + '***' + end + '.json', file_data);
    }
}

// Generate scripts for semantic modeling
var keywords = ['graph', 'steiner', 'jarql', 'rdf'];

for (var i in files) {
    var sts_dir = basic + files[i] + '/semantic_types/';
    var sts = fs.readdirSync(sts_dir);

    for (var s in sts) {
        var scripts = [];
        for (var k in keywords) {
            // Write new file or append using keywords
            var content = '';
            switch (keywords[k]) {
                case 'graph':
                    content = 'node run/graph.js ' +
                        basic + files[i] + '/' +
                        'semantic_types' + '/' +
                        sts[s] + ' ' +
                        basic + files[i] + '/ontology/ontology.ttl ' +
                        'rdfs:domain rdfs:range owl:Class ' +
                        basic + files[i] + '/semantic_models/' + sts[s].split('_st.json')[0] + '\n';
                    break;
                case 'steiner':
                    content = 'node run/steiner_tree.js ' +
                        basic + files[i] + '/' +
                        'semantic_types' + '/' +
                        sts[s] + ' ' +
                        basic + files[i] + '/semantic_models/' + sts[s].split('_st.json')[0] + '_graph.json ' +
                        basic + files[i] + '/semantic_models/' + sts[s].split('_st.json')[0] + '\n';
                    break;
                case 'jarql':
                    content = 'node run/jarql.js ' +
                        basic + files[i] + '/' +
                        'semantic_types' + '/' +
                        sts[s] + ' ' +
                        basic + files[i] + '/semantic_models/' + sts[s].split('_st.json')[0] + '_steiner.json ' +
                        basic + files[i] + '/semantic_models/' + sts[s].split('_st.json')[0] + '\n';
                    break;
                case 'rdf':
                    content = 'java -jar jarql-1.0.1-SNAPSHOT.jar ' +
                        basic + files[i] + '/input/' + sts[s].split('_st.json')[0] + '.json ' +
                        basic + files[i] + '/semantic_models/' + sts[s].split('_st.json')[0] + '.query > ' +
                        basic + files[i] + '/output/' + sts[s].split('_st.json')[0] + '.rdf ' + '\n';
                    break;
            }
            var file_name = basic + files[i] + '/scripts/' + files[i] + '_' + keywords[k] + '.sh'
            fs.appendFileSync(file_name, content);
            scripts.push(file_name);
        }
    }

    // Script launching all other scripts in a single scenario
    if (sts.length > 0) {
        var final_name = basic + files[i] + '/scripts/' + files[i] + '.sh';
        fs.appendFileSync(final_name, 'sudo chmod u+x ' + basic + files[i] + '/scripts/ \n');
        for (var sc in scripts) {
            fs.appendFileSync(final_name, scripts[sc] + '\n');
        }
    }
}

// TODO: add permission to the scripts 

// TODO: RDF merge of all files