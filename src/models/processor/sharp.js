const sharp = require('sharp');

const config = require('../../../config');

if (!config.is_dev) {
    sharp.concurrency(config.uv_threadpool_size);
}


const DEFAULTS = {
    // img=>webp, gif|video=>webm
    formats: {
        video: [
            'mp4',
            'flv',
            'webm',
        ],
        image: [
            'jpeg',
            'png',
            'webp',
            'tiff',
        ],
    },
    options: {
        image: {
            jpeg: {
                quality: 100,
                progressive: true,
            },
            png: {
                quality: 100,
                progressive: true,
            },
            webp: {
                quality: 80,
                alphaQuality: 100,
            },
            tiff: {
                quality: 80,
                compression: 'lzw',
                squash: true
            },
        },
        video: {
            audioCodec: 'libfaac',
            videoCodec: 'libx264',
        },
    },
    thumbs: {
        video: '320x?',
        image: 320,
    },
};


function imageMetadata() {
    return sharp().withMetadata();
}

function resizeImage(w, h) {
    return sharp().resize(w, h);
}

function formatToImage(f) {
    return sharp()
        .toFormat(f, DEFAULTS.options.image[f])
        .on('error', err => console.log('ETTTTT', err));
}

function imageThumb(w) {
    return sharp().resize(w ? w / 2 : DEFAULTS.thumbs.image);
}


function processImage(input, opts) {
    const operation = sharp(input);

    if (opts.metadata) {
        operation.withMetadata();
    }

    if (opts.width || opts.height) {
        operation.resize(opts.width, opts.height);
    }

    if (DEFAULTS.formats.image.includes(opts.format)) {
        operation.toFormat(
            opts.format,
            DEFAULTS.options.image[opts.f]
        );
    }

    return operation;
}

exports = {

};

