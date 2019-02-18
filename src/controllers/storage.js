const debug = require('debug')('fstorage');

const {
    encodeToken,
} = require('../permissions');
const Storage = require('../models/FStorage');

function createStorage(ctx) {
    const {
        email,
        tokenDayout,
        private: isPrivate = true,
        name = ctx.hostname.split('.')[0],
    } = ctx.request.body;

    // check storage existence
    if (Storage.exist(name)) {
        ctx.throw(422, `The storage ${name} allready in use`);
    }

    // instance
    const storage = new Storage(name, isPrivate);

    // create storage
    storage.create();

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
            secretKey,
            accessToken,
            storageName,
        },
    };
}

function createNewToken(ctx) {
    const {
        email,
        secretKey,
        tokenDayout,
        name: storageName = ctx.hostname.split('.')[0],
    } = ctx.request.body;

    // check storage existence
    if (!Storage.exist(storageName)) {
        ctx.throw(422, `The storage ${storageName} not in use`);
    }

    // check secret key
    if (!Storage.checkKey(storageName, secretKey)) {
        ctx.throw(403, 'Secret key is not valid');
    }

    // gen new token
    const accessToken = encodeToken(storageName, secretKey, tokenDayout);

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

function getStorage(ctx) {
    const {
        storage: name,
    } = ctx.params;

    // get files
    const data = Storage.list(name);

    ctx.body = {
        ok: true,
        data,
    };
}

function updateStorage(ctx) {
    const opts = {
        private: ctx.request.body.private,
        empty: ctx.request.body.empty,
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

function deleteStorage(ctx) {
    const {
        storage: name,
    } = ctx.params;

    // delete storage
    Storage.destroy(name);

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
