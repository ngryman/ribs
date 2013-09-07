/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var async = require('async'),
	operations = require('./operations'),
	utils = require('./utils'),
	check = utils.checkType;

/**
 * The `Pipeline` object provides a unified API to hold and execute consecutive operations to be applied to an image.
 *
 * The idea here is *lazy evaluation*. This means that the user can chain multiple operation with the fluent API of RIBS
 * but only execute them when he decides. A *pipeline* will then execute every operations in order and asynchronously.
 * This has the advantage of *batching* file operations and avoid back and forth between disk and memory.
 *
 * A pipeline instance is return by ribs front-end in order to enqueue operations directly. Even if it's exposed to the
 * end-user, some `Pipeline` methods are reserved for custom operations only, and should not manipulated directly.
 *
 * The end-user could bypass ribs front-end and use directly a pipeline to manipulate images but he would have to be
 * aware that the front-end configures the pipeline in a special way that make ribs and it's ecosystem work properly.
 *
 * @constructor
 */
function Pipeline() {
	// shortcut syntax
	if (!(this instanceof Pipeline)) return new Pipeline();
	// queue of async operations to by applied in FIFO order
	this.queue = [];
	// shared params
	this.sharedParams = {};
}

/**
 *
 * @param name
 * @param [params]
 * @returns {Pipeline}
 */
Pipeline.prototype.use = function(name, params) {
	// bypass on error
	// > pas le temps de niaiser !
	if (this.error) return this;

	try {
		// `use(bulk, [callback]`

		// call `use` once per bulk and `done` if a `callback` is provided
		if (Array.isArray(name)) {
			name.forEach(function(bulk) {
				// inline operation?
				if ('function' == typeof bulk) {
					this.use(bulk);
				}
				// classic
				else {
					this.use(bulk.operation, bulk.params);
				}
			}.bind(this));

			// a callback being specified is simply a shortcut for `done`
			// we resolve the pipeline directly
			if ('function' == typeof params) return this.done(params);
			return this;
		}

		// `use(name|operation, [params])`

		// check for valid name types
		// this can be a string to a valid registered operation or an inline operation
		utils.checkType('name', name, false, 'string', 'function');

		// inline operation?
		var operation;
		if ('function' == typeof name) {
			operation = name;
		}
		// classic
		else {
			operation = Pipeline.operations[name];
			if ('function' != typeof operation) {
				throw new Error('no operation found: ' + name);
			}
		}

		// if no params is specified, we link to the pipeline shared param object
		// this gives the ability to share data between some operations
		// note: might be as powerful as useless, we'll see...
		params = params || this.sharedParams;

		// push the operation to the queue
		this.queue.push(operation.bind(this, params));
	}
	catch(err) {
		err.args = { name: name, params: params };
		this.error = err;
		return this;
	}

	return this;
};

/**
 *
 * @param callback
 */
Pipeline.prototype.done = function(callback) {
	// bypass on error
	if (this.error) return finalize.call(this, callback);

	// unleash the Kraken!
	// hum, if it's too dangerous... take this ascii sword with you!
	//
	//   o()xxxx[{::::::::::::::::::::::::::>
	//
	// Kraken will *waterfall* calls to operations where each operation passes its results to the next one.
	// There is no additional logic to async's default behavior, because there is no obvious need to.
	// However that means that a *buggy* operation could break the chain if it does not call correctly the `next`
	// argument or simply corrupt data. There is a strong coupling between all operations involved.
	// Developers of *custom operation* are in charge of testing them well.
	async.waterfall(this.queue, finalize.bind(this, callback));
};

/**
 *
 */
Pipeline.prototype.clear = function() {
	this.queue.length = 0;
	this.sharedParams = {};
	this.error = undefined;
	return this;
};

/**
 *
 * @param name
 * @param operation
 */
Pipeline.add = function(name, operation) {
	// add the new operation
	Pipeline.operations[name] = operation;
	// proxy it via a new Pipeline method
	Pipeline.prototype[name] = function(params) {
		return this.use(name, params);
	};
};

/**
 * Installs a hook for a given operation and filename pattern.
 *
 * @param {string} operation - Operation for which the hook will be installed.
 * This can be one of the following values:
 *  - shrink
 * @param {string} name - Hook name. Each operation can have multiple hooks for different purpose. Depending of the
 * operation, this can be one of the following values:
 *  - constraints
 * @param {Function} hook - The hook function that will be called. Depending on the operation, its signature may depend.
 * See each default hooks for more details.
 */
Pipeline.hook = function(operation, name, hook) {
	// arguments type
	check('operation', operation, 'string');
	check('name', name, 'string');
	check('hook', hook, 'function');

	// registers hook
	var key = operation + ':' + name;
	var hooksPool = (Pipeline.hooks[key] = Pipeline.hooks[key] || []);
	hooksPool.arity = hooksPool.arity || hook.length;
	Pipeline.hooks[key] = hook;
};

/**
 *
 * @type {Object}
 */
Pipeline.operations = {};

Pipeline.hooks = {};

/**
 *
 * @param callback
 * @param res
 */
function finalize(callback, res) {
	// cache error locally
	var err = this.error;
	// clear before invoking callback
	this.clear();
	// invoke our precious end-user callback with associated (non)-error and result
	if ('function' == typeof callback) callback(err, res);
}

/**
 * Export.
 */

module.exports = Pipeline;