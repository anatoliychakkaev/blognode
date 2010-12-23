var fs = require('fs');

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

desc('Check and install required packages');
task('depends', [], function () {
    var npm = require('npm'), cb_counter = 0, wait_for_all = function () {
        if (--cb_counter === 0) complete();
    };
    npm.load({}, function (err) {
        if (err) throw err;
        npm.commands.ls(['installed'], true, function (err, packages) {
            var requirements = JSON.parse(fs.readFileSync('config/requirements.json'));
            requirements.forEach(function (package) {
                cb_counter += 1;
                if (packages[package]) {
                    console.log('Package ' + package + ' is already installed');
                    wait_for_all();
                } else {
                    npm.commands.install([package], function (err, data) {
                        wait_for_all();
                    });
                }
            });
        });
    });
}, true);
