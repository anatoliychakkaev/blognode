module.exports = {
    index: function (req, next) {
        Record.all_instances({order: 'created_at'}, function (records) {
            records.reverse();
            records.forEach(function (r) {
                r.localize(req.locale);
            });
            next('render', {
                title: 'Blog about javascript, nodejs and related technologies',
                records: records,
                meta_description: 'Blog about javascript, nodejs and related technologies, code samples, test driven development',
                meta_keywords: 'nodejs, javascript, tdd, bdd, redis, canvas, express, nodeunit, jake, high load',
                locale: req.locale
            });
        });
    },
    show: function (req, next) {
        Record.find(parseInt(req.params.id, 10), function () {
            this.localize(req.locale);
            this.content = require('markdown-js').makeHtml(this.content);
            next('render', {
                title: this.title,
                post: this,
                meta_description: this.preview,
                meta_keywords: 'nodejs, javascript, tdd, bdd, redis, canvas, express, nodeunit, jake, high load',
                locale: req.locale
            });
        });
    },
    map: function (req, next) {
        Record.all_instances({order: 'created_at'}, function (records) {
            var root = 'http://node-js.ru/', sitemap = [root];
            records.forEach(function (post) {
                sitemap.push(root + post.link() + '?locale=ru');
                sitemap.push(root + post.link() + '?locale=en');
            });
            next('send', sitemap.join("\n"));
        });
    }
};
