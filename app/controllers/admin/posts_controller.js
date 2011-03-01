layout('admin');

action('index', function () {
    Record.allInstances({order: 'created_at'}, function (records) {
        records.reverse();
        records.forEach(function (r) {
            r.localize(req.locale);
        });
        render({ records: records, locale: req.locale });
    });
});

action('create', function () {
    var data = req.body;
    data.published = data.published ? 1 : 0;
    Record.create_localized(req.locale, data, function () {
        redirect(path_to.admin_posts);
    });
});

action('new', function () {
    render({ post: new Record, locale: req.locale });
});

action('edit', function () {
    Record.find(req.params.id, function () {
        this.localize(req.locale);
        render({ post: this, locale: req.locale });
    });
});

action('update', function () {
    Record.find(req.params.id, function () {
        var data = req.body;
        data.published = data.published ? 1 : 0;
        this.save_localized(req.locale, data, function () {
            redirect(path_to.admin_posts);
        });
    });
});

action('destroy', function () {
});

action('show', function () {
});
