var fs = require('fs');
var path = require('path');

// Read all directories in rodi directory
var basic = 'data/rodi/';
var files = fs.readdirSync(basic)
files = files.filter(f => fs.statSync(path.join(basic, f)).isDirectory());

console.log('\nSplit input data of ' + files.length + ' scenarios');

// Read input JSON of each scenario and split data

/*
var total_input_files;
for (var i in files) {
    var json_path = basic + files[i] + '/input/' + files[i] + '.json';
    var data = fs.readFileSync(json_path);
    var json = JSON.parse(data);
    for (var r in json) {
        var dir = path.dirname(json_path);
        var base = path.basename(json_path, '.json');
        var end = Object.keys(json[r])[0].toString();
        var file_data = JSON.stringify(json[r]);
        fs.writeFileSync(dir + '/' + base + '___' + end + '.json', file_data);
    }
    total_input_files = files.length * json.length
}

console.log('Total number of input files: ' + total_input_files);

console.log('\nRemove all scripts');
*/


// Remove all scripts
for (var i in files) {
    var script_dir = basic + files[i] + '/scripts/';
    var script_files = fs.readdirSync(script_dir);
    for (var s in script_files) {
        if (script_files[s] != '.gitignore')
            fs.unlinkSync(path.join(script_dir, script_files[s]));
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
            // Write new file and append using keywords
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
                        basic + files[i] + '/ontology/classes.json ' +
                        basic + files[i] + '/semantic_models/' + sts[s].split('_st.json')[0] + '\n';
                    break;
                case 'rdf':
                    content = 'java -jar jarql-1.0.1-SNAPSHOT.jar ' +
                        basic + files[i] + '/input/' + sts[s].split('_st.json')[0] + '.json ' +
                        basic + files[i] + '/semantic_models/' + sts[s].split('_st.json')[0] + '.query > ' +
                        basic + files[i] + '/output/' + sts[s].split('_st.json')[0] + '.ttl ' + '\n';
                    break;
            }
            var file_name = basic + files[i] + '/scripts/' + files[i] + '_' + keywords[k] + '.sh'
            fs.appendFileSync(file_name, content);
            scripts.push(file_name);
        }
    }

    if (sts.length > 0) {
        // Script including all other scripts in a single scenario
        var final_script = basic + files[i] + '/scripts/' + files[i] + '.sh';
        fs.appendFileSync(final_script, 'sudo chmod u+x ' + basic + files[i] + '/scripts/* \n');
        for (var sc in scripts) {
            fs.appendFileSync(final_script, scripts[sc] + '\n');
        }
        var rdf_dir = basic + files[i] + '/output/';
        fs.appendFileSync(final_script, 'cat ' + rdf_dir + files[i] + '* > ' + rdf_dir + 'final.ttl \n');

        fs.chmodSync(final_script, 0o777);

        console.log('\n*** Semantic model generation for scenario: ' + files[i] + ' ***');

        // Execute the script
        require('child_process').execSync(final_script, {
            stdio: 'inherit'
        });
    }
}

console.log('\nData preparation completed!');