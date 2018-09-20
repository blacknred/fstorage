const gulp = require('gulp');
const eslint = require('gulp-eslint');
const nodemon = require('gulp-nodemon');

/* tasks */

gulp.task('start', () => {
    nodemon({
        script: './clusters',
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
