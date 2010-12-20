function Record () {
    if (!this.title) this.title = '';
};
Record.attributes = {
    title: 'string',
    preview: 'string',
    content: 'string'
};

Record.prototype.link = function () {
    return this.id + '-' + this.title.toLowerCase().replace(/[^\sa-z]/g, '').replace(/\s+/g, '-');
};
exports.Record = Record;
