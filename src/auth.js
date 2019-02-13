const moment = require('moment');
const jwt = require('jwt-simple');

function encodeToken(sub, days) {
    const payload = {
        sub,
    };
    if (days) {
        payload.exp = moment().add(days, 'days').unix();
    }

    return jwt.encode(payload, process.env.TOKEN_SECRET);
}

function decodeToken(token) {
    const payload = jwt.decode(token, process.env.TOKEN_SECRET);
    if (payload.exp) {
        const now = moment().unix();
        if (now > payload.exp) {
            throw new Error('Token has expired');
        }
    }
    return payload.sub;
}

async function checkAuth(ctx, next) {
    if (process.env.NODE_ENV === 'test') {
        await next();
    }

    const key = ctx.headers['x-access-key'] || ctx.query.access_key || ctx.ip;
    const token = ctx.headers['x-access-token'] || ctx.query.access_token;
    if (!token) {
        ctx.throw(401, 'No access token');
    }

    const sub = await decodeToken(token);
    if (sub !== key) {
        ctx.throw(403, 'Permission denied');
    }
    await next();
}

module.exports = {
    encodeToken,
    checkAuth,
};
