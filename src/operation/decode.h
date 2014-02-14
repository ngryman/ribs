/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

#ifndef __RIBS_OPERATION_OPEN_H__
#define __RIBS_OPERATION_OPEN_H__

#include "../operation.h"

namespace ribs {

class DecodeOperation : public Operation {
public:

	virtual ~DecodeOperation() {}

private:
	bool CheckInput(v8::Local<v8::Value> in);
	Baton* PreProcess(_NAN_METHOD_ARGS);
	void DoProcess(Baton* baton);
	v8::Local<v8::Object> OutputValue(Baton* baton);
	void PostProcess(Baton* baton);
};

}

#endif