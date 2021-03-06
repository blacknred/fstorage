const url = require('url');
const Koa = require('koa');
const serve = require('koa-static');

const config = require('../../config');

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

/*  */
app.use(async (ctx, next) => {
    // download prevents output stream closing
    if (ctx.query.dl || ctx.query.download) {
        ctx.attachment(url.parse(ctx.path, true).pathname);
    }

    await next();
});


module.exports = app;
