/*!
 * ribs
 * Copyright (c) 2013-2014 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

'use strict';

//module.exports = process.env.NODE_ENV != 'test' ?
//	require('../build/Release/ribs') :
//	require('../test/utils/ribs-mock');
var debug = process.env.NODE_ENV != 'production';

module.exports = require('../build/' + (debug ? 'Debug' : 'Release') + '/ribs.node');