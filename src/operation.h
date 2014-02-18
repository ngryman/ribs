/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

#ifndef __RIBS_OPERATION_H__
#define __RIBS_OPERATION_H__

#include "common.h"

namespace ribs {

/**
 * Abstract class representing a RIBS operation.
 * An operation may be seen as a worker class using libuv as infrastructure for threading.
 * This worker acts on an input and produces an output.
 */
class Operation {
public:
	void Enqueue();

	Operation(_NAN_METHOD_ARGS);
	virtual ~Operation();

protected:
	/**
	 * Operation implementation.
	 * This is where all the work is done to grasp the input and produce an output.
	 * This method is called in another thread, managed by libuv.
	 */
	virtual void Process() = 0;

	/**
	 * Return the output value produced by the operation.
	 * This will directly passed to the JavaScript callback if the operation succeeds.
	 * This method is necessary as we can't interact with v8 in the DoProcess method. This cause segmentation faults,
	 * probably because v8 is not thread safe or something like this.
	 */
	virtual v8::Local<v8::Value> OutputValue() = 0;

	std::string  error;
	NanCallback* callback;
	uv_work_t    req;

	static void ProcessAsync(uv_work_t* req);
	static void AfterProcessAsync(uv_work_t* req);
};

/**
 * Helps calling a specific operation.
 */

#define _OP_NAME(name) name ## Operation
#define _OP_METHOD(name, method, ret, args, stub) ret _OP_NAME(name)::method(args) stub

#define OPERATION(name, stub)                 \
	class _OP_NAME(name) : public Operation { \
	public:                                   \
		_OP_NAME(name)(_NAN_METHOD_ARGS);     \
		virtual ~_OP_NAME(name)();            \
                                              \
	private:                                  \
		void                 Process();       \
		v8::Local<v8::Value> OutputValue();   \
		stub                                  \
	};

#define OPERATION_PREPARE(name, stub) _OP_METHOD(name, _OP_NAME(name), , _NAN_METHOD_ARGS, : Operation(args) stub)
#define OPERATION_CLEANUP(name, stub) _OP_METHOD(name, ~_OP_NAME(name), , void, stub)
#define OPERATION_PROCESS(name, stub) _OP_METHOD(name, Process, void, void, stub)
#define OPERATION_VALUE(name, stub)   _OP_METHOD(name, OutputValue, Local<Value>, void, stub)

#define RIBS_OPERATION(name)                                             \
	NanScope();                                                          \
	Operation* op;                                                       \
	try {                                                                \
		op = new _OP_NAME(name)(args);                                   \
	}                                                                    \
	catch (const std::string e) {                                        \
		return ThrowException(Exception::Error(String::New(e.c_str()))); \
	}                                                                    \
	op->Enqueue();                                                       \
	NanReturnUndefined();

}

#endif