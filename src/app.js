const Koa = require('koa');
const Path = require('path');
const cors = require('kcors');
const serve = require('koa-static');
const logger = require('koa-logger');
const helmet = require('koa-helmet');

const router = require('./routes');
const { fileOutput } = require('./helpers');

const app = new Koa();

const STATIC_PATH = Path.join(__dirname, '../', 'static');
const STATIC_OPTS = {
    maxage: process.env.MAX_AGE || 300000,
    gzip: process.env.COMPRESSION || true,
    // defer: true,
    extensions: true,
    setHeaders: res => res.setHeader('Content-Disposition', 'attachment'),
};

/* Cors */
app.use(cors());

/* Prevent bruteforce */
app.use(helmet());

/* Serve static files */
app.use(serve(STATIC_PATH, STATIC_OPTS));

/* Logs */
// app.use(logger(process.env.NODE_ENV !== 'production' ? fileOutput : null));

/* Errors */
// app.use(async (ctx, next) => {
//     try {
//         await next();
//         const status = ctx.status || 404;
//         if (status === 404) {
//             ctx.throw(404, 'File Not Found');
//         }
//     } catch (err) {
//         ctx.status = err.status || 500;
//         if (ctx.status === 500) {
//             // fileOutput(err.message)
//         }
//         ctx.body = {
//             status: 'error',
//             message: err.message
//         };
//     }
// });

/* Router */
app.use(router.routes());
app.use(router.allowedMethods());

module.exports = app;
