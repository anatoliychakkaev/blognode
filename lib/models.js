var fs = require('fs');

var exps = {};

fs.readdirSync('./app/models/').forEach(function (f) {
    exps[f] = require('../app/models/' + f);
    for (var i in exps[f]) {
        exports[i] = exps[f][i];
    }
});

for (var e in exps) {
    for (var c in exports) {
        exps[e][c] = exports[c];
    }
}

require('../vendor/orm/lib/orm.js').mix_persistence_methods(exports);
