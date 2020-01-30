var fs = require('fs');

// Precision
var compute_precision = (sm_gt, sm_eval) => {
    var num = 0;
    var denom = sm_eval.length;

    sm_gt.forEach(gt_triple => {
        gt_triple = gt_triple.join(',');

        sm_eval.forEach(eval_triple => {
            eval_triple = eval_triple.join(',');

            if (eval_triple === gt_triple) {
                num++;
            }
        })
    });
    return num / denom;
}

// Recall
var compute_recall = (sm_gt, sm_eval) => {
    var num = 0;
    var denom = sm_gt.length;

    sm_gt.forEach(gt_triple => {
        gt_triple = gt_triple.join(',');

        sm_eval.forEach(eval_triple => {
            eval_triple = eval_triple.join(',');

            if (eval_triple === gt_triple) {
                num++;
            }
        })
    });
    return num / denom;
}

// Check extracted triples
var check_triples = (triples) => {
    triples.forEach(i => {
        if (i.length > 4) {
            console.log('\n\n*** WARNING: splitter has generated too long array! ***');
            console.log(i);
        }
        if (i.length === 5) {
            console.log('\nCleaning...')
            i[3] = i[3] + ' ' + i[4];
            i.pop();
            console.log(i);
            console.log('\n\n')
        } else if (i.length === 6) {
            console.log('\nCleaning...')
            i[3] = i[3] + ' ' + i[4] + ' ' + i[5];
            i.pop();
            i.pop()
            console.log(i);
            console.log('\n\n')
        } else if (i.length > 6) {
            console.log('\n\n***** VERY BAD WARNING: CASE NOT MANAGED YET! *****');
        }
    });
}

var extract_rels = (sm_path, st_path) => {
    var sm = fs.readFileSync(sm_path, 'utf8');
    var attrs = JSON.parse(fs.readFileSync(st_path, 'utf8'))[0]['attributes'];

    // Extract string within CONSTRUCT {}
    var triples = sm.substring(
            sm.lastIndexOf('CONSTRUCT {') + 12,
            sm.lastIndexOf('WHERE') - 3)
        .replace(/ +(?= )/g, '')
        .split('.\n');

    triples = triples.map(i => {
        return i.split(' ');
    });

    // Check and fix bad cases
    check_triples(triples);

    // Extract relation triples
    triples = triples.filter(i => {
        return i[2] !== 'rdf:type' && attrs.indexOf(i[3].split('?')[1]) === -1;
    });

    // XXX Remove the point from the last triple
    var last_triple = triples[triples.length - 1];
    var object = last_triple[last_triple.length - 1];
    var index_object = last_triple.indexOf(object);
    triples[triples.length - 1][index_object] = object.slice(0, -1);;

    return triples;
}

var task = process.argv.slice(2)[0];
var input_file = process.argv.slice(3)[0];
var gt_folder = 'evaluation/taheriyan2016/' + task + '/semantic_models_gt/jarql/';
var steiner_folder = 'evaluation/taheriyan2016/' + task + '/semantic_models_steiner/jarql/';
var st_folder = 'data/taheriyan2016/' + task + '/semantic_types/updated/';
var results_folder = 'evaluation/taheriyan2016/' + task + '/results/semantic-modeling/';

if (input_file === undefined) {
    var gt_files = fs.readdirSync(gt_folder);
    var steiner_files = fs.readdirSync(steiner_folder);
    var st_files = fs.readdirSync(st_folder);

    /* *** Comparison with steiner models *** */
    console.log('\n\nCompute average precision and recall comparing steiner semantic models with ground truth');
    var avg_precision = 0;
    var avg_recall = 0;

    gt_files.forEach((gt_name, index) => {
        console.log('\nCompare the semantic models related to: ');
        var gt_path = gt_folder + gt_name;
        var steiner_path = steiner_folder + steiner_files[index];
        var st_path = st_folder + st_files[index];
        console.log('   - ' + gt_name);

        var rels_gt = extract_rels(gt_path, st_path);
        var rels_steiner = extract_rels(steiner_path, st_path);
        var precision = compute_precision(rels_gt, rels_steiner);
        avg_precision += precision;
        var recall = compute_recall(rels_gt, rels_steiner);
        avg_recall += recall;
        console.log();
        console.log('   * Precision: ' + precision);
        console.log('   * Recall: ' + recall);
        console.log();
    });

    console.log('\n\n*** Average Precision comparing steiner and ground truth: ' + avg_precision / gt_files.length);
    console.log('*** Average Recall comparing steiner and ground truth: ' + avg_recall / gt_files.length);

    // Save results in file
    var d = new Date();
    d.setSeconds(0, 0, 0);
    var file_name = results_folder + 'result__' + d.toISOString().replace(/T/, '_').replace(/\..+/, '') + '.txt'
    fs.appendFileSync(file_name, 'TASK 4');
    fs.appendFileSync(file_name, '\n* Average Precision comparing steiner and ground truth: ' + avg_precision / gt_files.length);
    fs.appendFileSync(file_name, '\n* Average Recall comparing steiner and ground truth: ' + avg_recall / gt_files.length)


    /* *** End of comparison with steiner models *** */
} else {
    // TODO
}