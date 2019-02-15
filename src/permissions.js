const moment = require('moment');
const jwt = require('jwt-simple');

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
    const {
        key,
        exp,
        storage,
    } = jwt.decode(token, process.env.TOKEN_SECRET);
    if (exp) {
        const now = moment().unix();
        if (now > exp) {
            throw new Error('Token has expired');
        }
    }
    return {
        key,
        storage,
    };
}

async function tokenAccess(ctx, next) {
    const token = ctx.headers['x-access-token'] || ctx.query.access_token;
    if (!token) {
        ctx.throw(401, 'No access token');
    }

    ctx.state = await decodeToken(token);
    await next();
}

async function storageAccess(ctx, next) {
    if (ctx.state.storage !== ctx.params.storage) {
        ctx.throw(403, 'Storage is not accessible');
    }
    await next();
}

async function secretKeyAccess(ctx, next) {
    if (!ctx.request.body.secretKey) {
        ctx.throw(403, 'Secret key not provided');
    }
    await next();
}

module.exports = {
    encodeToken,
    tokenAccess,
    storageAccess,
    secretKeyAccess,
};
