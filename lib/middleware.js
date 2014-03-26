/*!
 * ribs
 * Copyright (c) 2013-2014 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

'use strict';

var ribs = require('./ribs'),
	utils = ribs.utils,
	_ = require('lodash'),
	path = require('path'),
	express = require('express'),
	FileStore = require('stores').FileStore;

/**
 * Fast check of param value.
 * This is only useful to quickly filter values that we are sure to be invalid
 * and thus avoid to allocate and invoke a ribs pipeline that will fail for sure.
 * This could be a good friend to fight against DDOS and others...
 *
 * @type {RegExp}
 */
var RE_PARAM = new RegExp('^(?:' +
	// formulas and numbers
	'[xar-]?\\d+|' +

	// anchors and gravities
	'[trbl]{1,2}|' +

	// image format
	'jpg|png|bmp'  +
')$');

/**
 * Exports.
 */

/**
 * Cache operation names.
 *
 * `from` and `to` are removed because they processed by the middleware.
 * `to` is aliased to `format` and does not accept filename as parameter.
 *
 * @type {Array}
 */
var operationNames = _(ribs.operations).keys().without('from', 'to').value();
operationNames.push('format');

module.exports = function(root) {

	// root required
	if (!root) throw new Error('ribs.middleware() root path required');

	// TODO: handle cache at the store level
	// TODO: refactor to know if there operations or if we should pass to next, this would avoid useless store access
	// TODO: mute errors logs

	var store = new FileStore({ root: root });

	return function(req, res, next) {
		// early return if root url
		if ('/' == req.url) return next();

		// only accepts GET method
		if ('GET' != req.method) return;

		// let's see if url describes some operations
		// to know if we are in charge here
		parseOperations(req, next, function(operations) {
			// headers
			res.on('header', function() {
				// content type
				// if already set, let it
				// if no transcoding it's deduced from source file name
				// if not from the destination format
				var type = res.getHeader('Content-Type') ||
					express.mime.lookup(operations.format);

				res.header('Content-Type', type);
			});

			// let's see if the store already contains
			// the pre-processed image
			store.get(req, res, next, function(req, slot, next) {
				// set `slot` as destination stream
				var format = _.find(operations, { operation: 'to' });
				format.params.unshift(slot);

				ribs(operations, function(err) {
					if (err) {
						err.status = 400;
						next(err);
					}
				});
			});
		});
	};

	/**
	 *
	 * @param req
	 * @param next
	 * @param callback
	 * @return {*}
	 */
	function parseOperations(req, next, callback) {
		var url = req.url,
			operations = [],
			current;

		// split arguments with the slash separator
		var args = url.split('/');

		// source file is always the last argument, store it and remove it
		var pathname = path.join(root, args[args.length - 1]);
		var from = { operation: 'from', params: [pathname] };
		args.length--;

		try {
			// iterate through each argument
			_.each(args, function(arg) {
				// ignore empty arguments
				if (!arg) return;

				// operation is found
				var operation = parseOperation(arg);
				if (operation) {
					current = {
						operation: operation,
						params: []
					};
					operations.push(current);
					return;
				}

				// param is found
				var param = parseParam(arg);
				if (param) {
					if (current) {
						current.params.push(param);
						return;
					}
					else
					// a know param has been parsed before any operation
					// that means nothing...
						throw null;
				}

				if (current)
					throw new Error('invalid parameter ' + arg + ' for operation ' + current.operation);
				throw null;
			});
		}
		catch (err) {
			// silent error, call next middleware
			if (!err) return next();

			// arguments error
			err.status = 400;
			return next(err);
		}

		// no operations, call next
		if (0 === operations.length)
			return next();

		// prepend `from` operation
		operations.unshift(from);

		// ensure there is a `format` (`to`) operation
		var format = _.find(operations, { operation: 'format' });
		if (!format) {
			format = { operation: 'to', params: [] };
			operations.push(format);
		}
		else
			format.operation = 'to';

		// set image format for content type
		operations.format = format.params[0] || path.extname(operations[0].params[0]);

		callback(operations);
	}
};

function parseOperation(arg) {
	return _.find(operationNames, function(name) {
		if (1 === arg.length) return name[0] == arg;
		return name == arg;
	});
}

function parseParam(arg) {
	if (RE_PARAM.test(arg))
		return arg;
}