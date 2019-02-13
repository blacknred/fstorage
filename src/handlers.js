/* eslint-disable no-case-declarations */
const fs = require('fs');
const Path = require('path');
const debug = require('debug')('fstorage:router');

const {
    encodeToken,
} = require('./auth');
const helpers = require('./helpers');

const FORMATS = {
    video: 'mp4', // webm
    image: 'jpg', // webP
    gif: 'mp4',
};

async function createToken(ctx) {
    const {
        dayspan,
        accessKey = ctx.ip,
    } = ctx.request.body;
    const token = await encodeToken(accessKey, dayspan);
    ctx.status = 201;
    ctx.body = {
        ok: true,
        token,
    };
}

async function serveFile(ctx) {
    const {
        compress = false,
        thumb = 300,
        format = 'png',
        crop = null,
        save = true,
        progressive = true,
    } = ctx.query;
    // image => jpg
    // gif => mp4
    // video => mp4
    // console.log(ctx.headers.origin, ctx.headers.host);
    // console.log(`${ctx.protocol}://${ctx.get('host')}`);

    if (!Object.keys(ctx.request.files).length) {
        ctx.throw(400, 'No files');
    }

    const from = ctx.hostname.split('.')[0];
    const dir = Math.random().toString(36).slice(2);
    const fullPath = Path.join(__dirname, '../', 'static', from, dir);
    const files = Object.values(ctx.request.files);

    fs.mkdirSync(fullPath, {
        recursive: true,
    });

    const response = [];

    try {
        files.forEach(async ({ size, path, name, type }) => {

            // const
            const writer = fs.createWriteStream(Path.join(fullPath, name));
            await fs.createReadStream(path).pipe(writer);

            console.log(Path.extname(name), type);
            throw new Error('kl');
            
            // process file
            // let fileName;
            // switch (type.split('/')[0]) {
            //     case 'video':
            //         fileName = `${Math.random().toString(36).slice(2)}.mp4`;
            //         await helpers.videoToMp4(path, path.join(fullPath, fileName));
            //         break;
            //     case 'image':
            //         fileName = Math.random().toString(36).slice(2)
            //             + Path.extname(name);
            //         // await helpers.imageToJpg(file.path, path.join(fullPath, fileName));
            //         const buf = await fs.createReadStream(path);
            //         await buf.pipe(fs.createWriteStream(Path.join(fullPath, fileName)));
            //         break;
            //     default:
            // }
            // debug('uploading %s -> %s', name, fileName);

            // // process thumbnail
            // const thumbName = `${Math.random().toString(36).slice(2)}.jpg`;
            // const thumbPath = Path.join(fullPath, thumbName);
            // switch (type) {
            //     case 'image': await helpers.imageThumb(path, thumbPath); break;
            //     case 'video': await helpers.videoThumb(path, fullPath); break;
            //     default:
            // }

            // // response
            // response.push({
            //     // file: `${hosts[seedFrom || process.env.NODE_ENV]}/${dir}/${fileName}`,
            //     // thumb: `${hosts[seedFrom || process.env.NODE_ENV]}/${dir}/${thumbName}`
            // });
        });
        ctx.body = {
            ok: true,
            data: response
        };
    } catch (e) {
        ctx.throw(500, e.message);
    }
}

async function deleteFile(ctx) {
    const name = ctx.params.name || ctx.path;
    const filePath = Path.join(__dirname, '../', 'static', name);
    try {
        await fs.unlinkSync(filePath);
        debug('deleting %s from %s', name, filePath);
        ctx.body = {
            ok: true,
        };
    } catch (err) {
        debug(err.message);
        ctx.throw(404, 'No such file or directory.');
    }
}

module.exports = {
    createToken,
    serveFile,
    deleteFile,
};
