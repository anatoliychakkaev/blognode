function Record () {
    if (!this.title) this.title = '';
};

var localized_fields = ['title', 'preview', 'content'], locales = ['ru', 'en'];

Record.attributes = {
    title: 'string',
    preview: 'string',
    content: 'string',
    slug: 'string'
};
localized_fields.forEach(function (attr) {
    locales.forEach(function (locale) {
        Record.attributes[attr + '-' + locale] = Record.attributes[attr];
    });
});

Record.prototype.link = function () {
    return this.id + '-' + (this.slug || this.title.toLowerCase().replace(/[^\sa-zа-я]/gi, '').replace(/\s+/g, '-'));
};

Record.prototype.localize = function (locale) {
    var post = this;
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
exports.Record = Record;
