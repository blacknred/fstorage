const fs = require('fs');
const Path = require('path');
const crypto = require('crypto');
const debug = require('debug')('fstorage:handlers');

const {
    encodeToken,
} = require('./permissions');
const {
    processGif,
    processImage,
    processVideo,
    processDefault,
} = require('./helpers');

const IS_SIMPLE_KEY_STRATEGY = true;
const TARGET_DIR = Path.join(__dirname, '../', 'static');

/* Create a storage:
=> name(client domain by default)
=> dayspan(optional, for short lived token)
=> email(optional, for sending credentials)
<= access token(encrypts data using SECRET)
<= secret key(needed for some operations)
<= storage name
*/
async function createStorage(ctx) {
    const {
        dayspan,
        email,
        name: storageName = ctx.hostname.split('.')[0],
    } = ctx.request.body;

    const storagePath = Path.join(TARGET_DIR, storageName);

    // try to create dir
    if (fs.existsSync(storagePath)) {
        ctx.throw(422, `The storage ${storageName} allready in use`);
    }
    fs.mkdirSync(storagePath, {
        recursive: true,
    });

    // gen secret key
    let secretKey;
    if (IS_SIMPLE_KEY_STRATEGY) {
        // by inode
        const { ino } = fs.statSync(storagePath);
        secretKey = ino;
    } else {
        // by add key as user and chown dir
        // eslint-disable-next-line
        const { execSync } = require('child_process');
        secretKey = crypto.randomBytes(4).toString('hex');
        // Math.random().toString(36).slice(2);
        execSync(`useradd ${secretKey}`);
        // execSync(`chown ${secretKey}:group ${storagePath}`);
        const uid = execSync(`id -u ${secretKey}`);
        fs.chownSync(storagePath, uid, null);
    }

    // gen token
    const accessToken = await encodeToken(storageName, secretKey, dayspan);

    // send email
    if (email) {
        // TODO: sent credentials to email
    }

    ctx.status = 201;
    ctx.body = {
        ok: true,
        data: {
            secretKey,
            accessToken,
            storageName,
        },
    };
}

/* Restore the storage access:
=> secret key
=> name(client domain by default)
=> dayspan(optional, for short lived token)
=> email(optional, for sending credentials)
<= new access token
*/
async function restoreAccess(ctx) {
    const {
        dayspan,
        email,
        secretKey,
        name: storageName = ctx.hostname.split('.')[0],
    } = ctx.request.body;
    const storagePath = Path.join(TARGET_DIR, storageName);

    // check dir existance
    if (!fs.existsSync(storagePath)) {
        ctx.throw(422, `The storage ${storageName} not in use`);
    }

    // check secret key
    const { ino, uid } = fs.statSync(storagePath);
    try {
        if (IS_SIMPLE_KEY_STRATEGY) {
            // by inode
            if (secretKey !== ino) {
                throw new Error();
            }
        } else {
            // by uid
            // eslint-disable-next-line
            const { execSync } = require('child_process');
            const realUid = execSync(`id -u ${secretKey}`);
            if (realUid !== uid) {
                throw new Error();
            }
        }
    } catch (e) {
        ctx.throw(403, 'Secret key is not valid');
    }

    // gen new token
    const accessToken = await encodeToken(storageName, secretKey, dayspan);

    // send email
    if (email) {
        // TODO: sent credentials to email
    }

    ctx.status = 201;
    ctx.body = {
        ok: true,
        data: {
            accessToken,
        },
    };
}

/* List files in storage
=> storage name
<= [fileData]
*/
async function listStorage(ctx) {
    const { storage: storageName } = ctx.params;
    const storagePath = Path.join(TARGET_DIR, storageName);

    // check dir existance
    if (!fs.existsSync(storagePath)) {
        ctx.throw(422, 'The storage not exist');
    }

    // get files only
    const data = fs
        .readdirSync(storagePath)
        .reduce((acc, name) => {
            const path = Path.join(storagePath, name);
            const stat = fs.lstatSync(path);
            if (stat.isFile()) {
                acc.push({
                    name,
                    size: stat.size,
                    created_at: stat.ctime,
                    updated_at: stat.mtime,
                });
            }
            return acc;
        }, []);

    ctx.body = {
        ok: true,
        data,
    };
}

/* Delete storage with all files
=> storage name
<= boolean
*/
async function deleteStorage(ctx) {
    const { storage: storageName } = ctx.params;
    const storagePath = Path.join(TARGET_DIR, storageName);

    // check dir existance
    if (!fs.existsSync(storagePath)) {
        ctx.throw(422, 'The storage not exist');
    }

    // delete storage
    fs.rmdirSync(storagePath);

    // delete secretKey user
    if (!IS_SIMPLE_KEY_STRATEGY) {
        // eslint-disable-next-line
        const { execSync } = require('child_process');
        const { key: secretKey } = ctx.state;
        execSync(`userdel -r ${secretKey}`);
    }

    ctx.body = {
        ok: true,
    };
}

/* Delete file from storage
=> file name
=> storage name
<= boolean
*/
function deleteFile(ctx) {
    const {
        name,
        storage: storageName,
    } = ctx.params;
    let fileName = name;
    if (Path.extname(name) !== '.gz') {
        fileName = `${name}.gz`;
    }
    const filePath = Path.join(TARGET_DIR, storageName, fileName);

    // check file existance
    if (!fs.existsSync(filePath)) {
        ctx.throw(422, 'The file not exist');
    }

    // remove file
    fs.unlinkSync(filePath);
    debug('deleting %s from %s', name, filePath);

    ctx.body = {
        ok: true,
    };
}

/* Add file in storage

*/
async function addFile(ctx) {
    const {
        thumb = true,
        format = true,
        versions = false,
    } = ctx.query;
    const opts = {
        thumb,
        format,
        versions,
    };
    const links = [];
    const { storage: storageName } = ctx.params;
    const storagePath = Path.join(TARGET_DIR, storageName);
    const files = Object.values(ctx.request.files);

    // check files presence
    if (files.length === 0) {
        ctx.throw(400, 'No files');
    }

    // check dir existance
    if (!fs.existsSync(storagePath)) {
        ctx.throw(422, 'The storage not exist');
    }

    // process files
    files.forEach(async ({ size, path, name, type }) => {
        console.log(name);
        const filename = crypto.randomBytes(16).toString('hex');
        const output = Path.join(storagePath, filename);

        switch (type.split('/')[0]) {
            case 'video':
                links.push(await processVideo(path, output, opts));
                break;
            case 'image':
                if (type === 'image/gif') {
                    links.push(await processGif(path, output, opts));
                    break;
                }
                links.push(await processImage(path, output, opts));
                break;
            default:
                links.push(await processDefault(path, output));
        }

        debug('uploading %s ->  %i', name, size);
        // console.log(ctx.headers.origin, ctx.headers.host);
        // console.log(`${ctx.protocol}://${ctx.get('host')}`);
        // const from = ctx.hostname.split('.')[0];
    });

    ctx.body = {
        ok: true,
        data: links,
    };
}

module.exports = {
    addFile,
    deleteFile,
    listStorage,
    deleteStorage,
    createStorage,
    restoreAccess,
};
