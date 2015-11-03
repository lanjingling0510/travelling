/* eslint-disable */
/*========================================
 =            Requiring stuffs            =
 ========================================*/

var gulp = require('gulp'),
    weinre = require('gulp-weinre'),
    path = require('path'),
    sass = require('gulp-sass'),
    rename = require('gulp-rename'),
    minifyCss = require('gulp-minify-css');

/*=====================================
 =        Default Configuration        =
 =====================================*/

var config = {
    root: 'www',
    server: {
        host: '0.0.0.0',
        port: '8080'
    },
    weinre: {
         httpPort:     8001,
        boundHost:    '192.168.31.219',
        verbose:      false,
        debug:        false,
        readTimeout:  5,
        deathTimeout: 15
  }

};




/*===================================================
=            Starts a Weinre Server                 =
===================================================*/

gulp.task('weinre', function() {
  if (typeof config.weinre === 'object') {
    weinre(config.weinre);
  } else {
    throw new Error('Weinre is not configured');
  }
});


/*================================================
 =            CSS sass            =
 ================================================*/

gulp.task('sass', function(done) {
    gulp.src('./scss/ionic.scss')
        .pipe(sass({
            errLogToConsole: true
        }))
        .pipe(gulp.dest('./src/app/lib/ionic/css'))
        .pipe(minifyCss({
            keepSpecialComments: 0
        }))
        .pipe(rename({ extname: '.css' }))
        .pipe(gulp.dest('./src/app/lib/ionic/css'))
        .on('end', done);
});


/*================================================
 =            Report Errors to Console            =
 ================================================*/

gulp.on('error', function (e) {
    throw(e);
});



/*====================================
 =            Default Task            =
 ====================================*/

gulp.task('default', ['weinre'], function (done) {

});
