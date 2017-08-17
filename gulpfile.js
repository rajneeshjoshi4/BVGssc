var gulp = require('gulp');
var gutil = require('gulp-util');
var clean = require('gulp-clean'); // Removing files and folders
var less = require('gulp-less'); //Convert LESS to CSS
var cssmin = require('gulp-cssmin'); //Minify CSS
var LessAutoprefix = require('less-plugin-autoprefix');
var htmlmin = require("gulp-htmlmin"); //Minify HTMLs
var uglify = require('gulp-uglify'); //Minify JS

var rename = require('gulp-rename'); //Rename the CSS/html/js files
var flatten = require('gulp-flatten'); //remove or replace relative path for files
var plumber = require('gulp-plumber'); //Prevent pipe breaking caused by errors from gulp plugins
var runSequence = require('run-sequence'); //Run task in order
var ngAnnotate = require('gulp-ng-annotate');

var autoprefix = new LessAutoprefix({
  browsers: ['last 2 versions', '> 1%', 'ie 8', 'ie 9']
});

var browserify = require('browserify'); //allows us to write node.js-style modules that compile for use in the browser
var _ = require('underscore');
var source = require('vinyl-source-stream'); // convert the readable stream you get from browserify into a vinyl stream that is what gulp is expecting to get.
var buffer = require('vinyl-buffer'); //gulp-uglify dosen't support stream, so you should convert stream to buffer using vinyl-buffer

var connect = require("gulp-connect"); // Runs a local dev server
var open = require("gulp-open"); // Open a URL in a Web browser

var bases = {
    app: './html/app/',
    dist: './html/dist/',
  },
  paths = {
    less: 'less/**/*.less',
    lessApp: 'less/manifest.less',
    //    lessLibs: ['./node_modules/bootstrap/less/bootstrap.less'],
    js: ['js/**/*.js', '!js/*.min.js'],
    htmlindex: 'index.html',
    htmlview: 'view/**/*.html',
    //    htmltemplates: 'view/templates/*.html',
    img: 'img/*.*',
    font: 'fonts/*.*'
  };

// If true it allow you to not minify your html, css, js
var debug = false;

gulp.task("cleanfolder", function () {
  return gulp.src(bases.dist, {
      read: false
    })
    .pipe(clean());
});

gulp.task("connect", function () {
  var b = connect.server({
    root: ['HTML/dist'],
    port: 8282,
    base: "http://localhost",
    livereload: true
  });
  return b;
});

gulp.task("open", ["connect"], function () {
  var b = gulp.src("HTML/dist/index.html")
    .pipe(open({
      uri: "http://localhost:8282/#!/login",
      "app": "chrome"
    }));
  return b;
});

gulp.task('appCSS', function () {
  var b = gulp.src(paths.lessApp, {
      cwd: bases.app
    })
    .pipe(less({
      plugins: [autoprefix]
    }));
  if (!debug) {
    b = b.pipe(cssmin())
  };
  return b
    .pipe(rename('application.min.css'))
    .pipe(gulp.dest('css', {
      cwd: bases.dist
    }));
});

gulp.task('vendorsCSS', function () {
  var b = gulp.src([
            './node_modules/**/bootstrap.min.css'
        ])
    .pipe(plumber());
  if (!debug) {
    b = b.pipe(cssmin())
  };
  return b
    .pipe(rename('vendors.min.css'))
    .pipe(gulp.dest('css', {
      cwd: bases.dist
    }));
});

gulp.task('htmlindex', function () {
  var b = gulp.src(paths.htmlindex, {
    cwd: bases.app
  });
  if (debug) {
    b = b.pipe(htmlmin({
      collapseWhitespace: true
    }));
  }
  return b
    .pipe(flatten())
    .pipe(gulp.dest(bases.dist));
});

gulp.task('htmlviews', function () {
  var b = gulp.src(paths.htmlview, {
    cwd: bases.app
  });
  if (debug) {
    b = b.pipe(htmlmin({
      collapseWhitespace: true
    }));
  }
  return b
    .pipe(flatten({
      includeParents: -1 //it will include the number of bottom-level parents in the output
    }))
    .pipe(gulp.dest('view', {
      cwd: bases.dist
    }));
});

//gulp.task('htmltemplates', function () {
//  var b = gulp.src(paths.htmltemplates, {
//    cwd: bases.app
//  });
//  if (!debug) {
//    b = b.pipe(htmlmin({
//      collapseWhitespace: true
//    }));
//  }
//  return b
//    .pipe(flatten())
//    .pipe(gulp.dest('view/templates', {
//      cwd: bases.dist
//    }));
//});

//gulp.task('vendorsJS', function () {
//  var b = browserify();
//  getNPMPackageIds().forEach(function (id) {
//    b.require(id);
//  });
//
//  b = b.bundle()
//    .pipe(source('vendors.min.js'))
//    .pipe(buffer());
//
//  if (debug) {
//    b = b.pipe(uglify());
//  }
//  return b
//    .pipe(gulp.dest('js', {
//      cwd: bases.dist
//    }));
//});

gulp.task('appJS', function () {
  var b = browserify('./html/app/js/app.js');
  b = b.bundle()
    .pipe(source('app.min.js')) // gives streaming vinyl file object
    .pipe(buffer()) // convert from streaming to buffered vinyl file object
    .pipe(ngAnnotate());
  if (debug) {
    b = b.pipe(uglify()); // now gulp-uglify works
  }
  return b
    .pipe(gulp.dest('js', {
      cwd: bases.dist
    }));
});



gulp.task('copyImg', function () {
  var b = gulp.src(paths.img, {
      cwd: bases.app
    })
    .pipe(flatten());
  return b
    .pipe(gulp.dest('img', {
      cwd: bases.dist
    }));
});

gulp.task('copyFont', function () {
  var b = gulp.src(paths.font, {
      cwd: bases.app
    })
    .pipe(flatten());
  return b
    .pipe(gulp.dest('fonts', {
      cwd: bases.dist
    }));
});


/* gulp : Default tasks*/
gulp.task('default', ['appCSS', 'vendorsCSS', 'htmlindex', 'htmlviews', 'appJS', 'copyImg', 'copyFont']);
/* gulp serve : to run the app with server*/

/* First run all default task and then open the server */
gulp.task('build', function (callback) {
  runSequence('cleanfolder', 'default', callback)
});

gulp.task('UIbuild', function (callback) {
  runSequence('cleanfolder', 'default', ['open'], callback)
});

/* Watches task */
gulp.task('watchcss', function () {
  gulp.watch(paths.less, {
    cwd: bases.app
  }, ['appCSS']);
});


gulp.task('watchhtml', function () {
  gulp.watch(paths.htmlindex, {
    cwd: bases.app
  }, ['htmlindex']);
  gulp.watch(paths.htmlview, {
    cwd: bases.app
  }, ['htmlviews']);
  //    gulp.watch(paths.htmltemplates, {
  //        cwd: bases.app
  //    }, ['htmltemplates']);
});

gulp.task('watchjs', function () {
  gulp.watch(paths.js, {
    cwd: bases.app
  }, ['appJS']);
});


gulp.task('watch', ['watchcss', 'watchhtml', 'watchjs']);

/**
 * Helper functions
 * Get all dependencies from package.json
 */

//function getNPMPackageIds() {
//  var packageManifest = {};
//  try {
//    packageManifest = require('./package.json');
//  } catch (e) {
//    // does not have a package.json manifest
//  }
//  return _.keys(packageManifest.dependencies) || [];
//}