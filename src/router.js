const body = require('koa-body');
const Router = require('koa-router');

const {
    tokenAccess,
    storageAccess,
    secretKeyAccess,
} = require('./permissions');
const {
    addFile,
    deleteFile,
    listStorage,
    createStorage,
    restoreAccess,
    deleteStorage,
} = require('./handlers');

const OPTS = {
    body: {
        multipart: true,
    },
};

const router = new Router({
    prefix: '/api/v1',
});

router
    .post('*', body(OPTS.body))
    .param('storage', tokenAccess, storageAccess)

    .post('/new', createStorage)
    .post('/restore', restoreAccess)
    .post('/:storage', addFile)
    .get('/:storage', listStorage)
    .delete('/:storage', secretKeyAccess, deleteStorage)
    .delete('/:storage/:name', deleteFile);

module.exports = router;
