const debug = require('debug')('fstorage');

const {
    encodeToken,
} = require('../permissions');
const Storage = require('../storage');

function createStorage(ctx) {
    const {
        email,
        tokenDayout,
        private: isPrivate = false,
        name = ctx.hostname.split('.')[0],
    } = ctx.request.body;

    // check storage existence
    if (Storage.isExist(name)) {
        ctx.throw(422, `The storage ${name} allready in use`);
    }

    // create storage
    const storage = new Storage(name, isPrivate);

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
        name: storageName = ctx.hostname.split('.')[0],
    } = ctx.request.body;

    // check storage existence
    if (!Storage.exist(storageName)) {
        ctx.throw(422, `The storage ${storageName} not in use`);
    }

    // check secret key
    if (!Storage.validKey(storageName, secretKey)) {
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
    const data = Storage.find(name).list();

    ctx.body = {
        ok: true,
        data,
    };
}

function updateStorage(ctx) {
    const {
        empty,
        private: isPrivate,
    } = ctx.request.body;

    const {
        storage: name,
    } = ctx.params;

    const storage = Storage.find(name);

    // update storage
    if (empty) {
        storage.clear();
    }

    if (isPrivate) {
        storage.private();
    }

    ctx.body = {
        ok: true,
    };
}

function deleteStorage(ctx) {
    const {
        storage: name,
    } = ctx.params;

    // delete storage
    Storage.find(name).destroy();

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
