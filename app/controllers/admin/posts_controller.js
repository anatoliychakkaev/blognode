module.exports = {
    _render: {
        layout: 'admin'
    },
    index: function (req, next) {
        Record.all_instances({order: 'created_at'}, function (records) {
            records.reverse();
            records.forEach(function (r) {
                r.localize(req.locale);
            });
            next('render', { records: records, locale: req.locale });
        });
    },
    create: function (req, next) {
        Record.create_localized(req.locale, req.body, function () {
            next('redirect', path_to.admin_posts);
        });
    },
    new: function (req, next) {
        next('render', { post: new Record, locale: req.locale });
    },
    edit: function (req, next) {
        Record.find(req.params.id, function () {
            this.localize(req.locale);
            next('render', { post: this, locale: req.locale });
        });
    },
    update: function (req, next) {
        Record.find(req.params.id, function () {
            this.save_localized(req.locale, req.body, function () {
                next('redirect', path_to.admin_posts);
            });
        });
    },
    destroy: function (req, next) {
    },
    show: function (req, next) {
    }
};
