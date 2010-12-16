require('../app/controllers/before_filter.js');

var undef;

function ActionObserver(ctl_name) {
    var controller = require('../app/controllers/' + ctl_name + '_controller.js');
    var base_path = ['/', ctl_name, '/'].join('');
    controller.base_path = base_path;
    var super = {
        layout: controller.render && controller.render.layout || 'application',
        base_path: controller.base_path
    };
    this.respond_to = function (action_name) {
        return action_name.charAt(0) !== '_' && action_name in controller;
    };
    this.call = function (action_name, req, res) {
        controller[action_name](req, function (action, param) {
            switch (action) {
                case 'send':
                res.send(param);
                break;
                case 'redirect':
                res.redirect(param || base_path);
                break;
                default:
                case 'render':
                if (!param) {
                    param = {};
                }
                param.base_path = param.base_path || base_path;
                res.render(ctl_name + '/' + action_name + '.jade', {
                    layout: (controller.layout || super.layout) + '_layout.jade',
                    // TODO: передать параметры во вьюху из контроллера с возможностью затереть потом
                    locals: param
                });
                break;
            }
            controller.render.layout = false;
            controller.render.locals = {};
        });
    };
    this.calling = function (action_name) {
        var obs = this;
        if (this.respond_to(action_name)) {
            return function (req, res) {
                obs.call(action_name, req, res);
            };
        } else {
            console.log('WARNING: controller ' + ctl_name + ' do not respond to action ' + action_name);
            return false;
        }
    }
}
function create_routes(app, controller_name, routes, before_filter) {
    var observer = new ActionObserver(controller_name);
    if (!before_filter) {
        before_filter = [];
    } else {
        if (typeof before_filter == 'string') {
            before_filter = [before_filter];
        }
        if (before_filter.constructor == Array) {
            for (var i in before_filter) {
                if (typeof before_filter[i] == 'string') {
                    before_filter[i] = observer.calling(before_filter[i]) || global.before_filter[before_filter[i]];
                }
            }
        }
    }
    controller_name = '/' + controller_name;
    var method = 'get', action, action_name, path;
    for (var i in routes) {
        (function (i) {
        var route = i.split(/\s+/);
        if (route.length == 1) {
            method = 'get';
            action_name = i;
        } else {
            method = route[0].toLowerCase();
            action_name = route[1];
        }
        path = controller_name + action_name;
        action = observer.calling(routes[i]);
        var args = [path]
            .concat(before_filter)
            .concat(action || function (req, res) {
                res.send('Unknown action ' + routes[i] + ' for controller ' + controller_name);
            });
        app[method].apply(app, args);
        if (action_name == '/') {
            args[0] = args[0].replace(/\/$/, '');
            app[method].apply(app, args);
        }
        })(i);
    }
}

exports.create_routes = create_routes;
