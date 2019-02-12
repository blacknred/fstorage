const Koa = require('koa');
const zlib = require('zlib');
const path = require('path');
const cors = require('kcors');
const serve = require('koa-static');
const koaBody = require('koa-body');
const logger = require('koa-logger');
const helmet = require('koa-helmet');
const compress = require('koa-compress');
const userAgent = require('koa-useragent');

const router = require('./router');

const app = new Koa();

/* Logs */
app.use(logger());

/* Serve static files */
app.use(serve(path.join(__dirname, '../', 'static')));
app.use(async (ctx, next) => {
    ctx.set('Content-Disposition', 'attachment');
    await next();
});

/* Body, multipart */
app.use(koaBody({ multipart: true }));

/* Cors */
app.use(cors()); // { origin: 'http://localhost:3000'}

/* Prevent bruteforce */
app.use(helmet());

/* User Agent */
app.use(userAgent);

/* Compressing */
app.use(compress({
    filter: (contentType) => {
        return /text/i.test(contentType);
    },
    threshold: 2048,
    flush: zlib.Z_SYNC_FLUSH
}));

/* Errors */
app.use(async (ctx, next) => {
    try {
        await next();
        const status = ctx.status || 404;
        if (status === 404) {
            ctx.throw(404, 'File Not Found');
        }
    } catch (err) {
        ctx.status = err.status || 500;
        ctx.body = {
            status: 'error',
            message: err.message
        };
    }
});

/* Router */
app.use(router);

module.exports = app;

