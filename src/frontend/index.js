const Koa = require('koa');
const path = require('path');
const body = require('koa-body');
const request = require('request');
const views = require('koa-views');
const serve = require('koa-static');
const Router = require('koa-router');
const promisify = require('util').promisify;

const fetch = promisify(request);

const app = new Koa();

/* Views */
app.use(serve(path.join(__dirname, './assets')));

app.use(views(path.join(__dirname, 'templates'), {
    extension: 'hbs',
    map: {
        hbs: 'handlebars'
    },
    options: {
        partials: {
            create: './partials/create',
            created: './partials/created',
            restore: './partials/restore',
            restored: './partials/restored',
            head: './partials/head',
            apis: './partials/apis',
        }
    }
}));

/* Router */
const router = new Router();

router.get('/', async (ctx) => {
    await ctx.render('index', {
        create: true
    });
});

router.get('/apis', async (ctx) => {
    await ctx.render('index', {
        apis: true
    });
});

router.get('/restore', async (ctx) => {
    await ctx.render('index', {
        restore: true
    });
});

router.post('/', body(), async (ctx) => {
    const url = ctx.protocol + '://' + ctx.host + '/api/v1/new';

    try {
        const res = await fetch({
            uri: url,
            method: 'post',
            form : ctx.request.body
        });
        
        await ctx.render('index', {
            created: res.body.ok,
            error: !res.body.ok,
            message: res.body.message,
        });
    } catch (e) {
        console.log(e);
        await ctx.render('index', {

        });
    }
});

router.post('/restore', body(), async (ctx) => {
    const url = ctx.protocol + '://' + ctx.host + '/api/v1/token';

    try {
        const res = await fetch({
            uri: url,
            method: 'post',
            form : ctx.request.body
        });

        await ctx.render('success', {
            title: "My New Post",
            body: "This is my first post!"
        });
    } catch (e) {
        await ctx.render('index', {

        });
    }
});

router.get('*', async (ctx) => {
    await ctx.render('404');
});

app.use(router.routes());
app.use(router.allowedMethods());

module.exports = app;