const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');

function imageToJpg(input, output) {
    sharp(input)
        .jpeg()
        .toFile(output);
}

function videoToMp4(input, output) {
    ffmpeg(input)
        .format('mp4')
        .save(output);
}

function imageThumb(imgPath, thumbPath) {
    sharp(imgPath)
        .resize(500, null)
        .toFile(thumbPath);
}

function videoThumb(videoPath, thumbDir) {
    ffmpeg(videoPath)
        .screenshots({
            count: 1,
            folder: thumbDir,
            size: '320x240'
        });
}

module.exports = {
    imageToJpg,
    videoToMp4,
    imageThumb,
    videoThumb,
};

