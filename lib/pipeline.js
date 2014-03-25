/*!
 * ribs
 * Copyright (c) 2013-2014 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var util = require('util'),
	EventEmitter = require('events').EventEmitter,
	_ = require('lodash'),
	async = require('async'),
	utils = require('./utils'),
	check = utils.checkType,
	hooks = require('./hooks'),
	createStream = require('./stream').createStream;

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

util.inherits(Pipeline, EventEmitter);

/**
 *
 * @param name
 * @param [params]
 * @returns {Pipeline}
 */
Pipeline.prototype.use = function(name, params) {
	// bypass on error
	if (this.error) return this;

	try {
		// `use(bulk, [callback]`

		// call `use` once per bulk and `done` if a `callback` is provided
		if (Array.isArray(name)) {
			name.forEach(function(bulk) {
				// inline operation?
				if ('function' == typeof bulk)
					this.use(bulk);
				// classic
				else
					this.use(bulk.operation, bulk.params);
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

		var operation,
			queue = this.queue;

		// inline operation?
		if ('function' == typeof name)
			operation = name;
		// classic
		else {
			operation = Pipeline.operations[name];
			if ('function' != typeof operation)
				throw new Error('no operation found: ' + name);
		}

		// if no params is specified, we link to the pipeline shared param object
		// this gives the ability to share data between some operations
		// note: might be as powerful as useless, we'll see...
		params = params || this.sharedParams;

		// `from` and `to` must not have duplicates in the queue
		if (~'from|to'.indexOf(name))
			lock(queue, name);

		// configures operation
		var configuredOperation = invokeOperation.bind(this, operation, params);

		// mark it
		mark(configuredOperation, name);

		// `from` is always inserted at the top of the queue
		if ('from' == name)
			queue.unshift(configuredOperation);
		// push the operation to the queue
		else
			queue.push(configuredOperation);
	}
	catch (err) {
		err.args = { name: name, params: params };
		this.error = err;
		return this;
	}

	return this;
};

/**
 *
 * @param {function} [callback]
 */
Pipeline.prototype.done = function(callback) {
	// ensure we defer this
	// this also ensure that we can subscribe to events after calling this
	setImmediate(function() {
		var queue = this.queue;

		// ensure `to` is the last
		ensureLast(queue);

		// `start` event
		this.emit('start');

		// bypass on error
		if (this.error) {
			finalize.call(this, callback);
			return this;
		}

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
		async.waterfall(queue, finalize.bind(this, callback));
	}.bind(this));

	return this;
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
 * @return {Stream}
 */
Pipeline.prototype.stream = function(params) {
	return createStream(this, params);
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
 * Installs or retrieve a hook for a given operation and filename pattern.
 *
 * @param {string} operation - Operation for which the hook will be installed.
 * This can be one of the following values:
 *  - shrink
 * @param {string} name - Hook name. Each operation can have multiple hooks for different purpose. Depending of the
 * operation, this can be one of the following values:
 *  - constraints
 * @param {function} [hook] - The hook function that will be called. Depending on the operation, its signature may depend.
 * See each default hooks for more details.
 * @return {function|undefined}
 */
Pipeline.hook = function(operation, name, hook) {
	// arguments type
	check('operation', operation, false, 'string');
	check('name', name, false, 'string');
	check('hook', hook, true, 'function');

	var key = operation + ':' + name;

	// registers hook
	if (hook) {
		var hooksPool = (Pipeline.hooks[key] = Pipeline.hooks[key] || []);
		hooksPool.arity = hooksPool.arity || hook.length;
		Pipeline.hooks[key] = hook;
	}
	// retrieve hook
	else
		return Pipeline.hooks[key];
};

/**
 *
 * @type {Object}
 */
Pipeline.operations = {};

/**
 *
 * @type {Object}
 */
Pipeline.hooks = {};

/**
 *
 * @private
 * @param callback
 * @param err
 * @param res
 */
function finalize(callback, err, res) {
	// cache error locally
	err = err || this.error;

	// clear before invoking callback
	this.clear();

	// `error` event
	if (err) {
		// add an empty listener to `error` event.
		// EventEmitter throws an error when there is no listener for this particular event.
		// We don't want that!
		//   http://nodejs.org/api/events.html
		this.on('error', utils.noop);

		this.emit('error', err);
	}
	// `success` event
	else
		this.emit('success', res);

	// `end` event
	this.emit('end', err, res);

	// invoke our precious end-user callback with associated (non)-error and result
	if ('function' == typeof callback) callback(err, res);
}

/**
 *
 * @private
 * @param operation
 * @param params
 * @param image
 * @param callback
 */
function invokeOperation(operation, params, image, callback) {
	// `from` operation has only a callback as argument
	var fromOp = 'function' == typeof image,
		finalParams;

	// `operation:before` event
	this.emit('operation:before', operation.name, params);

	// juggle arguments for `from` operation
	if (fromOp) callback = image;

	// wrap the callback to emit the `after` event
	var wrappedCallback = function() {
		// `operation:after` event
		this.emit('operation:after', operation.name, finalParams);

		// invoke the original callback transparently
		callback.apply(this, arguments);
	}.bind(this);

	// invoke operation
	finalParams = operation.call(this,
		params,
		fromOp ? wrappedCallback : image,
		fromOp ? undefined : wrappedCallback);
}

function lock(queue, name) {
	if (queue['_' + name + 'Lock'])
		throw new Error('duplicate of ' + name + ' found');

	queue['_' + name + 'Lock'] = true;
}

function mark(operation, name) {
	operation._name = name.name || name;
}

function ensureLast(queue) {
	var len = queue.length,
		i = len - 1;

	// seek and d...
	for (; i >= 0 && 'to' != queue[i]._name; i--) ;

	// `to` does not exist or is the last
	if (i < 0 || i == len - 1) return;

	var tmp = queue[len - 1];
	queue[len - 1] = queue[i];
	queue[i] = tmp;
}

/**
 * Register default hooks.
 */
Pipeline.hook('resize', 'constraints', hooks.resizeConstraintsHook);
Pipeline.hook('crop', 'constraints', hooks.cropConstraintsHook);

/**
 * Export.
 */

module.exports = Pipeline;