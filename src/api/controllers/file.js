const fs = require('fs');
const debug = require('debug')('fstorage:uploading');

const Storage = require('../storage');

async function createFile(ctx) {
    // ctx.req.pipe(storage.putStream('filename.jpg'));
    //     // .on('data', (chunk) => {
    //     //     str += chunk;
    //     //     console.log(str.length);
    //     // });
    //     // .on('error', console.log)
    //     ctx.req.on('end', (res) => {
    //         console.log(res);
    //     });
    // ctx.body = {};

    // TODO: upload streams without formData

    const files = Object.values(ctx.request.files);

    // check files presence
    if (files.length === 0) {
        ctx.throw(400, 'No files');
    }

    const storage = Storage.find(ctx.params.storage);

    // storage processing
    const operations = files.map(async (file) => {
        const type = file.type.split('/');

        // const ext = type[1] || Path.extname(file.name).slice(1);

        const filename = `${storage.genName()}_${file.name}.${type[1]}`;

        fs.createReadStream(file.path).pipe(storage.putStream(filename));

        debug('%ib %s => %s', file.size, filename, storage.name);

        return `${ctx.protocol}://${ctx.get('host')}/${storage.name}/${filename}`;
    });

    const links = await Promise.all(operations);

    ctx.body = {
        ok: true,
        data: links,
    };
}

async function getFile(ctx) {
    const {
        file: name,
        storage: storageName,
    } = ctx.params;

    // get stat
    const data = await Storage.find(storageName).stat(name);

    ctx.body = {
        ok: true,
        data,
    };
}

async function updateFile(ctx) {
    // TODO: ?processing
    const {
        name: newName,
        private: isPrivate,
    } = ctx.request.body;

    const {
        file: name,
        storage: storageName,
    } = ctx.params;

    const storage = Storage.find(storageName);

    let data;

    // update storage
    if (isPrivate === true) {
        await storage.hide(name);
    }

    if (isPrivate === false) {
        await storage.unhide(name);
    }

    if (newName) {
        data = await storage.rename(name, newName);
    }

    ctx.body = {
        ok: true,
        ...(data && {
            data
        }),
    };
}

async function deleteFile(ctx) {
    const {
        file: name,
        storage: storageName,
    } = ctx.params;

    // remove file
    await Storage.find(storageName).pop(name);

    debug('deleting %s <= %s', name, storageName);

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
