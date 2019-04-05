const Koa = require('koa');
const cors = require('kcors');
const mount = require('koa-mount');
const helmet = require('koa-helmet');

const api = require('./api');
const files = require('./static');
const frontend = require('./frontend');

const app = new Koa();

/* Cors */
app.use(cors());

/* Prevent bruteforce */
app.use(helmet());

/* Files */
app.use(mount('/files', files));

/* API */
app.use(mount('/api/v1', api));

/* Frontend */
app.use(mount('/', frontend));

module.exports = app;
