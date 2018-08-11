let gulp = require('gulp')
let uglify = require('gulp-uglify')
let pump = require('pump')
let rename = require('gulp-rename')
let replace = require('gulp-replace')

gulp.task('uglify', function () {
	pump([
		gulp.src('example_page/js/BigPicture.js'),
		uglify(),
		rename('BigPicture.min.js'),
		gulp.dest('./dist')
	])
})

gulp.task('copy', function () {
	pump([
		gulp.src('example_page/js/BigPicture.js'),
		rename('BigPicture.js'),
		gulp.dest('./dist')
	])
})

gulp.task('index', function () {
	pump([
		gulp.src('example_page/js/BigPicture.js'),
		replace('global.BigPicture', 'module.exports'),
		rename('index.js'),
		gulp.dest('./')
	])
})

gulp.task('build', ['copy', 'index', 'uglify'])