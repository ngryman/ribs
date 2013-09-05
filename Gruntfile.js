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
			lib: 'lib/{,*/}*.js',
			test: 'test/**/*.js',
			unit: 'test/unit/{,*/}*.js',
			spec: 'test/spec/{,*/}*.js'
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
			options: grunt.file.readJSON('.jshintrc'),
			lib: ['<%= config.lib %>'],
			unit: {
				options: {
					expr: true
				},
				src: ['<%= config.unit %>']
			},
			spec: {
				options: {
					expr: true
				},
				src: ['<%= config.spec %>']
			},
			misc: ['Gruntfile.js']
		},
		mochacli: {
			options: {
				reporter: 'spec',
				bail: true,
				require: ['./test/common']
			},
			unit: {
				options: {
					reporter: 'landing'
				},
				src: ['<%= config.unit %>']
			},
			spec: ['<%= config.spec %>']
		}
	});

	// front tasks
	grunt.registerTask('test', ['jshint', 'mochacli']);
	grunt.registerTask('test:unit', ['jshint:unit', 'mochacli:unit']);
	grunt.registerTask('test:spec', ['jshint:spec', 'mochacli:spec']);
};