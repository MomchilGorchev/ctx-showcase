/**
 *
 * Static web building automation script
 *
 */

'use strict';

// Include Gulp & Tools We'll Use
var gulp = require('gulp');
var del = require('del');
var autoprefixer = require('gulp-autoprefixer');
var changed = require('gulp-changed');
var csso = require('gulp-csso');
var _if = require('gulp-if');
var imagemin = require('gulp-imagemin');
var jshint = require('gulp-jshint');
var minifyHtml = require('gulp-minify-html');
var sass = require('gulp-sass');
var _size = require('gulp-size');
var uglify = require('gulp-uglify');
var useref = require('gulp-useref');
var runSequence = require('run-sequence');


var browserSync = require('browser-sync');
var reload = browserSync.reload;

// Source files
var SRC = {
    js: 'app/js/**/*.js',
    css: [
        'app/css/*.scss',
        'app/css/**/*.css'
    ],
    html: 'app/html/**/*.html',
    img: 'app/img/**/*',
    fonts: 'app/fonts/**/*'
};

// Destination files
var DEST = {
    js: 'dist/js',
    css: 'dist/css',
    html: 'dist',
    img: 'dist/img',
    fonts: 'dist/fonts'
};

var AUTOPREFIXER_BROWSERS = [
    'ie >= 8',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
];

// Lint JavaScript
gulp.task('jshint', function () {
    return gulp.src(SRC.js)
        .pipe(reload({stream: true, once: true}))
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(_if(!browserSync.active, jshint.reporter('fail')));
});

// Optimize images
gulp.task('img', function () {
    return gulp.src(SRC.img)
        .pipe(imagemin({
            progressive: true,
            interlaced: true
        }))
        .pipe(gulp.dest(DEST.img))
        .pipe(_size({title: 'img'}));
});

// Copy all files (that are not HTML) in the html folder
gulp.task('copy', function () {
    return gulp.src([
        'app/html/**/*',
        '!app/html/**/*.html'
    ], {
        dot: true
    }).pipe(gulp.dest('dist'))
        .pipe(_size({title: 'copy'}));
});

// Copy fonts
gulp.task('fonts', function () {
    return gulp.src(SRC.fonts)
        .pipe(gulp.dest(DEST.fonts))
        .pipe(_size({title: 'fonts'}));
});

// Compile and prefix your css
gulp.task('css', function () {
    return gulp.src(SRC.css)
        .pipe(changed('css', {extension: '.scss'}))
        .pipe(sass({
            precision: 10,
            onError: console.error.bind(console, 'Sass error:')
        }))
        .pipe(autoprefixer({browsers: AUTOPREFIXER_BROWSERS}))
        .pipe(gulp.dest('.tmp/css'))
        .pipe(_if('*.css', csso()))
        .pipe(gulp.dest(DEST.css))
        .pipe(_size({title: 'css'}));
});

// Scan css for assets and optimize them
gulp.task('html', function () {
    var assets = useref.assets({searchPath: '{.tmp,app}'});

    return gulp.src(SRC.html)
        .pipe(assets)
        .pipe(_if('*.js', uglify({
            preserveComments: 'some'
        })))
        .pipe(_if('*.css', csso()))
        .pipe(assets.restore())
        .pipe(useref())
        .pipe(_if('*.html', minifyHtml({
            conditionals: true
        })))
        .pipe(gulp.dest(DEST.html))
        .pipe(_size({title: 'html'}));
});

// Clean production folder
gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

// Watch files for changes and reload
gulp.task('serve', ['css'], function () {
    browserSync({
        notify: false,
        logPrefix: 'SDK',
//        https: true,
        server: ['.tmp', 'app', 'app/html']
    });

    gulp.watch([SRC.html], reload);
    gulp.watch(['app/css/**/*.{scss,css}'], ['css', reload]);
    gulp.watch([SRC.js], ['jshint']);
    gulp.watch([SRC.img], reload);
});

// Build and serve the output from the dist build
gulp.task('serve:dist', ['default'], function () {
    browserSync({
        notify: false,
        logPrefix: 'SDK',
        https: true,
        server: 'dist'
    });
});

// Build for production (default)
gulp.task('default', ['clean'], function (cb) {
    runSequence('css', ['jshint', 'html', 'img', 'fonts', 'copy'], cb);
});
