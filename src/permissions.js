const moment = require('moment');
const jwt = require('jwt-simple');

const { isExists } = require('./helpers');

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

async function tokenAccess(ctx, next) {
    console.log(ctx, next);
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
            ctx.throw(403, 'Token has expired');
        }
    }

    ctx.state = rest;

    await next();
}

async function storageAccess(ctx, next) {
    const { storage: storageName } = ctx.params;

    if (!isExists(storageName)) {
        ctx.throw(422, 'The storage not exist');
    }

    if (ctx.state.storage !== storageName) {
        ctx.throw(403, 'Storage is not accessible');
    }

    await next();
}

async function fileAccess(ctx, next) {
    const {
        name: fileName,
        storage: storageName,
    } = ctx.params;

    if (!isExists(storageName, fileName)) {
        ctx.throw(422, 'The file not exist');
    }

    await next();
}

module.exports = {
    encodeToken,
    tokenAccess,
    storageAccess,
    fileAccess,
};
