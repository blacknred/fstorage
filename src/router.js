/* eslint-disable no-case-declarations */
const fs = require('fs');
const util = require('util');
const path = require('path');
const debug = require('debug')('fstorage:router');

const checkAuth = require('./auth');
const helpers = require('./_helpers');

const mkdir = util.promisify(fs.mkdir);

module.exports = async (ctx, next) => {
    switch (ctx.method) {
        case 'POST':
            await checkAuth(ctx, next);

            console.log(ctx.headers.origin, ctx.headers.host);
            console.log(`${ctx.protocol}://${ctx.get('host')}`);
            const response = [];
            const dir = Math.random().toString(36).slice(2);
            const fullPath = path.join(__dirname, 'static', dir);
            const files = Object.values(ctx.request.files);
            const seedFrom = ctx.query.seedFrom;
            try {
                await mkdir(fullPath); // fs.mkdirSync()
                files.forEach(async (file) => {
                    const type = file.type.split('/')[0];

                    // process file
                    let fileName;
                    switch (type) {
                        case 'video':
                            fileName = `${Math.random().toString(36).slice(2)}.mp4`;
                            await helpers.videoToMp4(file.path, path.join(fullPath, fileName));
                            break;
                        case 'image':
                            fileName = Math.random().toString(36).slice(2)
                                + path.extname(file.name);
                            // await helpers.imageToJpg(file.path, path.join(fullPath, fileName));
                            const buf = await fs.createReadStream(file.path);
                            await buf.pipe(fs.createWriteStream(path.join(fullPath, fileName)));
                            break;
                        default:
                    }
                    debug('uploading %s -> %s', file.name, fileName);

                    // process thumbnail
                    const thumbName = `${Math.random().toString(36).slice(2)}.jpg`;
                    const thumbPath = path.join(fullPath, thumbName);
                    switch (type) {
                        case 'image': await helpers.imageThumb(file.path, thumbPath); break;
                        case 'video': await helpers.videoThumb(file.path, fullPath); break;
                        default:
                    }

                    // response
                    response.push({
                        file: `${hosts[seedFrom || process.env.NODE_ENV]}/${dir}/${fileName}`,
                        thumb: `${hosts[seedFrom || process.env.NODE_ENV]}/${dir}/${thumbName}`
                    });
                });
                ctx.body = {
                    status: 'success',
                    data: response
                };
            } catch (err) {
                ctx.throw(500, err.message);
            }
            break;
        case 'DELETE':
            await checkAuth(ctx, next);
            const filePath = path.join(__dirname, '../', 'static', ctx.path);
            try {
                await fs.unlinkSync(filePath);
                debug('deleting %s from %s', ctx.path, filePath);
                ctx.body = {
                    status: 'success',
                    data: ctx.path
                };
            } catch (err) {
                console.log(err.message);
                ctx.throw(403, 'No such file or directory.');
            }
            break;
        default: await next();
    }
};
