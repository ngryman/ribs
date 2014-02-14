/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

#include "operation.h"

using namespace v8;
using namespace node;
using namespace ribs;

namespace ribs {

void ProcessAsync(uv_work_t* req);
void AfterProcessAsync(uv_work_t* req);

}

NAN_METHOD(Operation::Process) {
	NanScope();

	NanCallback* callback = NULL;

	// if no callback is specified, return;
	if (!args[args.Length() - 1]->IsFunction()) NanReturnUndefined();

	// if no input is specified we throw a JavaScript exception.
	if (!CheckArguments(args)) {
		return ThrowException(Exception::Error(String::New("invalid input data")));
	}

	// create callback
	callback = new NanCallback(args[args.Length() - 1].As<Function>());

	// populate baton for further processing
	Baton* baton     = PreProcess(args);
	baton->operation = this;
	baton->callback  = callback;
	baton->req.data  = baton;

	// here we go!
	uv_queue_work(uv_default_loop(), &baton->req, ProcessAsync, (uv_after_work_cb)AfterProcessAsync);

	// make the compiler happy ^_^
	NanReturnUndefined();
}

void ribs::ProcessAsync(uv_work_t* req) {
	Baton* baton = static_cast<Baton*>(req->data);

	baton->operation->DoProcess(baton);
}

void ribs::AfterProcessAsync(uv_work_t* req) {
	NanScope();

	Baton* baton = static_cast<Baton*>(req->data);

	int argc = 0;
	Local<Value> argv[2];

	// execute callback with error.
	// note that we explicitly pass undefined to the 2nd argument.
	// this is to respect the arity of the function and allow curry for example.
	if (!baton->error.empty()) {
		argv[argc++] = Exception::Error(String::New(baton->error.c_str()));
		argv[argc++] = Local<Value>::New(Undefined());
	}
	else {
		// execute callback with out object
		argv[argc++] = Local<Value>::New(Null());
		argv[argc++] = baton->operation->OutputValue(baton);
	}

	TryCatch tryCatch;

	baton->callback->Call(argc, argv);

	if (tryCatch.HasCaught()) {
		FatalException(tryCatch);
	}

	baton->operation->PostProcess(baton);

	delete baton->callback;
	delete baton->operation;
	delete baton;
}