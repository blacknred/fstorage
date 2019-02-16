const body = require('koa-body');
const Router = require('koa-router');
const { RateLimit: { middleware: limiter } } = require('koa2-ratelimit');

const {
    addFile,
    deleteFile,
    listStorage,
    createStorage,
    restoreAccess,
    deleteStorage,
} = require('./handlers');
const {
    fileAccess,
    tokenAccess,
    storageAccess,
} = require('./permissions');

const OPTS = {
    body: {
        multipart: true,
    },
    ratelimit: {
        interval: 15 * 60 * 1000,
        max: process.env.MAX_REQUESTS_PER_INTERVAL || 33,
        delayAfter: 1,
        timeWait: 3 * 1000,
        skip: () => process.env.NODE_ENV === 'test',
        message: 'Too many requests, please try again after',
    },
};

const router = new Router({
    prefix: '/api/v1',
});

router
    .all('*', limiter(OPTS.ratelimit))
    .post('*', body(OPTS.body))
    .param('storage', tokenAccess, storageAccess)
    .param('file', fileAccess)

    .post('/new', createStorage)
    .post('/restore', restoreAccess)
    .post('/:storage', addFile)
    .get('/:storage', listStorage)
    .delete('/:storage', deleteStorage)
    .delete('/:storage/:file', deleteFile);

module.exports = router;
