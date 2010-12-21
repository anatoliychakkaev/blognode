var m = require('../../../lib/models.js');

var ctl = {
    render: {
        layout: 'admin'
    },
    index: function (req, next) {
        m.Record.all_instances({order: 'created_at'}, function (records) {
            records.reverse();
            records.forEach(function (r) {
                r.localize(req.locale);
            });
            next('render', { records: records });
        });
    },
    create: function (req, next) {
        console.log(req.body);
        m.Record.create_localized(req.body, function () {
            next('redirect', '/admin/posts');
        });
    },
    new: function (req, next) {
        next('render', { post: new m.Record, locale: req.locale });
    },
    destroy: function (req, next) {
    },
    update: function (req, next) {
        console.log(req.body);
        m.Record.find(req.body.id, function () {
            this.save_localized(req.locale, req.body, function () {
                next('redirect', '/admin/posts');
            });
        });
    },
    edit: function (req, next) {
        m.Record.find(req.params.id, function () {
            this.localize(req.locale);
            next('render', { post: this, locale: req.locale });
        });
    },
    show: function (req, next) {
    }
}

module.exports = ctl;
