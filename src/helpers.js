const fs = require('fs');
const Path = require('path');
const debug = require('debug')('fstorage');

const LOGS_PATH = Path.join(__dirname, '../', 'logs');
const ERROR_LOGS_PATH = Path.join(LOGS_PATH, 'errors.log');

const logFile = fs.createWriteStream(ERROR_LOGS_PATH, {
    flags: 'a',
});

// function g() {
//     try {
//         fs.accessSync(ERROR_LOGS_PATH, fs.constants.W_OK);
//     } catch (e) {
//         console.warn('!please change chown of logs');
//         execSync(`sudo chown -R $USER ${LOGS_PATH}`);
//         g();
//     }
// }

function fileStdout(str, pre = '') {
    debug(str);

    logFile.write(`${new Date()}: ${pre.toUpperCase()} ${str} \n`);
}

module.exports = {
    fileStdout,
};

