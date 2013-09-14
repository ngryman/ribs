/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

'use strict';

/**
 * Common test modules dependencies.
 */

global._ = require('lodash');
global.async = require('async');
global.optify = require('optify');
global.chai = require('chai');
global.sinon = require('sinon');
global.should = global.chai.should();

global.chai.use(require('sinon-chai'));