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
    //app.use(express.logger());
    app.set('views', __dirname + '/app/views');
    app.use(express.cookieDecoder());
    app.use(express.session({ store: store, key: session_key }));
    app.use(express.bodyDecoder());
    app.use(express.methodOverride());
    app.use(express.compiler({ src: __dirname + '/public', enable: ['less'] }));
    app.use(app.router);
});

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
    app.use(express.errorHandler());
});

// Controller

var m = require('./lib/models.js');
m.Record.connection.select(2);

// Routes

app.get('/', function (req, res) {
    m.Record.all_instances(function (records) {
        res.render('index.jade', {
            locals: {
                title: 'Blog about javascript, nodejs and related technologies',
                records: records
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
