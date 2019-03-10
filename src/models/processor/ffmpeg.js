const child = require('child_process');
const ffmpeg = require('fluent-ffmpeg');
const stream = require('stream');

const ffmpegThrough = new stream.PassThrough();



const through = new stream.PassThrough();

function processVideo(input, opts) {
    const operation = ffmpeg(input);

    operation
        .format(opts.format)
        // .aspect('4:3')
        .audioCodec(DEFAULTS.options.video.audioCodec)
        .videoCodec(DEFAULTS.options.video.videoCodec)
        .on('error', e => console.log);

    if (opts.width || opts.height) {
        operation.size(`${opts.width || '?'}x${opts.height || '?'}`);
    }

    operation.pipe(ffmpegThrough);

    return ffmpegThrough;
}







function resizeVideo(h, w) {
    const th = new stream.PassThrough();
    ffmpeg(th).size(`${h || '?'}x${w || '?'}`);
    return th;
}


const rdd = new stream.Readable({
    read() {}
});
const th = new stream.PassThrough();

function formatToVideo(f) {
    // th.on('data', console.log);
    th.pipe(rdd);
    ffmpeg(rdd) // Path.resolve(__dirname, '../tests/integration/1.avi')
        // .audioCodec('libfaac')
        // .videoCodec('libx264')
        // .input('pipe:0')
        .format('avi')
        .size('20x?')
        .on('error', (e, stdout, stderr) => console.log('ooooooooooooooooooooo', e, stderr))
        .on('end', () => console.log('has been converted.'))
        .saveToFile(Path.resolve(__dirname, '../tests/integration/13.avi'))
    //.pipe(th);
    // .aspect('4:3')
    // .audioCodec(DEFAULTS.options.video.audioCodec)
    // .videoCodec(DEFAULTS.options.video.videoCodec);
    return th;
}

function videoThumb(w) {
    return ffmpeg()
        .size(w ? `${w}x?` : DEFAULTS.thumbs.video)
        .noAudio()
        .seek('0:01');
}

function ffmpegRaw(args = []) {
    const fmpeg = child.spawn('ffmpeg', args);

    // stream.Duplex.call(this);
    through.pipe(fmpeg.stdin).pipe(fmpeg.stdout);

    // through.on('data', console.log);
    fmpeg.stdin.on('data', () => console.log('in'));
    fmpeg.stdout.on('data', () => console.log('out'));
    fmpeg.stderr.on('data', data => console.log(data.toString()));
    fmpeg.stderr.on('end', () => console.log('has been converted.'));
    fmpeg.stderr.on('exit', () => console.log('child process exited'));
    fmpeg.stderr.on('close', () => console.log('...closing time! bye'));

    return through;
}
// require('util').inherits(ffmpegRaw, stream.PassThrough);

// ffmpegRaw.

function resizeVideoRaw(h, w) {
    return ffmpegRaw([]);
}

function formatToVideoRaw(f) {
    const args = {
        webm: [
            '-i', 'pipe:0',
            '-codec:v', 'libvpx', '-quality', 'good', '-cpu-used', '0',
            '-b:v', '225k', '-qmin', '10', '-qmax', '42', '-maxrate', '300k',
            '-bufsize', '1000k', '-threads', '2', '-vf', 'scale=-1:560',
            '-codec:a', 'libvorbis', '-b:a', '128k', '-through', '2', '-f', 'webm',
            'pipe:1'
        ]
    };
    return ffmpegRaw(['-i', 'pipe:0', '-f', `${f}`, 'pipe:1']);
}
