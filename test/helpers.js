/*!
 * ribs
 * Copyright (c) 2013-2014 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var hooks = require('../lib/pipeline').hooks;

var helpers = module.exports = {};

helpers.withParams = curry(function(params, test, done) {
	var seq = params.map(function(param) {
		return function(done) {
			test(param, done);
		};
	});
	async.series(seq, done);
});

helpers.invalidTypes = curry(function(types, nullbale, test, done) {
	var valuesHash = {
		array: [],
		object: {},
		string: 'woot',
		number: 1337,
		boolean: true
	};

	var values = _(valuesHash)
		.map(function(val, type) {
			if (!~types.indexOf(type)) return val;
		})
		.compact()
		.value();
	if (!nullbale) values.push(null);

	return helpers.withParams(values, test, done);
});

helpers.checkError = function(err, message) {
	err.should.be.instanceof(Error);
	err.message.should.equal(message);
};

helpers.checkTypeError = function(err, types, argName, arg) {
	var message;

	if (null == arg)
		message = 'invalid type: ' + argName + ' should not be null nor undefined';
	else
		message = 'invalid type: ' + argName + ' should be a ' + types.join(' or ');

	helpers.checkError(err, message);
};

helpers.testOperationParams = curry(function(op, argName, types, nullable, args, done) {
	argName = argName || 'params';
	args = [args, hooks, new Image()];

	return helpers.testOperationArg(op, args, 0, argName, types, nullable, done);
});

helpers.testOperationImage = curry(function(op, args, done) {
	args = [args, hooks, null];

	return helpers.testOperationArg(op, args, 2, 'image', ['object'], false, done);
});

helpers.testOperationNext = curry(function(op, args, done) {
	return helpers.invalidTypes(['function'], false, function(arg, done) {
		try {
			op.call(null, args, hooks, new Image(), arg);
		}
		catch (err) {
			helpers.checkTypeError(err, ['function'], 'next', arg);
			done();
		}
	}, done);
});

helpers.testOperationArg = curry(function(op, args, pos, argName, types, nullable, done) {
	// store if arg at pos has a value
	var initialVal = args[pos];

	// append callback placeholder at the end of arguments
	args.push(null);

	return helpers.invalidTypes(types, nullable, function(arg, done) {
		// set the value of arg at pos in args list
		if (initialVal)
			args[pos][argName] = arg;
		else
			args[pos] = arg;

		// replace placeholder with a callback with the correct closure.
		// Does my sentence even means something?
		args[args.length - 1] = function(err) {
			helpers.checkTypeError(err, types, argName, arg);
			done();
		};

		// invoke operation with lovely crafted arguments
		op.apply(null, args);
	}, done);
});

/**
 * Fast and quite unprecise way to compare two image and tell if they are similar.
 * We use this because JPEG typically loses some quality after open / save.
 * We empirically decide that under an error of 3%, image are similar.
 *
 * @param image1 - First image to compare.
 * @param image2 - Second image to compare.
 * @return {boolean} Either they are similar or not.
 */

helpers.similarity = function (image1, image2) {
	var total1 = 0, total2 = 0;
	for (var i = 0, len = image1.length; i < len; i++) {
		total1 += image1[i];
		total2 += image2[i];
	}

	var diff = Math.abs(total1 - total2);
	var thresold = Math.max(total1, total2) / 100 * 3;

	return (diff < thresold);
};