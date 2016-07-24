var gulp = require('gulp'),
    uglifyJs = require('gulp-uglify'),
    rename = require('gulp-rename'),
    ghPages = require('gulp-gh-pages'),
    inject = require('gulp-inject'),
    postcss = require('gulp-postcss'),
    autoprefixer = require('autoprefixer'),
    mqpacker = require('css-mqpacker'),
    csswring = require('csswring'),
    concat = require('gulp-concat'),
    browserSync = require('browser-sync').create();

// GITHUB GH-PAGES DEPLOY
gulp.task('deploy', function() {
  return gulp.src('./build/**/*')
    .pipe(ghPages());
});

// INJECT STATIC FILE LINKS INTO HTML (DEV)
gulp.task('inject', function () {
  var target = gulp.src('example_page/index.html');
  return target.pipe(inject(gulp.src(['example_page/js/*.js', '!*/**/*.min.js', 'example_page/css/**/*.min.css'], {read: false}), {relative: true}))
    .pipe(gulp.dest('example_page'));
});

// JAVASCRIPT TASKS
// copy script to dist, uglify
gulp.task('update_dist', function() {
  return gulp.src(['example_page/js/BigPicture.js'])
    .pipe(gulp.dest('./dist'))
    .pipe(uglifyJs())
    .on('error', console.error.bind(console))
    .pipe(rename(function(path) {
      path.basename += '.min';
    }))
    .pipe(gulp.dest('./dist'));
});

// STYLE TASKS
// prefixes / uglifies css
gulp.task('css', function(){
  var processors = [
    autoprefixer({browsers: ['last 2 versions']}),
    mqpacker,
    csswring
  ];
  gulp.src('example_page/css/main.css')
    .pipe(rename("main.min.css"))
    // minify / prefix
    .pipe(postcss(processors))
    // save
    .pipe(gulp.dest('example_page/css/'))
    .pipe(browserSync.stream());
});


//////// BUILD PRODUCTION ////////
// COPY ASSETS
gulp.task('copy_assets_to_production', ['update_dist'], function() {
  gulp.src('dist/BigPicture.min.js')
    .pipe(gulp.dest('build/js'));
  gulp.src('example_page/*.html')
    .pipe(gulp.dest('./build'));
  gulp.src('example_page/css/main.min.css')
    .pipe(gulp.dest('build/css'));
  gulp.src('example_page/img/*')
    .pipe(gulp.dest('build/img'));
  return gulp.src('example_page/videos/*')
    .pipe(gulp.dest('build/videos'));
});
// INJECT SCRIPTS INTO HTML
gulp.task('inject_production', ['copy_assets_to_production'], function() {
  return gulp.src('./build/*.html')
    .pipe(inject(gulp.src(['./build/js/*.js', './build/css/*.css'],{read: false}), {relative: true}))
    .pipe(gulp.dest('./build'));
});

// SERVER / WATCH TASK
// starts server, watches javascript, css
gulp.task('serve', ['css'], function() {
  browserSync.init({
      server: "example_page"
  });
  gulp.watch("example_page/css/main.css", ['css']);
  gulp.watch(["example_page/*.html", "example_page/js/*.js"]).on('change', browserSync.reload);
});


// run production tasks and production server
gulp.task('serve_production', ['build_production'], function(){
  browserSync.init({
      server: "./build"
  });
});

gulp.task('default', ['serve']);
gulp.task('build_production', 
  [
    'update_dist',
    'copy_assets_to_production', 
    'inject_production'
  ]
);