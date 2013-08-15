/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * MIT Licensed
 */

'use strict';

module.exports = function(grunt) {
	// loads npm tasks
	require('load-grunt-tasks')(grunt);

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		config: {
			test: 'test/{,*/}*.js'
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
				bail: true
			},
			all: ['<%= config.test %>']
		}
	});

	// aliases
	grunt.registerTask('test', ['mochacli']);
};