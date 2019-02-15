const fs = require('fs');
const Path = require('path');
const zlib = require('zlib');
const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');

const gzip = zlib.createGzip({
    level: 9,
});

const DEFAULTS = {
    format: {
        video: 'mp4', // webm
        image: 'jpeg', // webP
        gif: 'mp4',
        audioCodec: 'libfaac',
        videoCodec: 'libx264',
    },
    formats: {
        video: [],
        image: [],
    },
    versions: {
        video: {
            small: '320x?',
            medium: '640x?',
        },
        image: {
            small: 320,
            medium: 640,
        },
    },
    options: {
        image: {
            jpeg: {
                quality: 100,
                progressive: true,
            },
        },
    },
};

function processVideo(input, output, opts) {
    const {
        thumb,
        format,
        versions,
    } = opts;
    const command = ffmpeg(input);
    let ext = Path.extname(name);
    if (format) {
        ext = `.${DEFAULTS.format.video}`;
        command
            .format(DEFAULTS.format.video)
            // .aspect('4:3')
            .audioCodec(DEFAULTS.format.audioCodec)
            .videoCodec(DEFAULTS.format.videoCodec);
    }
    if (versions) {
        command
            .clone()
            .size(DEFAULTS.versions.video.small)
            .pipe(gzip)
            .pipe(fs.createWriteStream(`${output}_small${ext}.gz`));
        command
            .clone()
            .size(DEFAULTS.versions.video.medium)
            .pipe(gzip)
            .pipe(fs.createWriteStream(`${output}_medium${ext}.gz`));
    }
    if (thumb) {
        command
            .clone()
            .size(DEFAULTS.versions.video.small)
            .noAudio()
            .seek('0:01')
            .pipe(gzip)
            .pipe(fs.createWriteStream(`${output}_thumb.${DEFAULTS.format.image}.gz`));
    }
    command
        .clone()
        .pipe(gzip)
        .pipe(fs.createWriteStream(`${output}${ext}.gz`));
}

function processGif(input, output, opts) {
    const {
        thumb,
        format,
        versions,
    } = opts;
    const command = ffmpeg(input);
    let ext = Path.extname(name);
    if (format) {
        ext = `.${DEFAULTS.format.video}`;
        command
            .format(DEFAULTS.format.video)
            // .aspect('4:3')
            .audioCodec(DEFAULTS.format.audioCodec)
            .videoCodec(DEFAULTS.format.videoCodec);
    }
    if (versions) {
        command
            .clone()
            .size(DEFAULTS.versions.video.small)
            .pipe(gzip)
            .pipe(fs.createWriteStream(`${output}_small${ext}.gz`));
        command
            .clone()
            .size(DEFAULTS.versions.video.medium)
            .pipe(gzip)
            .pipe(fs.createWriteStream(`${output}_medium${ext}.gz`));
    }
    if (thumb) {
        command
            .clone()
            .size(DEFAULTS.versions.video.small)
            .noAudio()
            .seek('0:01')
            .pipe(gzip)
            .pipe(fs.createWriteStream(`${output}_thumb.${DEFAULTS.format.image}.gz`));
    }
    command
        .clone()
        .pipe(gzip)
        .pipe(fs.createWriteStream(`${output}${ext}.gz`));
}

function processImage(input, output, opts) {
    const {
        thumb,
        format,
        versions,
    } = opts;
    const command = sharp(input);
    let ext = Path.extname(name);
    if (format) {
        ext = `.${DEFAULTS.format.image}`;
        command
            .toFormat(
                DEFAULTS.format.image,
                DEFAULTS.options.image[DEFAULTS.formats.image]
            );
    }
    if (versions) {
        command
            .clone()
            .resize(DEFAULTS.versions.image.medium)
            .pipe(gzip)
            .pipe(fs.createWriteStream(`${output}_medium${ext}.gz`));
        command.clone()
            .resize(DEFAULTS.versions.image.small)
            .pipe(gzip)
            .pipe(fs.createWriteStream(`${output}_small${ext}.gz`));
    }
    if (thumb) {
        command
            .clone()
            .resize(DEFAULTS.versions.image.small)
            .pipe(gzip)
            .pipe(fs.createWriteStream(`${output}_thumb${ext}.gz`));
    }
    command
        .clone()
        .pipe(gzip)
        .pipe(fs.createWriteStream(`${output}${ext}.gz`));
}

function processDefault(input, output) {
    fs
    .createReadStream(input)
    .pipe(gzip)
    .pipe(fs.createWriteStream(`${output}${ext}.gz`));
}

module.exports = {
    processGif,
    processImage,
    processVideo,
    processDefault,
};

