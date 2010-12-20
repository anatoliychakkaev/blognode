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
