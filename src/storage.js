const Storage = require('./models/FStorage');

Storage.setDefaultOpts({
    root_path: '../../../files',
    is_gzip: false,
    is_uid_key: false,
});

module.exports = Storage;
