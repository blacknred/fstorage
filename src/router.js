const zlib = require('zlib');
const body = require('koa-body');
const Router = require('koa-router');
const compress = require('koa-compress');

const {
    checkAuth,
} = require('./auth');
const {
    createToken,
    serveFile,
    deleteFile,
} = require('./handlers');

const OPTS = {
    body: {
        multipart: true,
    },
    compress: {
        filter: (contentType) => {
            return /jpg/i.test(contentType);
        },
        threshold: 2048,
        flush: zlib.Z_SYNC_FLUSH,
    },
};

const router = new Router({
    prefix: '/api/v1',
});

router
    .post('/token', body(OPTS.body), createToken)
    .post('/serve', checkAuth, body(OPTS.body), compress(OPTS.compress), serveFile)
    .del('/:name', checkAuth, deleteFile);

module.exports = router;
