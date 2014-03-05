/*!
 * ribs
 * Copyright (c) 2013-2014 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

'use strict';

module.exports = function(grunt) {
	// load npm tasks
	require('load-grunt-tasks')(grunt);
    // load time grunt
    require('time-grunt')(grunt);

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		config: {
			lib: 'lib/{,*/}*.js',
			test: 'test/**/*.js',
			unit: 'test/unit/index.js',
			spec: 'test/spec/index.js'
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
		mochaTest: {
			options: {
				reporter: 'spec',
				bail: true,
				require: ['./test/common']
			},
			unit: {
				src: ['<%= config.unit %>']
			},
			spec: ['<%= config.spec %>'],
			debug: {
				options: {
					'debug-brk': true
				},
				src: ['<%= config.unit %>']
			}
		}
	});

	// front tasks
	grunt.registerTask('test', ['jshint', 'mochaTest']);
	grunt.registerTask('debug', ['jshint', 'mochaTest:debug']);
	grunt.registerTask('test:unit', ['jshint:unit', 'mochaTest:unit']);
	grunt.registerTask('test:spec', ['jshint:spec', 'mochaTest:spec']);
};