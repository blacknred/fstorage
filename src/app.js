const Koa = require('koa');
const cors = require('kcors');
const mount = require('koa-mount');
const helmet = require('koa-helmet');

const api = require('./api');
const files = require('./static');

const app = new Koa();

/* Cors */
app.use(cors());

/* Prevent bruteforce */
app.use(helmet());

/* Files */
app.use(mount('/', files));

/* API */
app.use(mount('/api/v1', api));

module.exports = app;
