/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

'use strict';

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

	if (null == arg) {
		message = 'invalid type: ' + argName + ' should not be null nor undefined';
	}
	else {
		message = 'invalid type: ' + argName + ' should be a ' + types.join(' or ');
	}

	helpers.checkError(err, message);
};

helpers.testOperationParams = curry(function(op, argName, types, nullable, params, done) {
	argName = argName || 'params';

	return helpers.invalidTypes(types, nullable, function(param, done) {
		if ('params' != argName) {
			param = params || {};
			param[argName] = param;
		}

		op.call(null, param, new Image(), function(err) {
			helpers.checkTypeError(err, types, argName, param);
			done();
		});
	}, done);
});

helpers.testOperationImage = curry(function(op, params, done) {
	return helpers.invalidTypes(['object'], false, function(param, done) {
		op.call(null, params, param, function(err) {
			helpers.checkTypeError(err, ['object'], 'image', param);
			done();
		});
	}, done);
});

helpers.testOperationNext = curry(function(op, params, done) {
	return helpers.invalidTypes(['object'], false, function(param, done) {
		try {
			op.call(null, params, new Image(), param);
		}
		catch (err) {
			helpers.checkTypeError(err, ['function'], 'next', param);
			done();
		}
	}, done);
});