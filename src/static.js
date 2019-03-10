const Koa = require('koa');
const url = require('url');
const Path = require('path');
const serve = require('koa-static');

const {
    processor,
    PROCESSABLE_EXT,
} = require('./models/processor');
const config = require('../config');

const OPTS = {
    maxage: config.max_age,
    gzip: config.is_gzip,
    defer: true,
    extensions: true,
    // setHeaders: res => res.setHeader('Content-Disposition', 'attachment'),
};

const app = new Koa();

/* Serve */
app.use(serve(config.static_path, OPTS));

/* On fly processing */
app.use(async (ctx, next) => {
    const opts = url.parse(ctx.originalUrl, true).query;

    if (Object.keys(opts).length) {
        if (PROCESSABLE_EXT.includes(Path.extname(ctx.originalUrl).slice(1))) {
            // process file and send stream
            ctx.body = processor(Path.resolve(__dirname, ctx.originalUrl), opts);
        }
    }

    await next();
});

module.exports = app;
