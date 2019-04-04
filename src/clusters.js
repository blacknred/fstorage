const cpus = require('os').cpus();
const cluster = require('cluster');
const debug = require('debug')('fstorage:clusters');

const workerCount = process.env.WORKER_COUNT || cpus;

if (process.env.NODE_ENV === 'production' && cluster.isMaster) {
  workerCount.forEach(() => cluster.fork());

  debug('Master process online with PID %s', process.pid);

  cluster.on('online', (worker) => {
    debug('Worker %s is online', worker.process.pid);
  });

  cluster.on('exit', (worker, code, signal) => {
    debug('Worker %s died with code: %s and signal: %s',
      worker.process.pid, code, signal);
    debug('Starting a new worker');
    cluster.fork();
  });
} else {
  // eslint-disable-next-line
  require('./server');
}

// const pm2 = require('pm2');

// const instances = process.env.WEB_CONCURRENCY || -1;
// const maxMemory = process.env.WEB_MEMORY || 512;

// pm2.connect(() => {
//   pm2.start({
//     script: 'index.js',
//     instances,
//     max_memory_restart: `${maxMemory}M`,
//     env: {
//       NODE_ENV: 'production',
//       NODE_PATH: '.'
//     },
//   }, (err) => {
//     if (err) {
//       return console.error('Error while launching applications', err.stack || err);
//     }

//     console.log('PM2 and application has been succesfully started');

//     pm2.launchBus((err, bus) => {
//       console.log('[PM2] Log streaming started');

//       bus.on('log:out', (packet) => {
//         console.log('[App:%s] %s', packet.process.name, packet.data);
//       });

//       bus.on('log:err', (packet) => {
//         console.error('[App:%s][Err] %s', packet.process.name, packet.data);
//       });
//     });
//   });
// });
