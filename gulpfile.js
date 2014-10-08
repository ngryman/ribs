/*!
 * ribs
 * Copyright (c) 2013-2014 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

'use strict';

var gulp = require('gulp')
	, jshint = require('gulp-jshint')
	, mocha = require('gulp-mocha');

var paths = {
	lib: ['lib/{,*/}*.js'],
	test: ['test/{unit,spec}/*.js']
};

gulp.task('lint', function() {
	return gulp.src(paths.lib)
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('test', function() {
	return gulp.src(paths.test, { read: false })
		.pipe(mocha({
			require: './test/common',
			bail: true
		}));
});

gulp.task('default', ['lint', 'test']);