/* eslint-disable no-return-assign */

const Path = require('path');
const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');

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
    thumbs: {
        video: '320x?',
        image: 320,
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

function processVideo(input, name, opts) {
    let ext = Path.extname(name);

    const streams = {};

    const operation = ffmpeg(input);

    if (opts.format) {
        ext = `.${DEFAULTS.format.video}`;

        operation
            .format(DEFAULTS.format.video)
            // .aspect('4:3')
            .audioCodec(DEFAULTS.format.audioCodec)
            .videoCodec(DEFAULTS.format.videoCodec);
    }

    if (opts.versions) {
        operation
            .clone()
            .size(DEFAULTS.versions.video.medium)
            .then(strm => streams[`_medium${ext}`] = strm);

        operation
            .clone()
            .size(DEFAULTS.versions.video.small)
            .then(strm => streams[`_small${ext}`] = strm);
    }

    if (opts.thumb) {
        operation
            .clone()
            .size(DEFAULTS.thumbs.video)
            .noAudio()
            .seek('0:01')
            .then(strm => streams[`_thumb.${DEFAULTS.format.image}`] = strm);
    }

    operation
        .clone()
        .then(strm => streams[ext] = strm);
}

function processImage(input, name, opts) {
    let ext = Path.extname(name);

    const streams = {};

    const operation = sharp(input);

    if (opts.format) {
        ext = `.${DEFAULTS.format.image}`;

        operation
            .toFormat(
                DEFAULTS.format.image,
                DEFAULTS.options.image[DEFAULTS.formats.image]
            );
    }

    if (opts.versions) {
        operation
            .clone()
            .resize(DEFAULTS.versions.image.medium)
            .then(strm => streams[`_medium${ext}`] = strm);

        operation
            .clone()
            .resize(DEFAULTS.versions.image.small)
            .then(strm => streams[`_small${ext}`] = strm);
    }

    if (opts.thumb) {
        operation
            .clone()
            .resize(DEFAULTS.thumbs.image)
            .then(strm => streams[`_thumb.${DEFAULTS.format.image}`] = strm);
    }

    operation
        .clone()
        .then(strm => streams[ext] = strm);
}

module.exports = {
    processImage,
    processVideo,
};
