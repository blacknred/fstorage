const http = require('http');
const debug = require('debug')('fstorage:server');

const {
    fileStderr,
} = require('./helpers');
const app = require('./app');

function normalizePort(val) {
    const port = parseInt(val, 10);

    if (isNaN(port)) return val;

    if (port >= 0) return port;

    return false;
}

const port = normalizePort(process.env.PORT || '3000');

function onError(error) {
    if (error.syscall !== 'listen') throw error;

    const bind = typeof port === 'string' ?
        `Pipe ${port}` :
        `Port ${port}`;

    switch (error.code) {
        case 'EACCES':
            debug(`${bind} requires elevated privileges`);
            process.exit(1);
            break;
        case 'EADDRINUSE':
            debug(`${bind} is allready in use`);
            process.exit(1);
            break;
        default:
            throw error;
    }
}

const server = http.createServer(app.callback());

function onListening() {
    const addr = server.address();

    const bind = typeof addr === 'string' ? `pipe ${port}` : `port ${port}`;

    debug(`🚀  on ${bind}`);
}

process.on('uncaughtException', (err) => {
    debug('uncaughtException: ', err.message);

    debug(err.stack);

    fileStderr(err.message, 'uncaughtException');

    process.exit(1);
});

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
