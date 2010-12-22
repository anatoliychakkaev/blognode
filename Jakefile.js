desc('Draw routes');
task('routes', [], function () {
    function print (method) {
        return function () {
            console.log(method + "\t" + arguments[0]);
        };
    }
    require('./lib/routing').add_routes({
        get: print('get'),
        post: print('post'),
        delete: print('delete'),
        put: print('put')
    });
});

namespace('packages', function () {
    desc('Check installed packages');
    task('check', {}, function () {
        var npm = require('npm');
        npm.load({}, function (err) {
            if (err) throw err;
            npm.commands.ls(['installed'], function (err, packages) {
                var requirements = JSON.parse(require('fs').readFileSync('config/requirements.json'));
                console.log(requirements);
            });
        });
    });
});
