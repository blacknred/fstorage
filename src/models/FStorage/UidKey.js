// TODO: win usage
const {
    execSync,
} = require('child_process');
const crypto = require('crypto');

/**
 * Class representing a uidkey.
 * @class
 * @public
 */
module.exports = class UidKey {
    constructor() {
        this._key = crypto.randomBytes(4).toString('hex');

        execSync(`useradd ${this.key}`);
    }

    get key() {
        return this._key;
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
