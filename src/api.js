const Koa = require('koa');
const body = require('koa-body');
const logger = require('koa-logger');
const Router = require('koa-router');
const limiter = require('koa2-ratelimit');

const routes = require('./routes');
const helpers = require('./helpers');
const config = require('../config');

const OPTS = {
    body: {
        multipart: true,
        formidable: {
            maxFileSize: config.max_file_size,
        },
    },
    ratelimit: {
        interval: config.max_requests_interval,
        max: config.max_requests_per_interval,
        delayAfter: 10,
        timeWait: 3 * 1000,
        // skip: () => {},
        message: 'Too many requests, please try again after',
    },
};

const app = new Koa();

/* Ratelimit */
app.use(limiter.RateLimit.middleware(OPTS.ratelimit));

/* Bodyparser */
app.use(body(OPTS.body));

/* Logger */
app.use(logger());

/* Errors */
app.use(async (ctx, next) => {
    try {
        await next();
        const status = ctx.status || 404;
        if (status === 404) {
            ctx.throw(404, 'Not Found');
        }
    } catch (err) {
        ctx.status = err.status || 500;
        if (config.is_dev && ctx.status === 500) {
            helpers.fileStdout(err.message);
        }
        ctx.body = {
            status: 'error',
            message: err.message
        };
    }
});

/* Router */
const router = new Router();

routes.forEach(route => router[route.method](route.path, route.action));

app.use(router.routes());

app.use(router.allowedMethods());

module.exports = app;
