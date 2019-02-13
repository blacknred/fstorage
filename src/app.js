const Koa = require('koa');
const Path = require('path');
const cors = require('kcors');
const serve = require('koa-static');
const logger = require('koa-logger');
const helmet = require('koa-helmet');

const router = require('./router');

const app = new Koa();

/* Logs */
app.use(logger());

/* Cors */
app.use(cors());

/* Prevent bruteforce */
app.use(helmet());

/* Serve static files */
app.use(serve(Path.join(__dirname, '../', 'static'), {
    maxAge: 30,
    gzip: true,
    // defer: true,
    setHeaders: res => res.setHeader('Content-Disposition', 'attachment'),
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
app.use(router.routes());
app.use(router.allowedMethods());

// app.use(function* () {
//     if (this.req.checkContinue) this.res.writeContinue();
//     const body = yield parse(this);
// });

module.exports = app;

