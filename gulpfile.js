const gulp = require('gulp');
const nodemon = require('gulp-nodemon');
const eslint = require('gulp-eslint');

/* tasks */

gulp.task('start', () => {
    nodemon({
        script: './server',
        ext: 'js html',
        tasks: ['lint'],
    });
});

gulp.task('lint', () => (
    gulp.src(['*.js', '!node_modules/**', '!static/**'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError())
));

/* default */

gulp.task('default', ['start', 'lint']);
