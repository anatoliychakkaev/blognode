function basic_auth (req, res, next) {
    if (!global.config.restrict_access) {
        next();
        return;
    }
    if (req.headers.authorization && req.headers.authorization.search('Basic ') === 0) {
        // fetch login and password
        if (new Buffer(req.headers.authorization.split(' ')[1], 'base64').toString() == global.config.admin) {
            next();
            return;
        }
    }
    console.log('Unable to authenticate user ' + req.headers.authorization);
    res.header('WWW-Authenticate', 'Basic realm="Admin Area"');
    res.send('Authentication required', 401);
}

exports.routes = function (map) {
    map.namespace('admin', function (admin) {
        admin.resources('posts', {middleware: basic_auth});
    })
};
