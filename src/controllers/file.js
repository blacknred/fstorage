const fs = require('fs');
const debug = require('debug')('fstorage:uploading');
const pipeline = require('util').promisify(require('stream').pipeline);

const Storage = require('../storage');

const {
    formats,
    processImage,
    processVideo,
    imageMetadata,
    resizeImage,
    resizeVideo,
    resizeVideoRaw,
    formatToVideoRaw,
    formatToImage,
    formatToVideo,
} = require('../processing');

const BUNCH = false;

async function createFile(ctx) {
    const files = Object.values(ctx.request.files);

    // check files presence
    if (files.length === 0) {
        ctx.throw(400, 'No files');
    }

    const opts = {
        width: parseInt(ctx.query.w, 10) || null,
        height: parseInt(ctx.query.h, 10) || null,
        format: ctx.query.f,
        metadata: ctx.query.meta,
    };

    const storage = Storage.find(ctx.params.storage);

    const links = [];

    // process files
    // eslint-disable-next-line
    for (const file of files) {
        const type = file.type.split('/');

        const transformers = [];

        if (BUNCH) {
            // metadata
            if (opts.metadata && type[0] === 'image') {
                transformers.push(imageMetadata());
            }

            // resize
            if (opts.width || opts.height) {
                if (type[0] === 'image') {
                    transformers.push(resizeImage(opts.width, opts.height));
                }
                if (type[0] === 'video') {
                    transformers.push(resizeVideoRaw(opts.width, opts.height));
                }
            }

            // format
            if (formats.image.includes(opts.format)) {
                type[1] = opts.format;
                transformers.push(formatToImage(opts.format));
            }
            if (formats.video.includes(opts.format)) {
                type[1] = opts.format;
                transformers.push(formatToVideoRaw(opts.format));
            }
        } else {
            if (type[0] === 'image' && formats.image.includes(opts.format || 'png')) {
                transformers.push(processImage(file.path, opts));
            } else if (type[0] === 'video') {
                if (!opts.format) {
                    opts.format = type[1];  ``
                }
                transformers.push(processVideo(file.path, opts));
            } else {
                transformers.push(fs.createReadStream(file.path));
            }

            if (opts.format) {
                type[1] = opts.format;
            }
        }


        const filename = `${storage.genName()}_${file.name}.${type[1]}`;

        try {
            // eslint-disable-next-line
            await pipeline(
                // fs.createReadStream(file.path),
                ...transformers,
                storage.putStream(filename),
            );
        } catch (e) {
            ctx.throw(400, e);
        }

        // update response
        links.push(`${ctx.protocol}://${ctx.get('host')}/${storage.name}/${filename}`);

        debug('%ib %s to %s', file.size, filename, storage.name);
    }

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