/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

#ifndef __RIBS_OPERATION_H__
#define __RIBS_OPERATION_H__

#include "common.h"

namespace ribs {

class Operation {
public:
	NAN_METHOD(Process);

	virtual ~Operation() {}

private:
	virtual bool CheckArguments(_NAN_METHOD_ARGS) = 0;
	virtual Baton* PreProcess(_NAN_METHOD_ARGS) = 0;
	virtual void DoProcess(Baton* baton) = 0;
	virtual v8::Local<v8::Object> OutputValue(Baton* baton) = 0;
	virtual void PostProcess(Baton* baton) = 0;

	friend void ProcessAsync(uv_work_t* req);
	friend void AfterProcessAsync(uv_work_t* req);
};

#define RIBS_OPERATION(name)           \
	NanScope();                        \
	auto op = new name ## Operation(); \
	op->Process(args);                 \
	NanReturnUndefined();

}

#endif