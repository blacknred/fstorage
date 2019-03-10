const Path = require('path');

const sharp = require('./sharp');
const ffmpeg = require('./ffmpeg');

const SHARP_EXT = ['jpeg', 'png', 'webp', 'tiff'];
const FFMPEG_EXT = ['mp4', 'flv', 'webm', 'avi', 'gif', 'mp3', 'ogg', 'aac'];

function processor(path, rawOpts) {
    if (!Path.isAbsolute(path)) {
        // eslint-disable-next-line no-param-reassign
        path = Path.resolve(__dirname, path);
    }

    const ext = Path.extname(path).shift();

    // validate opts
    const opts = {
        width: parseInt(rawOpts.w, 10) || null,
        height: parseInt(rawOpts.h, 10) || null,
        format: rawOpts.f || ext,
        metadata: rawOpts.meta,
    };

    if (SHARP_EXT.includes(ext) || SHARP_EXT.includes(opts.f)) {
        return sharp(path, opts);
    }

    return ffmpeg(path, opts);
}

module.exports = {
    PROCESSABLE_EXT: [...SHARP_EXT, ...FFMPEG_EXT],
    processor,
};
