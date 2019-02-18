const {
    genId,
} = require('../helpers');
const {
    processImage,
    processVideo,
} = require('../libs/processing');
const Storage = require('./FStorage');

/**
 * Class representing a file.
 * @class
 * @public
 */
module.exports = class File {
    constructor(filedata, opts) {
        this.filedata = filedata;
        this.opts = opts;
        this.name = genId(32);
    }

    get outputs() {
        return this.outputs;
    }

    set filedata(filedata) {
        this.filedata = filedata;
    }

    set opts(opts) {
        this.opts = opts;
    }

    set name(name) {
        this.name = name;
    }

    async process() {
        const {
            type,
            path,
            name
        } = this.filedata;
        switch (type.split('/')[0]) {
            case 'video':
                this.outputs = await processVideo(path, name, this.opts);
                break;
            case 'image':
                if (type === 'image/gif' && this.opts.format) {
                    this.outputs = await processVideo(path, name, this.opts);
                } else {
                    this.outputs = await processImage(path, name, this.opts);
                }
                break;
            default:
        }
    }

    saveTo(storageName) {
        const links = [];

        this.outputs.forEach((output) => {
            const link = Storage.put(output, storageName, this.name);

            links.push(link);
        });

        return links;
    }
};
