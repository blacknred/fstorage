const moment = require('moment');
const jwt = require('jwt-simple');

function encodeToken(userId) {
    const playload = {
        exp: moment().add(14, 'days').unix(),
        iat: moment().unix(),
        sub: userId,
    };
    return jwt.encode(playload, process.env.TOKEN_SECRET);
}

function decodeToken(token, callback) {
    const payload = jwt.decode(token, process.env.TOKEN_SECRET);
    const now = moment().unix();
    if (now > payload.exp) callback('Token has expired.');
    else callback(null, payload);
}

async function checkAuth(ctx, next) {
    if (process.env.NODE_ENV === 'test') {
        ctx.state.consumer = 1;
        await next();
    }

    const token = ctx.headers['x-access-token'] || ctx.query.access_key;
    if (!token) {
        ctx.throw(401, 'No access token');
    }

    // decode the token
    decodeToken(token, async (err, payload) => {
        if (err) {
            ctx.throw(401, payload);
        }

        ctx.state.consumer = parseInt(payload.sub, 10);
        await next();
    });
}

module.exports = checkAuth;
