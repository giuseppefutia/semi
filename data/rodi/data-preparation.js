var fs = require('fs');
var path = require('path');

var basic = 'data/rodi/';
var files = [];

// Prepare data for all RODI scenarios or for a subset of them
if (process.argv.length == 2) {
    files = fs.readdirSync(basic);
    files = files.filter(f => fs.statSync(path.join(basic, f)).isDirectory());
} else {
    for (var i = 2; i < process.argv.length; i++) {
        files.push(process.argv[i]);
    }
}

console.log('\nStart to remove all previous files...\n');

// Remove all files of the previous step

var directories = ['semantic_models', 'output', 'scripts', ]

for (var i in files) {
    for (var d in directories) {
        var dir = basic + files[i] + '/' + directories[d] + '/';
        var to_remove = fs.readdirSync(dir);
        for (var t in to_remove) {
            fs.unlinkSync(path.join(dir, to_remove[t]));
            console.log('Remove ' + path.join(dir, to_remove[t]))
        }
    }
}

console.log('\nFiles removed!');

/*

For now I comment this part because I apply changes to input data due to the bug
of JARQL engine

console.log('\nSplit input data of ' + files.length + ' scenarios');

// Read input JSON of scenarios included in files
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
*/

// Generate scripts for semantic modeling
var keywords = ['graph', 'steiner', 'jarql', 'rdf', 'plausible_jarql', 'plausible_rdf', 'refinement', 'jarql_refinement', 'rdf_refinement'];

for (var i in files) {
    var sts_dir = basic + files[i] + '/semantic_types/';
    var sts = fs.readdirSync(sts_dir);

    // Scripts are generated only if semantic types are ready
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
                        basic + files[i] + '/semantic_models/' + sts[s].split('_st.json')[0] + '_steiner\n ';
                    break;
                case 'rdf':
                    content = 'java -jar jarql-1.0.1-SNAPSHOT.jar ' +
                        basic + files[i] + '/input/' + sts[s].split('_st.json')[0] + '.json ' +
                        basic + files[i] + '/semantic_models/' + sts[s].split('_st.json')[0] + '_steiner.query > ' +
                        basic + files[i] + '/output/' + sts[s].split('_st.json')[0] + '_steiner.ttl ' + '\n';
                    break;
                case 'plausible_jarql':
                    content = 'node run/jarql.js ' +
                        basic + files[i] + '/' +
                        'semantic_types' + '/' +
                        sts[s] + ' ' +
                        basic + files[i] + '/semantic_models/' + sts[s].split('_st.json')[0] + '_graph.json ' +
                        basic + files[i] + '/ontology/classes.json ' +
                        basic + files[i] + '/semantic_models/' + sts[s].split('_st.json')[0] + '_plausible' + '\n';
                    break;
                case 'plausible_rdf':
                    content = 'java -jar jarql-1.0.1-SNAPSHOT.jar ' +
                        basic + files[i] + '/input/' + sts[s].split('_st.json')[0] + '.json ' +
                        basic + files[i] + '/semantic_models/' + sts[s].split('_st.json')[0] + '_plausible.query > ' +
                        basic + files[i] + '/output/' + sts[s].split('_st.json')[0] + '_plausible.ttl ' + '\n';
                    break;
                case 'refinement':
                    content = 'node run/refinement.js ' +
                        basic + files[i] + '/' +
                        'semantic_types' + '/' +
                        sts[s] + ' ' +
                        basic + files[i] + '/model_datasets/scores/' + sts[s].split('_st.json')[0] + '_score.json ' +
                        basic + files[i] + '/semantic_models/' + sts[s].split('_st.json')[0] + '_steiner.json ' +
                        basic + files[i] + '/semantic_models/' + sts[s].split('_st.json')[0] + '_graph.json ' +
                        basic + files[i] + '/refined_semantic_models/' + sts[s].split('_st.json')[0] + '\n';
                    break;
                case 'jarql_refinement':
                    content = 'node run/jarql.js ' +
                        basic + files[i] + '/' +
                        'semantic_types' + '/' +
                        sts[s] + ' ' +
                        basic + files[i] + '/refined_semantic_models/' + sts[s].split('_st.json')[0] + '_refined_graph.json ' +
                        basic + files[i] + '/ontology/classes.json ' +
                        basic + files[i] + '/refined_semantic_models/' + sts[s].split('_st.json')[0] + '_refined\n ';
                    break;
                case 'rdf_refinement':
                    content = 'java -jar jarql-1.0.1-SNAPSHOT.jar ' +
                        basic + files[i] + '/input/' + sts[s].split('_st.json')[0] + '.json ' +
                        basic + files[i] + '/refined_semantic_models/' + sts[s].split('_st.json')[0] + '_refined.query > ' +
                        basic + files[i] + '/output/' + sts[s].split('_st.json')[0] + '_refined.ttl ' + '\n';
                    break;
            }
            var file_name = basic + files[i] + '/scripts/' + files[i] + '_' + keywords[k] + '.sh'
            fs.appendFileSync(file_name, content);
            scripts.push(file_name);
        }
    }

    // Produce the scripts only if semantic types are available
    if (sts.length > 0) {
        // Script including all other scripts in a single scenario
        var final_script = basic + files[i] + '/scripts/' + files[i] + '.sh';
        fs.appendFileSync(final_script, 'sudo chmod u+x ' + basic + files[i] + '/scripts/* \n');
        for (var sc in scripts) {
            fs.appendFileSync(final_script, scripts[sc] + '\n');
        }
        var rdf_dir = basic + files[i] + '/output/';

        // RDF from all plausible semantic models
        fs.appendFileSync(final_script, 'cat ' + rdf_dir + files[i] + '*plausible* > ' + rdf_dir + 'plausible_final.ttl \n');

        // RDF from the initial semantic model
        fs.appendFileSync(final_script, 'cat ' + rdf_dir + files[i] + '*steiner* > ' + rdf_dir + 'steiner_final.ttl \n');

        fs.chmodSync(final_script, 0o777);

        console.log('\n*** Semantic model generation for scenario: ' + files[i] + ' ***');

        // Execute the scripts
        require('child_process').execSync(final_script, {
            stdio: 'inherit'
        });
    }
}

console.log('\nData preparation completed!');