var fs = require('fs');
var obj;

fs.readFile('mondial_rel/input/mondial_rel.json', 'utf8', function(err, data) {
    if (err) throw err;
    obj = JSON.parse(data);
    console.log(obj);
});
