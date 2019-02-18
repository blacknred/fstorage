const fs = require('fs');
const Path = require('path');
const crypto = require('crypto');
const debug = require('debug')('fstorage');

const logFile = fs.createWriteStream(Path.join(__dirname, '../', 'errors.log'), {
    flags: 'a',
});

function fileStdout(str) {
    debug(str);
    logFile.write(`${str} \n`);
}

function genId(cnt = 32) {
    return crypto.randomBytes(cnt / 2).toString('hex');
}

module.exports = {
    genId,
    fileStdout,
};
