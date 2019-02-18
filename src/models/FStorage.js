const fs = require('fs');
const Path = require('path');
const zlib = require('zlib');
const winattr = require('winattr');

const UidKey = require('./UidKey');

const IS_SIMPLE_KEY_STRATEGY = true;

const IS_WIN = process.platform.indexOf('win') === 0;

const IS_COMPRESSION = process.env.COMPRESSION || true;

const STATIC_DIR = Path.join(__dirname, '../', 'static');

const gzip = zlib.createGzip({
    level: 9,
});

/**
 * Class representing a fs based storage.
 * @class
 * @public
 */
module.exports = class FStorage {
    constructor(name, isPrivate) {
        this.name = name;
        this.private = isPrivate;
    }

    get name() {
        return this.name;
    }

    get private() {
        return this.private;
    }

    get key() {
        return this.key;
    }

    set name(name) {
        this.name = name;
    }

    set private(isPrivate) {
        this.private = isPrivate;

        this.hidefy(isPrivate);
    }


    // utils

    getPath(...args) {
        return Path.join(STATIC_DIR, (this.name || ''), ...args);
    }

    exist(filename) {
        const path = this.getPath(filename);

        return fs.existsSync(path);
    }

    static exist(...args) {
        const path = this.prototype.getPath(...args);

        return fs.existsSync(path);
    }

    static checkKey(name, key) {
        const path = this.prototype.getPath(name);

        const {
            ino,
            uid,
        } = fs.statSync(path);

        if (IS_SIMPLE_KEY_STRATEGY) {
            return key === ino;
        }

        return UidKey.compare(key, uid);
    }


    // instance

    create() {
        const path = this.getPath(this.name);

        fs.mkdirSync(path, {
            recursive: true,
        });

        if (this.private) {
            this.hidefy(true);
        }

        if (IS_SIMPLE_KEY_STRATEGY) {
            const {
                ino
            } = fs.statSync(this.path);
            this.key = ino;
        }

        const uidkey = new UidKey();

        uidkey.save();
        console.log(uidkey.key);

        fs.chownSync(this.path, uidkey.key, null);
        // execSync(`chown ${key}:group ${storagePath}`);

        this.key = uidkey.key;

        return {
            name: this.name,
            private: this.private,
            key: this.key
        };
    }

    hidefy(flag) {
        const path = this.getPath(this.name);

        const newpath = this.getPath('.' + this.name);

        fs.renameSync(path, after);

        if (IS_WIN) {
            winattr.setSync(after, { hidden: true });
        }

        return after;
        
    }

    static hidefy(name, flag) {
        const path = this.getPath(name);

        const newpath = this.getPath('.' + this.name);

        fs.renameSync(path, after);

        if (IS_WIN) {
            winattr.setSync(after, { hidden: true });
        }

        return after;
        
    }

    update(opts) {
        if (Object.prototype.hasOwnProperty.call(opts, 'private')) {
            this.hidefy(opts.private);
        }

        if (opts.empty) {
            this.clear();
        }
    }

    static update(name, opts) {
        if (Object.prototype.hasOwnProperty.call(opts, 'private')) {
            this.hidefy(name, opts.private);
        }

        if (opts.empty) {
            this.clear(name);
        }
    }

    destroy() {
        const path = this.getPath();

        if (!IS_SIMPLE_KEY_STRATEGY) {
            const {
                uid,
            } = fs.statSync(path);

            UidKey.destroy(uid);
        }

        fs.rmdirSync(path);
    }

    static destroy(name) {
        const path = this.prototype.getPath(name);

        if (!IS_SIMPLE_KEY_STRATEGY) {
            const {
                uid,
            } = fs.statSync(path);

            UidKey.destroy(uid);
        }

        fs.rmdirSync(path);
    }


    // file operations

    put(file, filename) {
        let path = this.getPath(filename);

        if (IS_COMPRESSION) {
            path = `${path}.gz`;

            file.pipe(gzip);
        }

        file.pipe(fs.createWriteStream(path));

        return path;
    }

    static put(file, ...args) {
        let path = this.prototype.getPath(...args);

        if (IS_COMPRESSION) {
            path = `${path}.gz`;

            file.pipe(gzip);
        }

        file.pipe(fs.createWriteStream(path));

        return path;
    }

    pop(filename) {
        const path = this.getPath(filename);

        fs.unlinkSync(path);
    }

    static pop(...args) {
        const path = this.prototype.getPath(...args);

        fs.unlinkSync(path);
    }

    list() {
        const path = this.getPath();

        return fs
            .readdirSync(path)
            .reduce((acc, fname) => {
                const fPath = this.getPath(path, fname);
                const stat = fs.lstatSync(fPath);
                if (stat.isFile()) {
                    acc.push({
                        name: fname,
                        size: stat.size,
                        created_at: stat.ctime,
                        updated_at: stat.mtime,
                    });
                }
                return acc;
            }, []);
    }

    static list(name) {
        const path = this.constructor.getPath(name);

        return fs
            .readdirSync(path)
            .reduce((acc, fname) => {
                const fPath = this.getPath(path, fname);
                const stat = fs.lstatSync(fPath);
                if (stat.isFile()) {
                    acc.push({
                        name: fname,
                        size: stat.size,
                        created_at: stat.ctime,
                        updated_at: stat.mtime,
                    });
                }
                return acc;
            }, []);
    }

    clear() {
        const path = this.getPath();

        fs
            .readdirSync(path)
            .forEach((fname) => {
                const fPath = this.getPath(path, fname);
                fs.unlinkSync(fPath);
            });
    }

    static clear(name) {
        const path = this.constructor.getPath(name);

        fs
            .readdirSync(path)
            .forEach((fname) => {
                const fPath = this.getPath(path, fname);
                fs.unlinkSync(fPath);
            });
    }

    get(filename) {
        const path = this.getPath(filename);

        const stat = fs.lstatSync(path);

        return {
            name: filename,
            size: stat.size,
            created_at: stat.ctime,
            updated_at: stat.mtime,
        };
    }

    static get(name, filename) {
        const path = this.prototype.getPath(name, filename);

        const stat = fs.lstatSync(path);

        return {
            name: filename,
            size: stat.size,
            created_at: stat.ctime,
            updated_at: stat.mtime,
        };
    }
};
