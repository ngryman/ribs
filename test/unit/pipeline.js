/*!
 * ribs
 * Copyright (c) 2013-2014 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var ribs = require('../..'),
	Pipeline = ribs.Pipeline,
	Stream = ribs.Stream,
	fs = require('fs'),
	path = require('path');

/**
 * Tests helper functions.
 */

function operation() {
	var spy = sinon.spy();
	return {
		spy: spy,
		operation: function testOperation(params, next) {
			params.should.be.an('object');
			next.should.be.a('function');
			spy();
			next();
		}
	};
}

function add(name) {
	var op = operation();
	op.name = name || ('_' + Math.round(Math.random() * 1000));
	Pipeline.add(op.name, op.operation);
	return op;
}

var checkOk = curry(function(operations, done, err) {
	if (!Array.isArray(operations)) operations = [operations];
	should.not.exist(err);
	operations.forEach(function(operation) {
		operation.spy.should.have.been.calledOnce;
	});
	done();
});

var checkError = curry(function (operations, expectedName, expectedErr, done, err) {
	if (!Array.isArray(operations)) operations = [operations];
	err.should.be.instanceof(Error);
	err.message.should.have.string(expectedErr);
	err.args.should.be.an('object');
	err.args.should.have.property('name', expectedName);
	should.not.exist(err.args.params);
	operations.forEach(function(operation) {
		operation.spy.should.not.have.been.calledOnce;
	});
	done();
});

/**
 * Test suite.
 */

describe('Pipeline', function() {
	beforeEach(function() {
		this.pipeline = new Pipeline();
	});

	describe('constructor', function() {
		it('should create an empty queue of operations', function() {
			this.pipeline.should.be.instanceof(Pipeline);
			this.pipeline.should.have.property('queue').and.be.instanceof(Array);
		});
		
		it('should support a shortcut syntax', function() {
			/*jshint newcap:false*/
			var p = Pipeline();
			p.should.be.instanceof(Pipeline);
			p.should.have.property('queue').and.be.instanceof(Array);
		});
	});

	describe('#use', function() {
		describe('(name, [params])', function() {
			it('should enqueue an operation', function(done) {
				var op = add();
				this.pipeline.use(op.name);
				this.pipeline.queue.should.have.lengthOf(1);
				this.pipeline.queue[0].should.be.a('function');
				this.pipeline.done(checkOk(op, done));
			});

			it('should enqueue an inline operation', function(done) {
				var op = operation();
				this.pipeline.use(op.operation).done(checkOk(op, done));
			});

			it('should invoke operations in order', function(done) {
				var p = this.pipeline, op1 = add(), op2 = add();
				p.use(op1.name).use(op2.name).done(function() {
					op1.spy.should.have.been.calledBefore(op2.spy);
					done();
				});
			});

			it('should pass shared params when no params are specified', function(done) {
				var p = this.pipeline,
					checkSharedParams = function(params, next) {
						params.should.equal(p.sharedParams);
						next();
					};
				p.use(checkSharedParams).use(checkSharedParams).done(done);
			});

			it('should bubble an error when name is not valid', function(done) {
				var p = this.pipeline;
				helpers.withParams([{}, 1337], function(param, done) {
					var op1 = add(), op2 = add(param);
					p.use(op1.name).use(op2.name).done(checkError(op2, op2.name, 'name should be', done));
				}, done);
			});

			it('should bubble an error when operation is not found', function(done) {
				var p = this.pipeline, op = add();
				p.use(op.name).use('wtf').done(checkError(op, 'wtf', 'no operation found: wtf', done));
			});
		});
		
		describe('(bulk, [callback])', function() {
			it('should enqueue several operations', function(done) {
				var p = this.pipeline, op1 = add(), op2 = add();
				p.use([
					{ operation: op1.name },
					{ operation: op2.name }
				]);
				p.queue.should.have.lengthOf(2);
				p.queue[0].should.be.a('function');
				p.queue[1].should.be.a('function');
				p.done(checkOk([op1, op2], done));
			});

			it('should enqueue several inline operations', function(done) {
				var p = this.pipeline, op1 = operation(), op2 = operation();
				p.use([op1.operation, op2.operation]);
				p.queue.should.have.lengthOf(2);
				p.queue[0].should.be.a('function');
				p.queue[1].should.be.a('function');
				p.done(checkOk([op1, op2], done));
			});

			it('should invoke operations in order', function(done) {
				var p = this.pipeline, op1 = add(), op2 = add();
				p.use([op1, op2]).done(function() {
					op1.spy.should.have.been.calledBefore(op2.spy);
					done();
				});
			});

			it('should pass shared params when no params are specified', function(done) {
				var p = this.pipeline,
					checkSharedParams = function(params, next) {
						params.should.equal(p.sharedParams);
						next();
					};
				p.use([checkSharedParams, checkSharedParams]).done(done);
			});

			it("should bubble an error when one of the bulk's name is not valid", function(done) {
				var p = this.pipeline;
				helpers.withParams([{}, 1337], function(param, done) {
					var op1 = add(), op2 = add(param);
					p.use([
						{ operation: op1.name },
						{ operation: op2.name }
					]).done(checkError([op1, op2], op2.name, 'name should be', done));
				}, done);
			});

			it("should bubble an error when one of the bulk's operation is not found", function(done) {
				var p = this.pipeline, op = add();
				p.use(op.name).use('wtf').done(checkError(op, 'wtf', 'no operation found: wtf', done));
			});

			it('should call the callback if specified', function(done) {
				var p = this.pipeline, op = operation();
				p.use([op], checkOk(op, done));
			});
		});
	});
	
	describe('#done([callback])', function() {
		it('should call back asynchronously if no operation was used', function() {
			var spy = sinon.spy();
			this.pipeline.done(spy);
			spy.should.not.have.been.called;
		});

		it('should automatically clear the pipeline', function(done) {
			var p = this.pipeline;
			p.use(operation()).done(function() {
				p.queue.should.have.lengthOf(0);
				done();
			});
		});

		it('should return the pipeline itself', function() {
			var p = this.pipeline;
			p.done().should.equal(p);
		});

		it('should clear the pipeline when an error occurred', function(done) {
			var p = this.pipeline;
			p.use('wtf').done(function(err) {
				err.should.be.instanceof(Error);
				should.not.exist(p.error);
				done();
			});
		});

		it('should invoke operations bound with the pipeline instance', function(done) {
			var p = this.pipeline.use(function(params, next) {
				this.should.equal(p);
				next();
			}).done(function() {
				done();
			});
		});
	});

	describe('#clear', function() {
		it('should clear this pipeline', function() {
			var p = this.pipeline;
			p.queue.push('1337');
			p.sharedParams.test = true;
			p.error = new Error('o()xxxx[{::::::::::::::::::::::::::>');
			p.clear();
			p.should.have.property('queue').and.be.instanceof(Array);
			p.queue.should.have.lengthOf(0);
			p.sharedParams.should.not.have.property('test');
			should.not.exist(p.error);
		});
	});

	describe('#stream', function() {

		it ('should return a stream', function() {
			this.pipeline.stream().should.be.instanceof(Stream);
		});

	});

	describe('add', function() {
		it('should add an operation', function(done) {
			var p = this.pipeline, op = add();
			Pipeline.operations.should.have.property(op.name);
			Pipeline.operations[op.name].should.equal(op.operation);
			p[op.name].should.be.a('function');
			this.pipeline[op.name]().done(checkOk(op, done));
		});
	});

	describe('events', function() {
		it('should emit a start event', function() {
			var spy = sinon.spy();
			this.pipeline.on('start', spy).done(function() {
				spy.should.have.been.calledOnce;
			});
		});

		it('should emit an end event', function(done) {
			this.pipeline.on('end', function() {
				arguments.should.have.lengthOf(2);
			});
			this.pipeline.done(done);
		});

		it('should emit a success event', function(done) {
			this.pipeline.on('success', function() {
				arguments.should.have.lengthOf(1);
			});
			this.pipeline.done(done);
		});

		it('should emit an error event', function(done) {
			this.pipeline.error = new Error('o()xxxx[{::::::::::::::::::::::::::>');
			this.pipeline.on('error', function(err) {
				err.should.be.instanceof(Error);
				err.message.should.equal('o()xxxx[{::::::::::::::::::::::::::>');
			});
			this.pipeline.done(function() {
				// indirection to avoid mocha to detect an error as `err` is defined
				done();
			});
		});

		it('should emit a warning event', function(done) {
			this.pipeline.on('warning', function(warn) {
				warn.should.equal('high voltage');
			});
			this.pipeline.use(function(params, next) {
				this.emit('warning', 'high voltage');
				next();
			}).done(done);
		});

		it('should emit an operation:before event', function(done) {
			var p = this.pipeline, op = add(), called = false;
			p.on('operation:before', function(name) {
				name.should.equal('testOperation');
				op.spy.should.not.have.been.called;
				called = true;
			});
			p.use(op.name).done(checkOk(op, function() {
				called.should.be.true;
				done();
			}));
		});

		it('should emit an operation:after event', function(done) {
			var p = this.pipeline, op = add(), called = false;
			p.on('operation:after', function(name) {
				name.should.equal('testOperation');
				op.spy.should.have.been.called;
				called = true;
			});
			p.use(op.name).done(checkOk(op, function() {
				called.should.be.true;
				done();
			}));
		});
	});

	describe('order', function() {

		it('should be applied for from and to', function(done) {
			var p = this.pipeline;
			p.to().resize().from().done().on('start', function() {
				p.queue[0].should.have.property('_name', 'from');
				p.queue[1].should.have.property('_name', 'resize');
				p.queue[2].should.have.property('_name', 'to');
				done();
			});
		});

	});

});