action('index', function () {
    Record.allInstances({order: 'created_at'}, function (records) {
        records.reverse();
        console.log(records[0].published);
        records = records.filter(function (post) {
            return !!post.published;
        });
        records.forEach(function (r) {
            r.localize(req.locale);
        });
        render({
            title: 'Blog about javascript, nodejs and related technologies',
            records: records,
            meta_description: 'Blog about javascript, nodejs and related technologies, code samples, test driven development',
            meta_keywords: 'nodejs, javascript, tdd, bdd, redis, canvas, express, nodeunit, jake, high load',
            locale: req.locale
        });
    });
});

action('show', function () {
    Record.find(parseInt(req.params.id, 10), function () {
        this.localize(req.locale);
        this.content = require('markdown-js').makeHtml(this.content);
        render({
            title: this.title,
            post: this,
            meta_description: this.preview,
            meta_keywords: 'nodejs, javascript, tdd, bdd, redis, canvas, express, nodeunit, jake, high load',
            locale: req.locale
        });
    });
});

action('map', function () {
    Record.all_instances({order: 'created_at'}, function (records) {
        var root = 'http://node-js.ru/', sitemap = [root];
        records.filter(function (post) {
            return !!post.published;
        }).forEach(function (post) {
            sitemap.push(root + post.link() + '?locale=ru');
            sitemap.push(root + post.link() + '?locale=en');
        });
        send(sitemap.join("\n"));
    });
});

