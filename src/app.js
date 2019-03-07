const Koa = require('koa');
const Path = require('path');
const cors = require('kcors');
const body = require('koa-body');
const mount = require('koa-mount');
const serve = require('koa-static');
const helmet = require('koa-helmet');
const logger = require('koa-logger');
const Router = require('koa-router');
const limiter = require('koa2-ratelimit');

const {
    fileStdout,
} = require('./helpers');
const routes = require('./routes');

const IS_DEV = process.env.NODE_ENV !== 'production';

const STATIC_PATH = Path.join(__dirname, '../', 'files');

const OPTS = {
    body: {
        multipart: true,
        formidable: {
            maxFileSize: 100 * 1024 * 1024,
        },
    },
    static: {
        maxage: process.env.MAX_AGE || 300000,
        gzip: process.env.COMPRESSION ? process.env.COMPRESSION : true,
        // defer: true,
        extensions: true,
        // setHeaders: res => res.setHeader('Content-Disposition', 'attachment'),
    },
    ratelimit: {
        interval: 15 * 60 * 1000,
        max: process.env.MAX_REQUESTS_PER_INTERVAL || 33,
        delayAfter: 10,
        timeWait: 3 * 1000,
        skip: () => process.env.NODE_ENV === 'test',
        message: 'Too many requests, please try again after',
    },
};

/* Instances */
const files = new Koa();

const api = new Koa();

const app = new Koa();

/* Serve files */
files.use(serve(STATIC_PATH, OPTS.static));

/* Ratelimit */
api.use(limiter.RateLimit.middleware(OPTS.ratelimit));

/* Bodyparser */
api.use(body(OPTS.body));

/* Logger */
api.use(logger());

/* Errors */
api.use(async (ctx, next) => {
    try {
        await next();
        const status = ctx.status || 404;
        if (status === 404) {
            ctx.throw(404, 'File Not Found');
        }
    } catch (err) {
        ctx.status = err.status || 500;
        if (IS_DEV && ctx.status === 500) {
            fileStdout(err.message);
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

api.use(router.routes());

api.use(router.allowedMethods());

/* Cors */
app.use(cors());

/* Prevent bruteforce */
app.use(helmet());

/* Files */
app.use(mount('/', files));

/* API */
app.use(mount('/api/v1', api));

module.exports = app;
