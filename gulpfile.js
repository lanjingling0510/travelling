/*========================================
 =            Requiring stuffs            =
 ========================================*/


var gulp = require('gulp'),
    weinre = require('gulp-weinre'),
    path = require('path');

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
        boundHost:    '192.168.1.106',
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
