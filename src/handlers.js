const debug = require('debug')('fstorage:handlers');

const {
    encodeToken,
} = require('./permissions');
const {
    readDir,
    checkKey,
    saveFile,
    isExists,
    createDir,
    createKey,
    deleteDir,
    deleteKey,
    generateName,
} = require('./helpers');
const {
    processImage,
    processVideo,
} = require('./processing');

function createStorage(ctx) {
    const {
        dayspan,
        email,
        name: storageName = ctx.hostname.split('.')[0],
    } = ctx.request.body;

    if (isExists(storageName)) {
        ctx.throw(422, `The storage ${storageName} allready in use`);
    }

    // create storage
    createDir(storageName);

    // gen secret key
    const secretKey = createKey(storageName);

    // gen token
    const accessToken = encodeToken(storageName, secretKey, dayspan);

    // send email
    if (email) {
        // TODO: nodemailer: sent credentials to email
    }

    debug('creating %s', storageName);

    ctx.status = 201;
    ctx.body = {
        ok: true,
        data: {
            secretKey,
            accessToken,
            storageName,
        },
    };
}

function restoreAccess(ctx) {
    const {
        dayspan,
        email,
        secretKey,
        name: storageName = ctx.hostname.split('.')[0],
    } = ctx.request.body;

    // check dir existance
    if (!isExists(storageName)) {
        ctx.throw(422, `The storage ${storageName} not in use`);
    }

    // check secret key
    if (!checkKey(storageName, secretKey)) {
        ctx.throw(403, 'Secret key is not valid');
    }

    // gen new token
    const accessToken = encodeToken(storageName, secretKey, dayspan);

    // send email
    if (email) {
        // TODO: nodemailer: sent credentials to email
    }

    ctx.status = 201;
    ctx.body = {
        ok: true,
        data: {
            accessToken,
        },
    };
}

function listStorage(ctx) {
    const { storage: storageName } = ctx.params;

    // get files
    const data = readDir(storageName);

    ctx.body = {
        ok: true,
        data,
    };
}

function deleteStorage(ctx) {
    const { storage: storageName } = ctx.params;
    const { key: secretKey } = ctx.state;

    // delete storage
    deleteDir(storageName);

    // delete secretKey
    deleteKey(secretKey);

    debug('deleting %s', storageName);

    ctx.body = {
        ok: true,
    };
}

function deleteFile(ctx) {
    const {
        file: fileName,
        storage: storageName,
    } = ctx.params;

    // remove file
    deleteFile(storageName, fileName);

    debug('deleting %s from %s', fileName, storageName);

    ctx.body = {
        ok: true,
    };
}

async function addFile(ctx) {
    const opts = {
        thumb: ctx.query.thumb || true,
        format: ctx.query.format || true,
        versions: ctx.query.versions || false,
    };

    const { storage: storageName } = ctx.params;

    const files = Object.values(ctx.request.files);

    const data = [];

    // check files presence
    if (files.length === 0) {
        ctx.throw(400, 'No files');
    }

    files.forEach(async (file) => {
        const filename = generateName();

        let processed;

        // process file
        switch (file.type.split('/')[0]) {
            case 'video':
                processed = await processVideo(file.path, file.name, opts);
                break;
            case 'image':
                if (file.type === 'image/gif' && opts.format) {
                    processed = await processVideo(file.path, file.name, opts);
                } else {
                    processed = await processImage(file.path, file.name, opts);
                }
                break;
            default:
        }

        // save files
        Object.keys(processed).forEach(async (ext) => {
            const filepath = await saveFile(processed[key], storageName, filename + ext);

            // form result
            links.push(`${ctx.protocol}://${ctx.get('host')}/${filepath}`);
        })

        // // save files
        // const filepath = await saveFile(processed[''], storageName, filename + ext);
        // links.file = `${ctx.protocol}://${ctx.get('host')}/${filepath}`;
        // if (opts.thumb) {
        //     const filepath = await saveFile(processed[''], storageName, filename + ext);
        //     links.thumb = `${ctx.protocol}://${ctx.get('host')}/${filepath}`;
        // }
        // if (opts.versions) {
        //     Object.keys(processed).forEach(async (ext) => {
        //         const filepath = await saveFile(processed[key], storageName, filename + ext);
        //         links.versions.push(`${ctx.protocol}://${ctx.get('host')}/${filepath}`);
        //     });
        // }

        // update response
        data.push(links);

        debug('uploading %i %s ->  %s', file.size, file.name, storageName);
        
    });

    ctx.body = {
        ok: true,
        data,
    };
}

module.exports = {
    addFile,
    deleteFile,
    listStorage,
    deleteStorage,
    createStorage,
    restoreAccess,
};
