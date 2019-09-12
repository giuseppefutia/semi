var fs = require('fs');
var utils = require(__dirname + '/../semantic_modeling/utils.js');

/**
 * Compute average score for each relation
 * @param score_path
 * @returns relation_scores
 *          {
 *              "relation": score average value
 *          }
 **/
var compute_score_average = (file_path) => {
    var relation_average_scores = {};
    var score_data = load_score_file(file_path);
    var relation_scores = compute_score_aggregation(score_data);
    for (var i in relation_scores) {
        var average_score = relation_scores[i]['total_scores'] / relation_scores[i]['total_occs'];
        relation_average_scores[i] = average_score;
    }

    // Rename key of relation scores to bind them with relations produced by the refinement.js script
    var prefixes = utils.get_prefix();

    var key_values = Object.keys(relation_average_scores).map(key => {
        var prefix = prefixes[key.split('#')[0] + '#'];
        var new_key = prefix + key.split('#')[1];
        return {
            [new_key]: relation_average_scores[key]
        }
    });
    return Object.assign({}, ...key_values);
}

/**
 * Compute aggregated score for each relation
 * @param score_data
 * @returns relation_scores
 *          {
 *              "relation": {total_scores: 1, total_occs: 1}
 *          }
 **/
var compute_score_aggregation = (score_data) => {
    var relation_scores = {};
    for (var i in score_data) {
        var r_uri = score_data[i]['r_uri'];
        var score = score_data[i]['score'];
        if (!relation_scores.hasOwnProperty(r_uri)) {
            relation_scores[r_uri] = {};
            relation_scores[r_uri]['total_scores'] = score;
            relation_scores[r_uri]['total_occs'] = 1;
        } else {
            relation_scores[r_uri]['total_scores'] += score;
            relation_scores[r_uri]['total_occs'] += 1;
        }
    }
    return relation_scores;
}

/**
 * Load score file
 * @param file_path each object of the file has the following structure
 *                  {
 *                      "s_id": s_id,
 *                      "s_uri": "s_uri",
 *                      "r_id": r_id,
 *                      "r_uri": r_uri,
 *                      "o_id": o_uri,
 *                      "rank": value
 *                      "score": value
 *                  }
 **/
var load_score_file = (file_path) => {
    var json = fs.readFileSync(file_path);
    var score_data = JSON.parse(json);
    return score_data;
}

exports.compute_score_average = compute_score_average;