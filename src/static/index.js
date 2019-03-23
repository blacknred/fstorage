const Koa = require('koa');
const url = require('url');
const Path = require('path');
const stream = require('stream');
const serve = require('koa-static');
const exists = require('fs').existsSync;

const {
    processor,
    PROCESSABLE_EXT,
} = require('../processor');
const config = require('../../config');

const OPTS = {
    maxage: config.max_age,
    gzip: config.is_gzip,
    defer: !config.is_on_fly_process,
    extensions: true,
    // setHeaders: res => res.setHeader('Content-Disposition', 'attachment'),
};

const app = new Koa();

/* Serve */
app.use(serve(config.static_path, OPTS));

/* On fly processing */
app.use(async (ctx, next) => {
    const urlParts = url.parse(ctx.originalUrl, true);

    if (urlParts.query.d || urlParts.query.download) {
        ctx.attachment(urlParts.pathname);
        delete (urlParts.query.d || urlParts.query.download);
    }

    if (Object.keys(urlParts.query).length) {
        const parsed = Path.parse(urlParts.pathname);
        const ext = parsed.ext.slice(1);

        if (PROCESSABLE_EXT.includes(ext)) {
            const path = Path.join(config.static_path, urlParts.pathname);

            if (!ctx.accepts(ext)) {
                ctx.throw(406);
            }

            ctx.type = ext;

            if (ctx.response.get('Content-Disposition') &&
                PROCESSABLE_EXT.includes(urlParts.query.f)) {
                    ctx.attachment(`${parsed.name}.${urlParts.query.f}`);
            }

            if (exists(path)) {
                ctx.body = stream.PassThrough();
                (await processor(path, urlParts.query, ext, true)).pipe(ctx.body);

                // ctx.respond = false;
                // (processor(path, urlParts.query, ext, true)).pipe(ctx.res);
            }
        }
    }
    // download prevent Output stream closed

    await next();
});

module.exports = app;
