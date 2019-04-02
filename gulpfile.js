'use strict'

const path = require('path');
const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const fileinclude = require('gulp-file-include');
const combine = require('stream-combiner2');
const browserSync = require('browser-sync').create();
const rimraf = require('rimraf');
const pug = require('gulp-pug');
const plumber = require('gulp-plumber');

const ENV = {
	dev: $.environments.development,
	prod: $.environments.production
}

gulp.task('html', () => {
	return gulp.src('./dev/*.pug')
		.pipe(plumber())
		.pipe(fileinclude('@@'))
		.pipe(pug({
			pretty: true
		}))
		.pipe(gulp.dest('./public/'))
});

gulp.task('styles', () => {
	return gulp.src('./dev/css/style.less')
		.pipe($.plumber())
		.pipe(ENV.dev($.sourcemaps.init()))
		.pipe($.less())
		.pipe($.autoprefixer({ cascade: false }))
		.pipe($.cssnano())
		.pipe(ENV.dev($.sourcemaps.write()))
		.pipe(gulp.dest('./public/css/'))
});

gulp.task('libs', () => {
	return gulp.src('./dev/js/libs.js')
		.pipe(fileinclude('@@'))
		.pipe($.uglify())
		.pipe(gulp.dest('./public/js/'))
});

gulp.task('scripts', () => {
	return gulp.src(['./dev/js/*.js', '!./dev/js/libs.js'])
		.pipe(ENV.dev($.sourcemaps.init()))
		.pipe($.babel({
			presets: ['env'],
			plugins: ['transform-object-rest-spread']
		}))
		// .pipe($.uglify())
		.pipe(ENV.dev($.sourcemaps.write()))
		.pipe(gulp.dest('./public/js/'))
});

gulp.task('img', () => {
	return gulp.src('./dev/img/**/*.*')
		.pipe(gulp.dest('./public/img/'))
});

gulp.task('pictures', () => {
	return gulp.src('./dev/pictures/**/*.*')
		.pipe($.imagemin())
		.pipe(gulp.dest('./public/pictures/'))
});

gulp.task('icons', function () {
	return gulp
		.src('dev/icons/**/*.svg')
		.pipe($.svgmin(function (file) {
			var prefix = path.basename(file.relative, path.extname(file.relative));

			return {
				plugins: [{
					cleanupIDs: {
					prefix: 'icon-' + prefix,
					minify: true
				}
			}]
		}
	}))
	.pipe($.cheerio({
		run: function ($, file) {
			$('style').remove();
		},
		parserOptions: { xmlMode: true }
	}))
	.pipe($.svgstore())
	.pipe(gulp.dest('public/img'));
});

gulp.task('fonts', () => {
	return gulp.src('./dev/fonts/*.*')
		.pipe(gulp.dest('./public/fonts/'))
});

gulp.task('video', () => {
	return gulp.src('./dev/video/**/*.*')
		.pipe(gulp.dest('./public/video/'))
});

gulp.task('clean', (cb) => {
	rimraf('./public', cb);
});

gulp.task('build', [
	'html',
	'styles',
	'libs',
	'scripts',
	'img',
	'pictures',
	'icons',
	'fonts',
	'video'
]);

gulp.task('watch', () => {
	$.watch(['dev/**/*.pug'], () => {
		gulp.start('html');
		browserSync.reload();
	});

	$.watch(['dev/css/**/*.*','dev/_partials/**/*.*'], function() {
		gulp.start('styles');
		browserSync.reload();
	});

	$.watch(['dev/js/vendor/*.*', 'dev/js/libs.js'], function() {
		gulp.start('libs');
		browserSync.reload();
	});

	$.watch(['dev/js/**/*.js', '!dev/js/libs.js'], function() {
		gulp.start('scripts');
		browserSync.reload();
	});

	$.watch(['dev/img/**/*.*'], function() {
		gulp.start('img');
		browserSync.reload();
	});

	$.watch(['dev/pictures/**/*.*'], function() {
		gulp.start('pictures');
		browserSync.reload();
	});

	$.watch(['dev/icons/**/*.*'], function() {
		gulp.start('icons');
		browserSync.reload();
	});

	$.watch(['dev/fonts/**/*.*'], function() {
		gulp.start('fonts');
		browserSync.reload();
	});

	$.watch(['dev/video/**/*.*'], function() {
		gulp.start('video');
		browserSync.reload();
	});
});

gulp.task('server', () => {
	browserSync.init({
		server: { baseDir: "./public/" },
		port: 9000
	});
});

gulp.task('default', ['build', 'server', 'watch']);
