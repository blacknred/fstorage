const {
    fileAccess,
    storageAccess,
} = require('./permissions');
const {
    getFile,
    createFile,
    updateFile,
    deleteFile,
} = require('./controllers/file');
const {
    getStorage,
    createStorage,
    updateStorage,
    deleteStorage,
    createNewToken,
} = require('./controllers/storage');

module.exports = [
    {
        path: 'storage',
        method: 'param',
        action: storageAccess,
    },
    {
        path: 'file',
        method: 'param',
        action: fileAccess,
    },
    {
        path: '/new',
        method: 'post',
        action: createStorage,
    },
    {
        path: '/token',
        method: 'post',
        action: createNewToken,
    },
    {
        path: '/:storage',
        method: 'post',
        action: createFile,
    },
    {
        path: '/:storage',
        method: 'get',
        action: getStorage,
    },
    {
        path: '/:storage/:file',
        method: 'get',
        action: getFile,
    },
    {
        path: '/:storage',
        method: 'put',
        action: updateStorage,
    },
    {
        path: '/:storage/:file',
        method: 'put',
        action: updateFile,
    },
    {
        path: '/:storage',
        method: 'delete',
        action: deleteStorage,
    },
    {
        path: '/:storage/:file',
        method: 'delete',
        action: deleteFile,
    },
];
