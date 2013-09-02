/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

'use strict';

module.exports = function(grunt) {
	// loads npm tasks
	require('load-grunt-tasks')(grunt);

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		config: {
			test: 'test/{,*/}*.js',
			testUnit: 'test/unit/*.js',
			testSpec: 'test/spec/*.js'
		},
		meta: {
			banner: '/*! <%%= pkg.name %> - v<%%= pkg.version %> - ' +
				'<%%= grunt.template.today("yyyy-mm-dd") %>\n' +
				'<%%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
				'* Copyright (c) <%%= grunt.template.today("yyyy") %> <%%= pkg.author.name %>;' +
				' Licensed <%%= pkg.license %> */\n'
		},
		// TODO: use eslint when available
		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			all: [
				'Gruntfile.js',
				'lib/{,*/}*.js'
			],
			tests: {
				options: {
					expr: true
				},
				src: ['<%= config.test %>']
			}
		},
		mochacli: {
			options: {
				reporter: 'spec',
				bail: true,
				require: ['./test/utils/common']
			},
			unit: {
				options: {
					bail: false
				},
				src: ['<%= config.testUnit %>']
			},
			spec: ['<%= config.testSpec %>']
		}
	});

	// front tasks
	grunt.registerTask('test', [/*'jshint', */'mochacli']);
	grunt.registerTask('test:unit', [/*'jshint', */'mochacli:unit']);
	grunt.registerTask('test:spec', [/*'jshint', */'mochacli:spec']);
};