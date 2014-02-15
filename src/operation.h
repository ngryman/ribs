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
	void Process(void);

	Operation(_NAN_METHOD_ARGS);
	virtual ~Operation();

protected:
	/**
	 * Operation implementation.
	 * This is where all the work is done to grasp the input and produce an output.
	 * This method is called in another thread, managed by libuv.
	 */
	virtual void DoProcess() = 0;

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
#define RIBS_OPERATION(name)                                             \
	NanScope();                                                          \
	Operation* op;                                                       \
	try {                                                                \
		op = new name ## Operation(args);                                \
	}                                                                    \
	catch (const std::string e) {                                        \
		return ThrowException(Exception::Error(String::New(e.c_str()))); \
	}                                                                    \
	op->Process();                                                       \
	NanReturnUndefined();

}

#endif