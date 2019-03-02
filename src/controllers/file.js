const debug = require('debug')('fstorage');

const File = require('../models/File');

const Storage = require('../storage');

async function createFile(ctx) {
    const opts = {
        thumb: ctx.query.thumb || true,
        format: ctx.query.format || true,
        versions: ctx.query.versions || false,
    };

    const {
        storage: storageName
    } = ctx.params;

    const files = ctx.request.files;

    const data = [];

    // check files presence
    if (Object.keys(files).length === 0) {
        ctx.throw(400, 'No files');
    }
    
    for (let filedata of files) {
        // create file
        const file = new File(filedata, opts);

        // process file
        file.process();

        // save file
        const paths = file.saveTo(storageName);

        // update response
        data.push(paths.map(path => `${ctx.protocol}://${ctx.get('host')}/${path}`));

        debug('uploading %i %s to  %s', file.size, file.name, storageName);
    }

    ctx.body = {
        ok: true,
        data,
    };
}

function getFile(ctx) {
    const {
        file: name,
        storage: storageName,
    } = ctx.params;

    // get stat
    const data = Storage.find(storageName).stat(name);

    ctx.body = {
        ok: true,
        data,
    };
}

function updateFile(ctx) {
    const opts = {
        private: ctx.request.body.private,
    };

    const {
        storage: name,
    } = ctx.params;

    // update storage
    Storage.update(name, opts);

    ctx.body = {
        ok: true,
    };
}

function deleteFile(ctx) {
    const {
        file: name,
        storage: storageName,
    } = ctx.params;

    // remove file
    Storage.find(storageName).pop(name);

    debug('deleting %s from %s', name, storageName);

    ctx.body = {
        ok: true,
    };
}

module.exports = {
    getFile,
    createFile,
    updateFile,
    deleteFile,
};
