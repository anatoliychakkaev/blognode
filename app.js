/**
 * Module dependencies.
 */

var express = require('express'),
    app = module.exports = express.createServer(),
    RedisStore = require('connect-redis'),
    store = new RedisStore;

require('./lib/date_format.js');

var session_key = 'connect.sidw';

// Configuration

app.configure(function(){
    app.use(express.staticProvider(__dirname + '/public'));
    app.use(express.logger());
    app.set('views', __dirname + '/app/views');
    app.use(express.cookieDecoder());
    // app.use(express.session({ store: store, key: session_key }));
    app.use(express.bodyDecoder());
    app.use(express.methodOverride());
    app.use(express.compiler({ src: __dirname + '/public', enable: ['less'] }));
    app.use(function set_locale(req, res, next) {
        if (req.query.locale) {
            req.locale = req.query.locale == 'ru' ? 'ru' : 'en';
            next();
            return;
        }
        req.locale = 'en';
        req.headers['accept-language'].split(',').forEach(function (val, index, arr) {
            val = val.split(';')[0];
            if (val == 'ru-RU' || val == 'ru') {
                req.locale = 'ru';
            }
        });
        next();
    });
    app.use(app.router);
});

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
    app.use(express.errorHandler());
});

// Load config
global.config = require('yaml').eval(
    require('fs')
    .readFileSync('config/app_config.yml')
    .toString()
)[app.settings.env];

// Controller

var m = require('./lib/models.js');
require('./lib/routing.js').add_routes(app);

//m.Record.connection.select(2);

app.get('/', function (req, res) {
    m.Record.all_instances({order: 'created_at'}, function (records) {
        records.reverse();
        records.forEach(function (r) {
            r.localize(req.locale);
        });
        res.render('index.jade', {
            locals: {
                title: 'Blog about javascript, nodejs and related technologies',
                records: records
            }
        });
    });
});

app.get('/:id', function (req, res) {
    m.Record.find(parseInt(req.params.id, 10), function () {
        this.localize(req.locale);
        this.content = require('markdown-js').makeHtml(this.content);
        res.render('show.jade', {
            locals: {
                title: this.title,
                post: this
            }
        });
    });
});

// Only listen on $ node app.js

if (!module.parent) {
    app.listen(parseInt(process.ARGV[2], 10) || 1601);
    //var utils = require('connect/utils');
    console.log("Express server listening on port %d", app.address().port)
}
