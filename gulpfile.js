var gulp = require('gulp');
var browserSync = require('browser-sync');
var cp = require('child_process');
//var gulpSequence = require('gulp-sequence');
var runSequence = require('run-sequence');
var gutil = require('gulp-util');
var rename = require('gulp-rename');
//var wrap = require('gulp-wrap');
var concat = require('gulp-concat');
var changed = require('gulp-changed');
//var gulpFilter = require('gulp-filter');
//var plumber = require('gulp-plumber')


// CSS
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
//var compass = require('gulp-compass');
var postcss = require('gulp-postcss');
var purify = require('gulp-purifycss');
//var nano = require('gulp-cssnano');
var autoprefixer = require('autoprefixer');
var mqpacker = require('css-mqpacker');
var cssnano = require('cssnano');
var critical = require('critical');

// JS
//var mainBowerFiles = require('main-bower-files');
var uglify = require('gulp-uglify');
var striplog = require('gulp-strip-debug');

// Images
var imagemin    = require('gulp-imagemin');
var imageminJpegoptim = require('imagemin-jpegoptim');
var pngquant = require('imagemin-pngquant');
var webp = require('gulp-webp');
//var imageresponsive = require('gulp-responsive-images');
var imageresize    = require('gulp-image-resize');

// HTML
//var htmlmin = require('gulp-htmlmin');



/**
*
* // CSS
* - Compile (sass)
* - Generate Sourcemaps (sourcemaps)
* - Clean unused css rules (purify)
* - Autoprefixer, Group MediaQueries, Minify (Postcss : autoprefixer, mqpacker, cssnano)
*
**/

var processors = [
  autoprefixer({browsers: ['last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4']}),
  mqpacker,
  cssnano()
  //cssnano({discardComments: {removeAll: true}})
];

function cleanCss() {
    return gutil.env.env === 'prod'
        ? purify(['*.html','_includes/*.html','_layouts/*.html','js/main.min.js'])
        : gutil.noop();
}

function optCss() {
    return gutil.env.env === 'prod'
        ? postcss(processors)
        : gutil.noop();
}

gulp.task('sass', function() {
	return gulp.src(['_sass/*.scss', '!_sass/*-dev.scss'])
    .pipe(sourcemaps.init())
    .pipe(sass({
        includePaths: ['_sass'],
        onError: browserSync.notify
    }))
    //.pipe(cleanCss())
    //.pipe(optCss())
    .pipe(purify(['*.html','_includes/*.html','_layouts/*.html','js/main.min.js']))
    .pipe(postcss(processors))
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('_site/css'))
    .pipe(browserSync.reload({stream:true}))
    .pipe(gulp.dest('css'));
});

gulp.task('sass-dev', function() {
 return gulp.src(['_sass/*-dev.scss', '!_sass/main.scss'])
    .pipe(sourcemaps.init())
    .pipe(sass({
        includePaths: ['_sass'],
        //onError: browserSync.notify
    }).on('error', sass.logError))
    //.pipe(purify(['*.html','_includes/*.html','_layouts/*.html','js/main.min.js']))
    //.pipe(postcss(processors))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('_site/css'))
    .pipe(browserSync.reload({stream:true}))
    .pipe(gulp.dest('css'));
});

gulp.task('css-dev', ['sass-dev']);

gulp.task('critical', function() {
  critical.generate({
    base: '_site/',
    src: 'index.html',
    css: ['css/main.min.css'],
    dimensions: [{
      width: 320,
      height: 480
    },{
      width: 768,
      height: 1024
    },{
      width: 1280,
      height: 960
    }],
    dest: '_includes/critical.css',
    minify: true,
    extract: false,
    ignore: ['font-face']
  });
});

gulp.task('css', function() {
	runSequence(
		['sass'],
		['critical']
	);
});



/**
*
* // JS
* - Concat (concat)
* - Minify (uglify)
* - Remove console (striplog)
*
**/

gulp.task('js-main', function() {
  return gulp.src(['_js-src/vendor/*.js', '_js-src/main.js'])
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(striplog())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('js/'))
    .pipe(gulp.dest('_site/js/'))
});

gulp.task('js-vendor-dev', function() {
  return gulp.src(['_js-src/vendor/*.js'])
    .pipe(concat('vendor.js'))
    .pipe(rename({ suffix: '.dev' }))
    .pipe(gulp.dest('js/'))
    .pipe(gulp.dest('_site/js/'))
});

gulp.task('js-main-dev', function() {
  return gulp.src(['_js-src/main.js'])
    .pipe(concat('main.js'))
    .pipe(rename({ suffix: '.dev' }))
    .pipe(gulp.dest('js/'))
    .pipe(gulp.dest('_site/js/'))
});

gulp.task('js-dev', ['js-vendor-dev', 'js-main-dev']);

gulp.task('js-first', function() {
  return gulp.src(['_js-src/first/*.js'])
    .pipe(concat('first.js'))
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('_includes'))
});

gulp.task('js', ['js-main', 'js-first']);


/**
*
* // Images
* - Just new image (changed)
* - Resize (imageresize)
* - Minify (imagemin)
* - https://gist.github.com/ryantbrown/239dfdad465ce4932c81
**/

var imgoptim = {
  progressive: true,
  optimizationLevel: 5,
  interlaced: true,
  svgoPlugins: [{removeViewBox: false}],
  use: [pngquant({quality: '65-80'})]
};

// Images Full
gulp.task('images-default', function() {
  return gulp.src(['_img-src/*/*.jpg', '_img-src/*/*.png'])
    .pipe(changed('img'))
    .pipe(imageresize({ width: 600 }))
    .pipe(imagemin({
        progressive: true,
        optimizationLevel: 7,
        interlaced: true,
        svgoPlugins: [{removeViewBox: false}],
        use: [pngquant({quality: '10-30'})]
    }))
    .pipe(imageminJpegoptim({max: 40})())
    .pipe(gulp.dest('img'))
    .pipe(gulp.dest('_site/img'))
});

gulp.task('images-large', function() {
  return gulp.src(['_img-src/*/*.jpg', '_img-src/*/*.png'])
    .pipe(changed('img'))
    .pipe(imageresize({ width: 600 }))
    .pipe(imagemin(imgoptim))
    .pipe(imageminJpegoptim({max: 80})())
    .pipe(rename({ suffix: '-600' }))
    .pipe(gulp.dest('img'))
    .pipe(gulp.dest('_site/img'))
});

gulp.task('images-medium', function() {
  return gulp.src(['_img-src/*/*.jpg', '_img-src/*/*.png'])
    .pipe(changed('img'))
    .pipe(imageresize({ width: 500 }))
    .pipe(imagemin(imgoptim))
    .pipe(imageminJpegoptim({max: 80})())
    .pipe(rename({ suffix: '-500' }))
    .pipe(gulp.dest('img'))
    .pipe(gulp.dest('_site/img'))
});

gulp.task('images-small', function() {
  return gulp.src(['_img-src/*/*.jpg', '_img-src/*/*.png'])
    .pipe(changed('img'))
    .pipe(imageresize({ width: 290 }))
    .pipe(imagemin(imgoptim))
    .pipe(imageminJpegoptim({max: 80})())
    .pipe(rename({ suffix: '-290' }))
    .pipe(gulp.dest('img'))
    .pipe(gulp.dest('_site/img'))
});

gulp.task('images-full', ['images-default', 'images-large', 'images-medium', 'images-small']);


// Images thumb
gulp.task('imagesthumb-default', function() {
  return gulp.src(['_img-src/*/*.jpg', '_img-src/*/*.png'])
    .pipe(changed('img'))
    .pipe(imageresize({ width: 500, height: 333, crop: true, gravity: 'North' }))
    .pipe(imagemin({
        progressive: true,
        optimizationLevel: 7,
        interlaced: true,
        svgoPlugins: [{removeViewBox: false}],
        use: [pngquant({quality: '10-30'})]
    }))
    .pipe(rename({ suffix: '-thumbnail' }))
    .pipe(gulp.dest('img'))
    .pipe(gulp.dest('_site/img'))
});

gulp.task('imagesthumb-large', function() {
  return gulp.src(['_img-src/*/*.jpg', '_img-src/*/*.png'])
    .pipe(changed('img'))
    .pipe(imageresize({ width: 500, height: 333, crop: true, gravity: 'North' }))
    .pipe(imagemin(imgoptim))
    .pipe(rename({ suffix: '-thumbnail-500' }))
    .pipe(gulp.dest('img'))
    .pipe(gulp.dest('_site/img'))
});

gulp.task('imagesthumb-medium', function() {
  return gulp.src(['_img-src/*/*.jpg', '_img-src/*/*.png'])
    .pipe(changed('img'))
    .pipe(imageresize({ width: 345, height: 230, crop: true, gravity: 'North' }))
    .pipe(imagemin(imgoptim))
    .pipe(rename({ suffix: '-thumbnail-345' }))
    .pipe(gulp.dest('img'))
    .pipe(gulp.dest('_site/img'))
});

gulp.task('imagesthumb-small', function() {
  return gulp.src(['_img-src/*/*.jpg', '_img-src/*/*.png'])
    .pipe(changed('img'))
    .pipe(imageresize({ width: 290, height: 193, crop: true, gravity: 'North' }))
    .pipe(imagemin(imgoptim))
    .pipe(rename({ suffix: '-thumbnail-290' }))
    .pipe(gulp.dest('img'))
    .pipe(gulp.dest('_site/img'))
});

gulp.task('images-thumb', ['imagesthumb-default', 'imagesthumb-large', 'imagesthumb-medium', 'imagesthumb-small']);


gulp.task('imageswebp', function () {
  return gulp.src(['img/*/*.jpg', 'img/*/*.png'])
    .pipe(changed('img'))
    .pipe(webp())
    .pipe(gulp.dest('img'))
    .pipe(gulp.dest('_site/img'));
});

gulp.task('imagesbase', function () {
  return gulp.src(['_img-src/*.jpg', '_img-src/*.png', '_img-src/*.svg'])
    .pipe(changed('img'))
    .pipe(imagemin(imgoptim))
    .pipe(gulp.dest('img'))
    .pipe(gulp.dest('_site/img'));
});

gulp.task('images', function() {
	runSequence(
		['images-default', 'images-large', 'images-medium', 'images-small'],
		['imagesthumb-default', 'imagesthumb-large', 'imagesthumb-medium', 'imagesthumb-small'],
		['imageswebp', 'imagesbase']
	);
});


/**
*
* // HTML
* - Concat plugin from Bower
* - Minify
*
**/

gulp.task('html', function() {
    return gulp.src(['_site/*.html', '_site/*/*.html'])
        .pipe(htmlmin({
          collapseWhitespace: true,
          removeComments: true,
          removeRedundantAttributes: true
        }))
        .pipe(gulp.dest('_site'))
});



var messages = {
    jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};
/**
 * Watch scss files for changes & recompile
 * Watch html/md files, run jekyll & reload BrowserSync
 */
gulp.task('watch', function () {
    //gulp.watch(['_sass/*.scss'], ['sass']);
    gulp.watch(['_sass/*.scss', '_sass/*/*.scss'], ['sass']);
    gulp.watch(['*.html', '_includes/*.html', '_layouts/*.html', '_posts/*'], ['jekyll-rebuild']);
});

/**
 * Build the Jekyll Site
 */
gulp.task('jekyll-build', function (done) {
    browserSync.notify(messages.jekyllBuild);
    return cp.spawn('jekyll', ['build'], {stdio: 'inherit'})
        .on('close', done);
});

/**
 * Rebuild Jekyll & do page reload
 */
gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
    browserSync.reload();
});

/**
 * Wait for jekyll-build, then launch the Server
 */
gulp.task('browser-sync', ['sass', 'jekyll-build'], function() {
    browserSync({
        server: {
            baseDir: '_site'
        }
    });
});

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync & watch files.
 */
gulp.task('default', ['browser-sync', 'watch']);

gulp.task('build', ['css', 'js', 'images']);
// gulp.task('build', [
//   'sass', 'critical',
//   'js', 'js-first',
//   'images'
// ]);
