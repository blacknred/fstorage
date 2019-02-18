const moment = require('moment');
const jwt = require('jwt-simple');

const Storage = require('./models/FStorage');

function encodeToken(name, key, days) {
    const payload = {
        key,
        storage: name,
    };
    if (days) {
        payload.exp = moment().add(days, 'days').unix();
    }

    return jwt.encode(payload, process.env.TOKEN_SECRET);
}

function decodeToken(token) {
    return jwt.decode(token, process.env.TOKEN_SECRET);
}

async function storageAccess(storage, ctx, next) {
    if (!Storage.exist(storage)) {
        ctx.throw(422, 'The storage not exist');
    }

    const token = ctx.headers['x-access-token'] || ctx.query.access_token;

    if (!token) {
        ctx.throw(401, 'No access token');
    }

    let payload;
    try {
        payload = await decodeToken(token);
    } catch (e) {
        ctx.throw(403, 'Invalid access token');
    }

    const {
        exp,
        ...rest
    } = payload;
    if (exp) {
        const now = moment().unix();
        if (now > exp) {
            ctx.throw(403, 'Access token has expired');
        }
    }

    if (rest.storage !== storage) {
        ctx.throw(403, 'Storage is not accessible');
    }

    ctx.state = rest;

    await next();
}

async function fileAccess(file, ctx, next) {
    const {
        storage,
    } = ctx.params;

    if (!Storage.exist(storage, file)) {
        ctx.throw(422, 'The file not exist');
    }

    await next();
}

module.exports = {
    encodeToken,
    storageAccess,
    fileAccess,
};
