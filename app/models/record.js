var localized_fields = ['title', 'preview', 'content'],
    locales          = ['ru', 'en'];

var Record = describe('Record', function () {
    property('title',   String);
    property('preview', String);
    property('content', String);
    property('slug',    String);
    property('published', Boolean);
    property('created_at', Date);

    localized_fields.forEach(function (attr) {
        locales.forEach(function (locale) {
           property(attr + '-' + locale, String);
        });
    });
});

Record.prototype.disqusId = function () {
    if (this.locale == 'ru') {
        return this.id;
    } else {
        return this.id + 10000;
    }
};

Record.prototype.link = function () {
    return this.id + '-' + (this.slug || this.title.toLowerCase().replace(/[^\sa-zа-я]/gi, '').replace(/\s+/g, '-'));
};

Record.prototype.localize = function (locale) {
    var post = this;
    post.locale = locale;
    localized_fields.forEach(function (attr) {
        if (post[attr + '-' + locale]) {
            post[attr] = post[attr + '-' + locale];
        }
    });
};

function localize_data (locale, data) {
    localized_fields.forEach(function (attr) {
        if (data[attr]) {
            data[attr + '-' + locale] = data[attr];
            delete data[attr];
        }
    });
    return data;
}
Record.prototype.save_localized = function (locale, data, callback) {
    this.save(localize_data(locale, data), callback);
};
Record.create_localized = function (locale, data, callback) {
    return Record.create(localize_data(locale, data), callback);
};
