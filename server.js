const http = require('http');
// const cpus = require('os').cpus();
// const cluster = require('cluster');
const debug = require('debug')('storage:server');

const app = require('./app');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

function normalizePort(val) {
    const port = parseInt(val, 10);
    if (isNaN(port)) return val;
    if (port >= 0) return port;
    return false;
}

const port = normalizePort(process.env.PORT || '3000');

function onError(error) {
    if (error.syscall !== 'listen') throw error;
    switch (error.code) {
        case 'EACCES': process.exit(1); break;
        case 'EADDRINUSE': process.exit(1); break;
        default: throw error;
    }
}

/* Clustering to exploit all the cores of a machine.
    Node is single-threaded by default */

// const workersCount = process.env.WORKER_COUNT || cpus.length;

// if (/* process.env.NODE_ENV === 'production' && */ cluster.isMaster) {
//     // Master process
//     for (let i = 0; i < workersCount; i++) {
//         cluster.fork();
//     }

//     debug('Master process online with PID %s', process.pid);

//     cluster.on('online', (worker) => {
//         debug('Worker %s is online', worker.process.pid);
//     });

//     cluster.on('exit', (worker, code, signal) => {
//         debug('Worker %s died with code: %s and signal: %s',
//             worker.process.pid, code, signal);
//         debug('Starting a new worker');
//         cluster.fork();
//     });
// } else {
// Worker process
const server = http.createServer(app.callback());

function onListening() {
    const addr = server.address();
    const bind = typeof addr === 'string' ? `Pipe ${port}` : `Port ${port}`;
    debug(`Listening on ${bind}`);
    console.log(`Listening on ${bind}`);
}

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
// }

