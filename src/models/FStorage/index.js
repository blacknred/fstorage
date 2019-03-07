/**
 * module description
 * @module FStorage
 */
const fs = require('fs');
const Path = require('path');
const zlib = require('zlib');
const stream = require('stream');
const crypto = require('crypto');
const winattr = require('winattr');
const child = require('child_process');

/** @const {Symbol} name */
const _NAME = Symbol('name');

/** @const {Symbol} opts */
const _OPTS = Symbol('opts');

/** @const {Symbol} exist */
const _EXIST = Symbol('exist');

/** @const {Symbol} is_gzip */
const _IS_GZIP = Symbol('gzip');

/** @const {Symbol} root_path */
const _ROOT_PATH = Symbol('root_path');

/** @const {Symbol} uid_key */
const _IS_UID_KEY = Symbol('uid_key');

/** @const {Boolean} is_gzipped */
const IS_GZIP = true;

/** @const {Boolean} is_uid_key_gen */
const IS_UID_KEY = false;

/** @const {Boolean} is_windows */
const IS_WIN = process.platform.indexOf('win') === 0;

/** @const {String} root_path */
const ROOT_PATH = Path.join(__dirname, '../', '../', 'static');

/**
 * Class representing a `fs` based file storage model.
 * @class
 * @public
 */
class FStorage {
    /**
     * @typedef {Object} Opts The storage options.
     * @property {boolean} is_uid_key - Uid key generation.
     * @property {boolean} is_gzip - File compression.
     * @property {string} root_path - Target directory name or path.
     */
    /**
     * Create a storage.
     * @param {string} name - The storage name.
     * @param {Opts} opts - The storage options.
     */
    constructor(name, opts = {}) {
        if (!(this instanceof FStorage)) {
            return new FStorage(name, opts);
        }

        /** @private @type {String} name */
        this[_NAME] = name || this.genName(12);

        const {
            is_gzip = FStorage[_IS_GZIP],
                root_path = FStorage[_ROOT_PATH],
                is_uid_key = FStorage[_IS_UID_KEY],
        } = opts;

        /** @private @type {Opts} opts */
        this[_OPTS] = {
            root_path: root_path ? Path.resolve(__dirname, root_path) : ROOT_PATH,
            is_gzip: is_gzip === undefined ? IS_GZIP : is_gzip,
            is_uid_key: is_uid_key === undefined ? IS_UID_KEY : is_uid_key,
        };

        // create new
        if (!opts[_EXIST]) {
            // no duplicates
            if (FStorage.exists.call(this, name)) {
                throw new Error('Storage name allready in use');
            }

            // create
            const path = this.getPath();

            // create dir
            fs.mkdirSync(path, {
                recursive: true,
            });

            // create key
            if (this[_OPTS].is_uid_key) {
                const key = this.genName(4);

                child.execSync(`useradd ${key}`);

                const uid = child.execSync(`id -u ${key}`);

                fs.chownSync(path, uid, null);
                // child.execSync(`chown ${key}:group ${storagePath}`);
            }
        }
    }


    /* GETTERS */
    /**
     * @private
     * @returns {string} The storage name.
     */
    get name() {
        return this[_NAME].startsWith('.') ? this[_NAME].substr(1) : this[_NAME];
    }

    /**
     * @private
     * @returns {boolean} The storage privacy.
     */
    get isPrivate() {
        return this[_NAME].startsWith('.');
    }

    /**
     * @private
     * @returns {number} The files count in storage.
     */
    get count() {
        const path = this.getPath();

        return (async () => {
            return (await fs.promises.readdir(path)).length;
        })();
    }

    /**
     * @private
     * @returns {string} The storage key.
     */
    get key() {
        const path = this.getPath();

        try {
            const stat = fs.statSync(path);

            if (!this[_OPTS].is_uid_key) {
                return stat.ino;
            }

            return child.execSync(`id -nu ${stat.uid}`);
        } catch (e) {
            return null;
        }
    }


    /* UTILS */

    /**
     * Resolve path.
     * @param {string} filename - file name.
     * @returns {string} path.
     */
    getPath(filename) {
        if (filename && this[_OPTS].is_gzip && Path.extname(filename) !== '.gz') {
            // eslint-disable-next-line
            filename = `${filename}.gz`;
        }
        return Path.resolve(this[_OPTS].root_path, this[_NAME], filename || '');
    }

    /**
     * Create random name.
     * @param {number} cnt - char length.
     * @returns {string} string.
     */
    // eslint-disable-next-line
    genName(cnt = 32) {
        return crypto.randomBytes(cnt / 2).toString('hex');
    }

    /**
     * Validate file name.
     * @param {string} filename - file name.
     * @returns {string|null} updated file name.
     */
    validateFilename(filename) {
        if (fs.existsSync(this.getPath(filename))) {
            return filename;
        }
        if (fs.existsSync(this.getPath(`.${filename}`))) {
            return `.${filename}`;
        }
        return null;
    }


    /* STORAGE */

    /** Make storage private. */
    async private() {
        if (this[_NAME].startsWith('.')) {
            return;
        }

        const before = this.getPath();

        this[_NAME] = `.${this[_NAME]}`;

        const after = this.getPath();

        await fs.promises.rename(before, after);

        if (IS_WIN) {
            winattr.setSync(after, {
                hidden: true,
            });
        }
    }

    /** Make storage public. */
    async public() {
        if (!this[_NAME].startsWith('.')) {
            return;
        }

        const before = this.getPath();

        this[_NAME] = this[_NAME].substr(1);

        const after = this.getPath();

        await fs.promises.rename(before, after);

        if (IS_WIN) {
            winattr.setSync(after, {
                hidden: false,
            });
        }
    }

    /** List files in storage. */
    async list() {
        const path = this.getPath();

        const content = await fs.promises.readdir(path);

        return Promise.all(content.map(async (fname) => {
            const fPath = this.getPath(fname);

            const stat = await fs.promises.lstat(fPath);

            if (stat.isFile()) {
                return {
                    name: fname,
                    size: stat.size,
                    created_at: stat.ctime,
                    updated_at: stat.mtime,
                };
            }

            return null;
        }));
    }

    /** Clear storage. */
    async clear() {
        const path = this.getPath();

        const content = await fs.promises.readdir(path);

        Promise.all(content.map(async (fname) => {
            const fPath = this.getPath(fname);

            return fs.promises.unlink(fPath);
        }));
    }

    /** Destroy storage. */
    async destroy() {
        await this.clear();

        const path = this.getPath();

        fs.rmdirSync(path);

        if (this[_OPTS].is_uid_key) {
            child.execSync(`userdel -r ${this.key}`);
        }
    }


    /* FILE */

    /**
     * Put file in storage.
     * @param {Buffer|string} [file] - File source.
     * @param {string} [filename] - File name.
     * @returns {string} File path.
     */
    put(file, filename) {
        if (!file) {
            throw new Error('There is no file');
        }

        let reader;

        if (typeof file === 'string') {
            reader = fs.createReadStream(file);
        } else if (file instanceof Buffer) {
            reader = new stream.PassThrough();
            reader.end(file);
        } else {
            throw new Error('File have to be Buffer or string path');
        }

        const validFilename = filename || this.genName(32);

        const path = this.getPath(validFilename);

        const writer = fs.createWriteStream(path);

        if (this[_OPTS].is_gzip) {
            reader.pipe(zlib.createGzip()).pipe(writer);
        } else {
            reader.pipe(writer);
        }

        return Path.parse(path).name;
    }

    /**
     * Put stream in storage.
     * @param {string} [filename] - File name.
     */
    putStream(filename) {
        const path = this.getPath(filename || this.genName(32));

        if (this[_OPTS].is_gzip) {
            const through = new stream.PassThrough();

            through.pipe(zlib.createGzip()).pipe(fs.createWriteStream(path, {
                end: true
            }));

            return through;
        }

        return fs.createWriteStream(path);
    }

    /**
     * Remove file from storage.
     * @param {string} [filename] - File name.
     */
    async pop(filename) {
        if (!filename) {
            throw new Error('There is no file');
        }

        const file = this.validateFilename(filename);

        if (!file) {
            throw new Error('There is no such file in storage');
        }

        await fs.promises.unlink(this.getPath(file));
    }

    /**
     * Read file from storage.
     * @param {string} [filename] - File name.
     */
    get(filename) {
        if (!filename) {
            throw new Error('There is no file');
        }

        const file = this.validateFilename(filename);

        if (!file) {
            throw new Error('There is no such file in storage');
        }

        return fs.createReadStream(this.getPath(file));
    }

    /**
     * Get file stat data.
     * @param {string} [filename] - File name.
     */
    async stat(filename) {
        if (!filename) {
            throw new Error('There is no file');
        }

        const file = this.validateFilename(filename);

        if (!file) {
            throw new Error('There is no such file in storage');
        }

        const stat = await fs.promises.lstat(this.getPath(file));

        return {
            name: filename,
            size: stat.size,
            created_at: stat.ctime,
            updated_at: stat.mtime,
        };
    }

    /**
     * Hide file in storage.
     * @param {string} [filename] - File name.
     */
    async hide(filename) {
        if (!filename) {
            throw new Error('There is no file');
        }

        const file = this.validateFilename(filename);

        if (!file) {
            throw new Error('There is no such file in storage');
        }

        if (file.startsWith('.')) {
            return;
        }

        const after = this.getPath(`.${filename}`);

        await fs.promises.rename(this.getPath(file), after);

        if (IS_WIN) {
            winattr.setSync(after, {
                hidden: true,
            });
        }
    }

    /**
     * Unhide file in storage.
     * @param {string} [filename] - File name.
     */
    async unhide(filename) {
        if (!filename) {
            throw new Error('There is no file');
        }

        const file = this.validateFilename(filename);

        if (!file) {
            throw new Error('There is no such file in storage');
        }

        if (!file.startsWith('.')) {
            return;
        }

        const after = this.getPath(filename);

        await fs.promises.rename(this.getPath(file), after);

        if (IS_WIN) {
            winattr.setSync(after, {
                hidden: false,
            });
        }
    }

    /**
     * Hide file in storage.
     * @param {string} [filename] - File name.
     * @param {string} [newFilename] - New file name.
     */
    async rename(filename, newFilename) {
        if (!filename) {
            throw new Error('There is no file');
        }

        if (!newFilename) {
            throw new Error('There is no new name');
        }

        const file = this.validateFilename(filename);

        if (!file) {
            throw new Error('There is no such file in storage');
        }

        const validNewFilename = Path.parse(newFilename).name + Path.extname(file);

        const after = this.getPath(`${file.startsWith('.') ? '.' : ''}${validNewFilename}`);

        try {
            await fs.promises.rename(this.getPath(file), after);

            if (IS_WIN) {
                winattr.setSync(after, {
                    hidden: true,
                });
            }

            return validNewFilename;
        } catch (e) {
            throw new Error('The name allready in use');
        }
    }


     /* STATIC */

    /**
     * Check existance in root.
     * @static
     * @param {string[]} args - The path parts.
     * @return {string|boolean} Result
     */
    static exists(...args) {
        if (args[1] && (
            (this[_OPTS] && this[_OPTS].is_gzip === 'true')
            || this[_IS_GZIP] === 'true'
            || IS_GZIP
        )) {
            // eslint-disable-next-line
            args[1] = `${args[1]}.gz`;
        }
        try {
            const path = args.reduce((a, c) => {
                if (fs.existsSync(Path.join(a, c))) {
                    return Path.join(a, c);
                }

                if (fs.existsSync(Path.join(a, `.${c}`))) {
                    return Path.join(a, `.${c}`);
                }

                throw new Error();
            }, (this[_OPTS] && this[_OPTS].root_path) || this[_ROOT_PATH] || ROOT_PATH);

            return Path.basename(path);
        } catch (e) {
            return false;
        }
    }

    /**
     * Find a storage.
     * @static
     * @param {string} storagename - The storage name.
     * @return {FStorage} A `FStorage` instance
     */
    static find(storagename) {
        if (!storagename) {
            throw new Error('Storage not specified');
        }

        const storage = FStorage.exists(storagename);

        if (!storage) {
            throw new Error('Storage not found');
        }

        return new FStorage(storage, {
            [_EXIST]: true,
        });
    }

    /**
     * Set defaults options for `FStorage`.
     * @static
     * @param {Opts} [defaultOpts] - `FStorage` defaults.
     */
    static setDefaultOpts(defaultOpts = {}) {
        FStorage[_IS_GZIP] = defaultOpts.is_gzip;
        FStorage[_IS_UID_KEY] = defaultOpts.is_uid_key;
        if (defaultOpts.root_path) {
            FStorage[_ROOT_PATH] = Path.resolve(__dirname, defaultOpts.root_path);
        }
    }
}

module.exports = FStorage;
