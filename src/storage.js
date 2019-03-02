const Storage = require('./models/FStorage');

Storage.setDefaultOpts({
    root_path: '../files',
    is_gzip: true,
    is_uid_key: false,
});

module.exports = Storage;
