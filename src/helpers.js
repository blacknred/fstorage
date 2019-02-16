const fs = require('fs');
const zlib = require('zlib');
const util = require('util');
const Path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

const IS_SIMPLE_KEY_STRATEGY = true;

const IS_COMPRESSION = process.env.COMPRESSION || true;

const STATIC_DIR = Path.join(__dirname, '../', 'static');

const logFile = fs.createWriteStream(Path.join(__dirname, '../', 'errors.log'), {
    flags: 'a',
});

const gzip = zlib.createGzip({
    level: 9,
});

function getFullPath(...path) {
    return Path.join(STATIC_DIR, ...path)
}

function createKey(storageName) {
    const path = getFullPath(storageName);

    if (IS_SIMPLE_KEY_STRATEGY) {
        // by inode
        const { ino } = fs.statSync(path);
        return ino;
    }

    // by add key as user and chown dir
    const key = crypto.randomBytes(4).toString('hex');
    // Math.random().toString(36).slice(2);
    execSync(`useradd ${key}`);
    // execSync(`chown ${key}:group ${storagePath}`);
    const uid = execSync(`id -u ${key}`);
    fs.chownSync(path, uid, null);
    return key;
}

function checkKey(storageName, key) {
    const path = getFullPath(storageName);

    const {
        ino,
        uid,
    } = fs.statSync(path);
    if (IS_SIMPLE_KEY_STRATEGY) {
        // by inode
        return key === ino;
    }

    // by uid
    const realUid = execSync(`id -u ${key}`);
    return realUid === uid;
}

function deleteKey(key) {
    if (!IS_SIMPLE_KEY_STRATEGY) {
        execSync(`userdel -r ${key}`);
    }
}

function isExists(...name) {
    const path = getFullPath(...name);

    return fs.existsSync(path);
}

function createDir(name) {
    const path = getFullPath(name);

    fs.mkdirSync(path, {
        recursive: true,
    });
}

function readDir(storageName) {
    const path = getFullPath(storageName);

    return fs
        .readdirSync(path)
        .reduce((acc, name) => {
            const filePath = Path.join(path, name);
            const stat = fs.lstatSync(filePath);
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
}

function deleteDir(storageName) {
    const path = getFullPath(storageName);

    fs.rmdirSync(path);
}

function deleteFile(storageName, fileName) {
    if (Path.extname(fileName) !== '.gz') {
        // eslint-disable-next-line
        fileName = `${fileName}.gz`;
    }

    const path = getFullPath(storageName, fileName);

    fs.unlinkSync(path);
}

function generateName() {
    return crypto.randomBytes(16).toString('hex');
}

function saveFile(stream, storageName, fileName) {
    if (IS_COMPRESSION) {
        // eslint-disable-next-line
        fileName = `${fileName}.gz`;

        stream.pipe(gzip);
    }

    const path = getFullPath(storageName, fileName);

    stream.pipe(fs.createWriteStream(path));

    return Path.join(storageName, fileName);
}

function fileOutput(str, args) {
    console.log(str);
    logFile.write(util.format(str) + '\n');
}

module.exports = {
    readDir,
    isExists,
    saveFile,
    checkKey,
    createKey,
    deleteKey,
    createDir,
    deleteDir,
    deleteFile,
    fileOutput,
    generateName,
};
