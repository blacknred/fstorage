const debug = require('debug')('fstorage');

const {
    encodeToken,
} = require('../permissions');
const Storage = require('../storage');

function createStorage(ctx) {
    const {
        email,
        tokenDayout,
        name = ctx.hostname.split('.')[0],
    } = ctx.request.body;

    // check storage existence
    if (Storage.exists(name)) {
        ctx.throw(422, `The storage ${name} allready in use`);
    }

    // create storage
    const storage = new Storage(name);

    // gen token
    const accessToken = encodeToken(name, storage.key, tokenDayout);

    // send email
    if (email) {
        // TODO: nodemailer: sent credentials to email
    }

    debug('creating storage %s', name);

    ctx.status = 201;
    ctx.body = {
        ok: true,
        data: {
            name,
            accessToken,
            secretKey: storage.key,
        },
    };
}

function createNewToken(ctx) {
    const {
        email,
        secretKey,
        tokenDayout,
        name = ctx.hostname.split('.')[0],
    } = ctx.request.body;

    // check storage existence
    if (!Storage.exists(name)) {
        ctx.throw(422, `The storage ${name} not in use`);
    }

    // check secret key
    if (Storage.find(name).key !== parseInt(secretKey, 10)) {
        ctx.throw(403, 'Secret key is not valid');
    }

    // gen new token
    const accessToken = encodeToken(name, secretKey, tokenDayout);

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

async function getStorage(ctx) {
    // get files
    const data = await Storage.find(ctx.params.storage).list();

    ctx.body = {
        ok: true,
        data,
    };
}

async function updateStorage(ctx) {
    const {
        empty,
        private: isPrivate,
    } = ctx.request.body;

    const storage = Storage.find(ctx.params.storage);

    // update storage
    if (empty) {
        await storage.clear();
    }

    if (isPrivate === true) {
        await storage.private();
    }

    if (isPrivate === false) {
        await storage.public();
    }

    ctx.body = {
        ok: true,
    };
}

async function deleteStorage(ctx) {
    const {
        storage: name,
    } = ctx.params;

    // delete storage
    await Storage.find(name).destroy();

    debug('deleting storage %s', name);

    ctx.body = {
        ok: true,
    };
}

module.exports = {
    getStorage,
    createStorage,
    updateStorage,
    deleteStorage,
    createNewToken,
};
