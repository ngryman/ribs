/*!
 * ribs
 * Copyright (c) 2013-2014 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

'use strict';

var ribs = require('./ribs'),
	_ = require('lodash'),
	path = require('path'),
	express = require('express');

/**
 * Exports.
 */

var operationNames = _.keys(ribs.operations);

module.exports = function(root) {

	// root required
	if (!root) throw new Error('ribs.middleware() root path required');

	return function(req, res, next) {
		// early return for root
		if ('/' == req.url) return next();

		var operations;

		try {
			operations = parseOperations(req, res, root);
		}
		catch (err) {
			err.status = 400;
			return next(err);
		}

		// no operations, call next
		if (0 === operations.length)
			return next();

		// headers
		res.on('header', function() {
			// content type
			// if already set, let it
			// if no transcoding it's deduced from source file name
			// if not from the destination format
			var type = res.getHeader('Content-Type') ||
				express.mime.lookup(operations.format || operations.src);

			res.header('Content-Type', type);
		});

		ribs(operations, function(err) {
			if (err) {
				err.status = 400;
				next(err);
			}
		});
	};

};

function parseOperations(req, res, root) {
	// extract options from url
	var operations = parseUrl(req.url);

	// if there is only one operation (`from`), that means there is nothing to do
	if (1 === operations.length) {
		operations.length = 0;
		return operations;
	}

	// set fallback image format
	operations.format = path.extname(operations[0].params);

	// compose full source path
	operations[0].params = path.join(root, operations[0].params);

	// build `to` operation
	buildTo(operations, res);

	return operations;
}

function parseUrl(url) {
	var operations = [],
		current;

	// split arguments with the slash separator
	var args = url.split('/');

	// source file is always the last argument, store it and remove it
	operations.push({ operation: 'from', params: args[args.length - 1] });
	args.length--;

	try {
		// iterate through each argument
		_.each(args, function(arg) {
			// ignore empty arguments
			if (!arg) return;

			// operation is found
			var operation = isOperation(arg);
			if (operation) {
				current = {
					operation: operation,
					params: []
				};
				operations.push(current);
				return;
			}

			// param is found
			var param = isParam(arg);
			if (param) {
				if (current)
					current.params.push(param);
				else
					throw new Error("found parameter '" + param + "' without parent operation");
			}
		});
	}
	catch (err) {
		// if no operation was even parsed (only `from`), treat this as a 404
		// if not this is a 400
		err.status = (operations.length <= 1) ? 404 : 400;
	}

	return operations;
}

function isOperation(arg) {
	// xxx: `to` operation is aliased to `format`
	if ('format' == arg) return 'to';

	return _.find(operationNames, function(name) {
		if (1 === arg.length) return name[0] == arg;
		return name == arg;
	});
}

function isParam(arg) {
	return arg;
}

function buildTo(operations, res) {
	var to = _.find(operations, { operation: 'to' });

	// append a `to` operation if none was present
	if (!to) {
		to = { operation: 'to', params: [] };
		operations.push(to);
	}

	// if transcoding is specified, override existing format
	if (to.params[0])
		operations.format = to.params[0];

	// prepend `res` as destination
	to.params.unshift(res);
}