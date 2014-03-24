/*!
 * ribs
 * Copyright (c) 2013-2014 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

'use strict';

//module.exports = process.env.NODE_ENV != 'test' ?
//	require('../build/Release/ribs') :
//	require('../test/utils/ribs-mock');

var mode = ('development' == process.env.NODE_ENV ? 'Debug' : 'Release');

module.exports = require('../build/' + mode + '/ribs.node');