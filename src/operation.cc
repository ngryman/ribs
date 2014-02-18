/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

#include "operation.h"

using namespace v8;
using namespace node;
using namespace ribs;

Operation::Operation(_NAN_METHOD_ARGS) {
	// assign mandatory callback
	if (!args[args.Length() - 1]->IsFunction()) throw "no callback specified";
	callback = new NanCallback(args[args.Length() - 1].As<Function>());

	// reference this operation
	req.data = this;
}

Operation::~Operation() {
	delete callback;
}

void Operation::Enqueue() {
	// here we go!
	uv_queue_work(uv_default_loop(), &req, ProcessAsync, (uv_after_work_cb)AfterProcessAsync);
}

void Operation::ProcessAsync(uv_work_t* req) {
	auto op = static_cast<Operation*>(req->data);
	op->Process();
}

void Operation::AfterProcessAsync(uv_work_t* req) {
	NanScope();

	auto op = static_cast<Operation*>(req->data);

	int argc = 0;
	Local<Value> argv[2];

	// execute callback with error.
	// note that we explicitly pass undefined to the 2nd argument.
	// this is to respect the arity of the function and allow curry for example.
	if (!op->error.empty()) {
		argv[argc++] = Exception::Error(String::New(op->error.c_str()));
		argv[argc++] = Local<Value>::New(Undefined());
	}
	else {
		// execute callback with the output object
		argv[argc++] = Local<Value>::New(Null());
		argv[argc++] = op->OutputValue();
	}

	TryCatch tryCatch;

	// pass the hand to the JavaScript part
	op->callback->Call(argc, argv);

	// after serving your purpose, we now delete you.
	delete op;

	if (tryCatch.HasCaught()) {
		FatalException(tryCatch);
	}
}