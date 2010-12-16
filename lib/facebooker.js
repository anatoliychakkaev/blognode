var m = require('./models.js'),
    fs = require('fs'),
    util = require('./utils');

var offline_mode = false;
var api_key, api_secret, canvas_name, canvas_url, redirect_uri, scope;

var GRAPH_API_HOST = 'graph.facebook.com';
var REST_API_HOST = 'api.facebook.com';
var ACCESS_TOKEN;
var facebooker = {};

exports.init = function (params) {
    api_key = params.api_key;
    api_secret = params.api_secret;
    canvas_name = params.canvas_name;
    canvas_url = 'http://apps.facebook.com/' + canvas_name;
    redirect_uri = params.callback_url;
    // scope: http://developers.facebook.com/docs/authentication/permissions
    scope = params.scope || 'user_online_presence,friends_online_presence,email'
    if (params.global) {
        global.facebooker = facebooker;
    }
    return facebooker;
};

function reauthorize (res, scp) {
    util.top_redirect_to('https://' + GRAPH_API_HOST + '/oauth/authorize?' +
        util.serialize({
            client_id: api_key,
            redirect_uri: redirect_uri,
            scope: scp || scope
        }),
        res
    );
}
exports.reauthorize = reauthorize;

function do_request(method, host, path, params, callback) {
    console.log('do_request');
    var facebook = require('http').createClient(443, host, true),
    serialized_params = util.serialize(params);
    request = facebook.request(method, path + (serialized_params ? ('?' + serialized_params) : ''),
        {host: host}
    );
    request.on('response', function (response) {
        var data = '';
        response.on('data', function (chunk) {
            console.log('middle of response');
            data += chunk.toString();
            console.log(data);
        });
        response.on('end', function () {
            console.log('end of response');
            try {
                var obj = JSON.parse(data);
            } catch(e) {
                callback(data);
                return;
            }
            callback(obj);
        });
    });
    request.end();
}

function get(path, params, callback, req, res) {
    if (params && params.access_token && (!req || !res)) {
        throw new Error('Expected req and res params when secured query');
    }
    console.log('get');
    do_request('GET', GRAPH_API_HOST, path, params, function (obj) {
        if (obj && !obj.error) {
            callback(obj);
            return;
        }
        switch (obj.error.type) {
            case "OAuthException":
            req.session.fb = false;
            reauthorize(res);
            break;
        }
    });
}

exports.get = get;

var fs = require('fs')
var rest_api_methods = JSON.parse(fs.readFileSync('config/facebook_api.json').toString('utf-8'));

for (var namespace in rest_api_methods) {
    rest_api_methods[namespace].forEach(function (s) {
        s = s.split(/:\s*/);
        var action = s[0];
        var params = s[1] ? s[1].split(/,\s*/) : [];
        add_interface_action(namespace, action, params);
    });
}

function add_interface_action (namespace, action, param_names) {
    if (!facebooker[namespace]) facebooker[namespace] = {};
    facebooker[namespace][action] = function () {
        if (!ACCESS_TOKEN) {
            throw new Error('Facebooker: access_token required for rest api calls');
        }
        var callback = arguments.length - param_names.length == 1 ? arguments[arguments.length - 1] : false;
        if (!callback && arguments.length !== param_names.length) {
            throw new Error('Required arguments for ' + namespace + '.' + action + ': ' + param_names.join(', ') + '[, callback]');
        }
        var args = arguments;
        var params = {};
        param_names.forEach(function (param, index, arr) {
            if (null !== args[index]) params[param] = args[index];
        });
        params['access_token'] = ACCESS_TOKEN;
        params['format'] = 'json';
        do_request('GET', REST_API_HOST, 'method/' + namespace + '.' + action, params, callback);
    };
}

/**
 * Function connect -- middleware method which allows to authorize facebook user
 * @param {Object} req -- request (should have `query` hash with get params)
 * @param {Object} res -- response
 * @param {Function} next -- callback
 *
 * Behaviour:
 *     if we have object req.session.fb
 **/
facebooker.connect = function connect (req, res, next) {
    if (offline_mode) {
        req.session.fb = {access_token: 'offline', user: {id: 1, name: 'John Doe'}};
        req.just_connected = true;
    }
    if (!req.session) {
        req.session = {};
    }
    // when GET param `signed_request` is defined, try to parse and verify
    // if success, we have oauth_token and user_id it saved in req.session.fb object
    if (req.query.signed_request) {
        // TODO decode user id from signed request
        // http://developers.facebook.com/docs/authentication/canvas
        var data = util.parse_signed_request(req.query.signed_request, api_secret);
        if (data) {
            req.session.fb = req.session.fb || {};
            ACCESS_TOKEN = data.oauth_token;
            req.session.fb.access_token = data.oauth_token;
            req.session.fb.user_id = data.user_id;
        } else {
            // throw new Error('Wrong signed request param');
        }
    }
    if (req.session.fb) {
        m.User.find(req.session.fb.user_id, function (not_found) {
            if (not_found) {
                console.log('not found');
                retrieve_info(req, res, next);
            } else {
                req.user = this;
                next();
            }
        });
        return;
    }
    if (req.query.code) {
        get('/oauth/access_token', {
            client_id: api_key,
            redirect_uri: redirect_uri,
            client_secret: api_secret,
            code:  req.query.code
        }, function (data) {
            var access_token = data.split('=')[1];
            req.just_connected = true;
            ACCESS_TOKEN = access_token;
            req.session.fb = {access_token: access_token};
            retrieve_info(req, res, function () {
                res.redirect(canvas_url);
            });
        });
    } else {
        reauthorize(res);
    }
};

function retrieve_info (req, res, callback) {
    console.log('retrieve_info');
    get('/me', {access_token: req.session.fb.access_token}, function (data) {
        console.log(data);
        req.just_connected = true;
        req.session.fb.user_id = data.id;
        req.session.fb.user_info = data;
        m.User.find_or_create(req.session.fb.user_id, function (err) {
            console.log('find_or_create callback');
            this.update_attribute('info', req.session.fb.user_info, function () {
                console.log('update_attribute callback');
                req.user = this;
                if (this.friends) {
                    callback();
                } else {
                    get('/me/friends', {access_token: req.session.fb.access_token}, function (data) {
                        req.user.update_attribute('friends', data.data, callback);
                    }, req, res);
                }
            });
        });
    }, req, res);
}

facebooker.check_connection = function (req, res, next) {
    console.log('check connection');
    if (offline_mode) {
        next();
        return;
    }
    if (typeof req.just_connected == 'undefined') {
        retrieve_info(req, res, next);
    } else {
        console.log('connection is ok');
        next();
    }
};

