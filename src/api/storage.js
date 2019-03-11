const config = require('../../config');
const Storage = require('./models/storage');

Storage.setDefaultOpts({
    root_path: config.static_path,
    is_gzip: false,
    is_uid_key: false,
});

module.exports = Storage;
