var m = require('../../../lib/models.js');

var ctl = {
    render: {
        layout: 'admin'
    },
    index: function (req, next) {
        m.Record.all_instances(function (records) {
            next('render', { records: records.reverse(), post: new m.Record });
        });
    },
    create: function (req, next) {
        m.Record.create(req.body, function () {
            next('redirect', '/admin/posts');
        });
    },
    new: function (req, next) {
    },
    destroy: function (req, next) {
    },
    update: function (req, next) {
        console.log(req.body);
        m.Record.find(req.body.id, function () {
            this.update_attributes(req.body, function () {
                next('redirect', '/admin/posts');
            });
        });
    },
    edit: function (req, next) {
        m.Record.find(req.params.id, function () {
            next('render', { post: this });
        });
    },
    show: function (req, next) {
    }
}

module.exports = ctl;
