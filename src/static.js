const Koa = require('koa');
const serve = require('koa-static');

const config = require('../config');
const {
    isProcessable
 } = require('./models/processor');

const OPTS = {
    maxage: config.max_age,
    gzip: config.is_gzip,
    defer: true,
    extensions: true,
    // setHeaders: res => res.setHeader('Content-Disposition', 'attachment'),
};

const files = new Koa();

/* Serve */
files.use(serve(config.static_path, OPTS));

/* On fly processing */
files.use(async (ctx, next) => {
    if (isProcessable) {
        // process file and send stream
        ctx.body = {};
    }

    await next();
});
