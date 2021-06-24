'use strict';


// Developed by Taras Pyat
// Install all dependencies 
//  npm i --save-dev gulp browser-sync gulp-plumber gulp-rigger gulp-sourcemaps gulp-sass gulp-autoprefixer gulp-clean-css gulp-uglify gulp-cache gulp-imagemin imagemin-jpeg-recompress imagemin-pngquant del
// change on wordpress theme to themename_public
// code


let  project_folder = require("path").basename(__dirname),
     siteUrl   = 'wordpress-3';   // change url of page

     
let path = {
    build: {
        php:   './../'+ project_folder +'_public/**/*.php',
        js:    './../'+ project_folder +'_public/js/',
        css:   './../'+ project_folder +'_public/',
        img:   './../'+ project_folder +'_public/img/',
        fonts: './../'+ project_folder +'_public/fonts/'
    },
    src: {
        php:   './**/*.php',
        js:    './js/scripts.js',
        style: './sass/style.scss',
        img:   './img/**/*.*',
        fonts: './fonts/**/*.*'
    },
    watch: {
        php:   './**/*.php',
        js:    './js/**/*.js',
        css:   './sass/**/*.scss',
        img:   './img/**/*.*'
        },
    clean: './../'+ project_folder +'_public',
};

let config = {
    proxy: siteUrl,
    files: [
        './../'+ project_folder +'_public',

    ],
    notify: false
};

let gulp = require('gulp'),
    webserver = require('browser-sync'),
    plumber = require('gulp-plumber'),
    rigger = require('gulp-rigger'),
    sourcemaps = require('gulp-sourcemaps'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    cleanCSS = require('gulp-clean-css'),
    uglify = require('gulp-uglify'),
    cache = require('gulp-cache'),
    imagemin = require('gulp-imagemin'),
    jpegrecompress = require('imagemin-jpeg-recompress'),
    pngquant = require('imagemin-pngquant'),
    del = require('del'),
    myFiles = [
        './**/**/*',
        '!./bootstrap/**/*',
        '!./log/**/*',
        '!./node_modules/**/*',
        '!node_modules',
        '!./sass/**/*',
        '!sass',
        '!./src_img/**/*',
        '!src_img',
        '!./stylelintrc.json',
        '!./composer.json',
        '!./package.json',
        '!./package-lock.json',
        '!./*.map',
        '!./gulpfile.js'
   ];


gulp.task('webserver', function () {
    webserver(config);
});



gulp.task('css:build', function () {
    return gulp.src(path.src.style)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(gulp.dest(path.build.css))
        .pipe(cleanCSS())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(path.build.css))
        .pipe(webserver.reload({ stream: true }));
});


gulp.task('js:build', function () {
    return gulp.src(path.src.js)
        .pipe(plumber())
        .pipe(rigger())
        .pipe(gulp.dest(path.build.js))
        .pipe(uglify())
        .pipe(gulp.dest(path.build.js))
        .pipe(webserver.reload({ stream: true }));
});

gulp.task('fonts', function () {
    return gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts));
});

gulp.task('image:build', function () {
    return gulp.src(path.src.img)
        .pipe(cache(imagemin([
            imagemin.gifsicle({ interlaced: true }),
            jpegrecompress({
                progressive: true,
                max: 90,
                min: 80
            }),
            pngquant(),
            imagemin.svgo({ plugins: [{ removeViewBox: false }] })
        ])))
        .pipe(gulp.dest(path.build.img));
});

gulp.task('php:build', function() {
    return gulp.src(myFiles)
     .pipe(gulp.dest('../'+ project_folder +'_public'))
   
   });

gulp.task('clean:build', function () {
    return del(path.clean, {force: true});


});

gulp.task('cache:clear', function () {
    cache.clearAll();
});


gulp.task('build',
    gulp.series('clean:build',
        gulp.parallel(
            'php:build',
            'css:build',
            'js:build',
            'fonts',
            'image:build'
        )
    )
);


gulp.task('watch', function () {
    gulp.watch(path.watch.php, gulp.series('php:build'));
    gulp.watch(path.watch.css, gulp.series('css:build'));
    gulp.watch(path.watch.js, gulp.series('js:build'));
    gulp.watch(path.watch.img, gulp.series('image:build'));
    gulp.watch(path.watch.img, gulp.series('image:build'));
});

gulp.task('default', gulp.series(
    'build',
    gulp.parallel('webserver','watch')      
));
