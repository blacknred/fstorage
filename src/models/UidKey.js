// TODO: win usage
const {
    execSync,
} = require('child_process');

const {
    genId,
} = require('../helpers');

/**
 * Class representing a uidkey.
 * @class
 * @public
 */
module.exports = class UidKey {
    constructor() {
        this.key = genId(8);
    }

    get key() {
        return this.key;
    }

    set key(key) {
        this.key = key;
    }

    save() {
        execSync(`useradd ${this.key}`);
    }

    static compare(key, uid) {
        const realUid = execSync(`id -u ${key}`);

        return realUid === uid;
    }

    static destroy(uid) {
        const key = execSync(`id -nu ${uid}`);
        execSync(`userdel -r ${key}`);
    }
};
