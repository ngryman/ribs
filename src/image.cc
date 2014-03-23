/*!
 * ribs
 * Copyright (c) 2013-2014 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

#include "image.h"
#include "operation/decode.h"
#include "operation/encode.h"
#include "operation/resize.h"
#include "operation/crop.h"

using namespace std;
using namespace v8;
using namespace node;
using namespace ribs;

static inline void print_stacktrace(FILE *out = stderr, unsigned int max_frames = 63);

/**
 * Helps defining a simple accessor / getter.
 */

#define IMAGE_GETTER_INSTANCE()                 \
	NanScope();                                 \
	auto instance = Unwrap<Image>(args.This());

#define IMAGE_NUMBER_GETTER(getter)             \
	IMAGE_GETTER_INSTANCE();                    \
	NanReturnValue(Number::New(instance->getter()));

#define IMAGE_STRING_GETTER(getter)             \
	IMAGE_GETTER_INSTANCE();                    \
	NanReturnValue(String::New(instance->getter().c_str()));

Persistent<FunctionTemplate> Image::constructorTemplate;

Image::Image(Handle<Object> wrapper) {
	Wrap(wrapper);
}

Image::~Image() {
	V8::AdjustAmountOfExternalAllocatedMemory(-Length());
};

NAN_METHOD(Image::New) {
	NanScope();

	// Image() instead of new Image()
	if (!args.IsConstructCall()) {
		Local<Object> instance = constructorTemplate->GetFunction()->NewInstance();
		NanReturnValue(instance);
	}

	new Image(args.This());
	NanReturnValue(args.This());
}

Local<Object> Image::New(cv::Mat& mat, const std::string& format) {
	NanScope();

	// create a new instance an feed it
	Local<Object> instance = constructorTemplate->GetFunction()->NewInstance();
	auto image = Unwrap<Image>(instance);

	// set the matrix
	image->Matrix(mat);

	// synchronize pixels data with the JavaScript object
	image->Sync(instance);

	// store input format
	image->inputFormat = format;

	// give a hint to GC about the amount of memory attached to this object
	// this help GC to know exactly the amount of memory it will free if collecting this object
	// this ensure GC will collect more regularly exhausted image objects
	V8::AdjustAmountOfExternalAllocatedMemory(mat.total());
	NanReturnValue(instance);
}

void Image::Matrix(cv::Mat newMat) {
	// invoke destructor to decrement reference counter on this matrix
	~mat;

	// set new pixel data
	mat = newMat;
}

void Image::Sync(Handle<Object> instance) {
	// Let v8 handle [] accessor
	instance->SetIndexedPropertiesToPixelData(Pixels(), Length());
//	instance->SetIndexedPropertiesToExternalArrayData(pixels, kExternalUnsignedIntArray, image->Length());
}

NAN_GETTER(Image::GetWidth) {
	IMAGE_NUMBER_GETTER(Width);
}

NAN_GETTER(Image::GetHeight) {
	IMAGE_NUMBER_GETTER(Height);
}

NAN_GETTER(Image::GetChannels) {
	IMAGE_NUMBER_GETTER(Channels);
}

NAN_GETTER(Image::GetInputFormat) {
	IMAGE_STRING_GETTER(InputFormat);
}

NAN_GETTER(Image::GetLength) {
	NanScope();
	NanReturnValue(Number::New(args.This()->GetIndexedPropertiesPixelDataLength()));
}

NAN_METHOD(Image::Decode) {
	RIBS_OPERATION(Decode);
}

NAN_METHOD(Image::Encode) {
	RIBS_OPERATION(Encode);
}

NAN_METHOD(Image::Resize) {
	RIBS_OPERATION(Resize);
}

NAN_METHOD(Image::Crop) {
	RIBS_OPERATION(Crop);
}

void Image::Initialize(Handle<Object> target) {
	// constructor
	Local<FunctionTemplate> t = FunctionTemplate::New(New);
	NanAssignPersistent(FunctionTemplate, constructorTemplate, t);
	constructorTemplate->InstanceTemplate()->SetInternalFieldCount(1);
	constructorTemplate->SetClassName(NanSymbol("Image"));

	// prototype
	Local<ObjectTemplate> prototype = constructorTemplate->PrototypeTemplate();
	prototype->SetAccessor(NanSymbol("width"), GetWidth);
	prototype->SetAccessor(NanSymbol("height"), GetHeight);
	prototype->SetAccessor(NanSymbol("channels"), GetChannels);
	prototype->SetAccessor(NanSymbol("inputFormat"), GetInputFormat);
	prototype->SetAccessor(NanSymbol("length"), GetLength);
	NODE_SET_PROTOTYPE_METHOD(constructorTemplate, "encode", Encode);
	NODE_SET_PROTOTYPE_METHOD(constructorTemplate, "resize", Resize);
	NODE_SET_PROTOTYPE_METHOD(constructorTemplate, "crop", Crop);

	// object
	NODE_SET_METHOD(constructorTemplate->GetFunction(), "decode", Decode);

	// export
	target->Set(NanSymbol("Image"), constructorTemplate->GetFunction());
}

#include <execinfo.h>
#include <cxxabi.h>

/** Print a demangled stack backtrace of the caller function to FILE* out. */
void print_stacktrace(FILE *out, unsigned int max_frames)
{
    fprintf(out, "stack trace:\n");

    // storage array for stack trace address data
    void* addrlist[max_frames+1];

    // retrieve current stack addresses
    int addrlen = backtrace(addrlist, sizeof(addrlist) / sizeof(void*));

    if (addrlen == 0) {
	fprintf(out, "  <empty, possibly corrupt>\n");
	return;
    }

    // resolve addresses into strings containing "filename(function+address)",
    // this array must be free()-ed
    char** symbollist = backtrace_symbols(addrlist, addrlen);

    // allocate string which will be filled with the demangled function name
    size_t funcnamesize = 256;
    char* funcname = (char*)malloc(funcnamesize);

    // iterate over the returned symbol lines. skip the first, it is the
    // address of this function.
    for (int i = 1; i < addrlen; i++)
    {
	char *begin_name = 0, *begin_offset = 0, *end_offset = 0;

	// find parentheses and +address offset surrounding the mangled name:
	// ./module(function+0x15c) [0x8048a6d]
	for (char *p = symbollist[i]; *p; ++p)
	{
	    if (*p == '(')
		begin_name = p;
	    else if (*p == '+')
		begin_offset = p;
	    else if (*p == ')' && begin_offset) {
		end_offset = p;
		break;
	    }
	}

	if (begin_name && begin_offset && end_offset
	    && begin_name < begin_offset)
	{
	    *begin_name++ = '\0';
	    *begin_offset++ = '\0';
	    *end_offset = '\0';

	    // mangled name is now in [begin_name, begin_offset) and caller
	    // offset in [begin_offset, end_offset). now apply
	    // __cxa_demangle():

	    int status;
	    char* ret = abi::__cxa_demangle(begin_name,
					    funcname, &funcnamesize, &status);
	    if (status == 0) {
		funcname = ret; // use possibly realloc()-ed string
		fprintf(out, "  %s : %s+%s\n",
			symbollist[i], funcname, begin_offset);
	    }
	    else {
		// demangling failed. Output function name as a C function with
		// no arguments.
		fprintf(out, "  %s : %s()+%s\n",
			symbollist[i], begin_name, begin_offset);
	    }
	}
	else
	{
	    // couldn't parse the line? print the whole line.
	    fprintf(out, "  %s\n", symbollist[i]);
	}
    }

    free(funcname);
    free(symbollist);
}