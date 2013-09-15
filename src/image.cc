/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

#include "image.h"
#include "image_decoder.h"
#include "image_encoder.h"

using namespace v8;
using namespace node;
using namespace std;
using namespace ribs;

static void OnDecoded(ImageDecoder::Result* result);
static void OnEncoded(ImageEncoder::Result* result);

Persistent<FunctionTemplate> Image::constructorTemplate;

Image::Image(Handle<Object>& wrapper) {
	Wrap(wrapper);
}

Image::~Image() {
	pixDestroy(&data);
	V8::AdjustAmountOfExternalAllocatedMemory(-length());
};

NAN_METHOD(Image::New) {
	NanScope();

	// Image() instead of new Image()
	if (!args.IsConstructCall()) {
		Local<Object> instance = constructorTemplate->GetFunction()->NewInstance();
		NanReturnValue(instance);
	}

	Image* image = new Image(args.This());
	NanReturnValue(args.This());
}

Local<Object> Image::New(const char* filename, Pix* data) {
	NanScope();

	// create a new instance an feed it
	Local<Object> instance = constructorTemplate->GetFunction()->NewInstance();
	Image* image = Unwrap<Image>(instance);
	image->filename = filename;
	image->data = data;
	pixGetDimensions(image->data, &image->width, &image->height, NULL);

	// Let v8 handle [] accessor
	uint8_t* bytes = reinterpret_cast<uint8_t*>(pixGetData(image->data));
	instance->SetIndexedPropertiesToPixelData(bytes, image->length());
//	uint32_t* pixels = reinterpret_cast<uint32_t*>(pixGetData(image->data));
//	instance->SetIndexedPropertiesToExternalArrayData(pixels, kExternalUnsignedIntArray, image->length());

	// give a hint to GC about the amount of memory attached to this object
	// this help GC to know exactly the amount of memory it will free if collecting this object
	// this ensure GC will collect more regularly exhausted image objects
	V8::AdjustAmountOfExternalAllocatedMemory(image->length());
	NanReturnValue(instance);
}

NAN_GETTER(Image::GetWidth) {
	NanScope();
	Image* image = Unwrap<Image>(args.This());
	NanReturnValue(Number::New(image->width));
}

NAN_GETTER(Image::GetHeight) {
	NanScope();
	Image* image = Unwrap<Image>(args.This());
	NanReturnValue(Number::New(image->height));
}

NAN_GETTER(Image::GetLength) {
	NanScope();
	NanReturnValue(Number::New(args.This()->GetIndexedPropertiesPixelDataLength()));
}

NAN_METHOD(Image::Open) {
	NanScope();

	// get filename & callback
	const char* filename = FromV8String(args[0]);
	NanCallback* callback = NULL;
	if (args[1]->IsFunction()) {
		callback = new NanCallback(args[1].As<Function>());
	}

	// start the decoding process async
	ImageDecoder::Decode(filename, OnDecoded, callback);

	// make the compiler happy
	NanReturnUndefined();
}

NAN_METHOD(Image::Save) {
	NanScope();

	// get filename, quality, progressive, image & callback
	const char* filename = FromV8String(args[0]);
	uint32_t quality = args[1]->Uint32Value();
	bool progressive = args[2]->BooleanValue();
	Image* image = Unwrap<Image>(args[3].As<Object>());
	NanCallback* callback = NULL;
	if (args[4]->IsFunction()) {
		callback = new NanCallback(args[4].As<Function>());
	}

	// start the encoding process async
	ImageEncoder::Encode(filename, quality, progressive, image, OnEncoded, callback);

	// make the compiler happy
	NanReturnUndefined();
}

void Image::Initialize(Handle<Object> target) {
	NanScope();

	// constructor
	Local<FunctionTemplate> t = FunctionTemplate::New(New);
	NanAssignPersistent(FunctionTemplate, constructorTemplate, t);
	constructorTemplate->InstanceTemplate()->SetInternalFieldCount(1);
	constructorTemplate->SetClassName(NanSymbol("Image"));

	// prototype
	Local<ObjectTemplate> prototype = constructorTemplate->PrototypeTemplate();
	prototype->SetAccessor(NanSymbol("width"), GetWidth);
	prototype->SetAccessor(NanSymbol("height"), GetHeight);
	prototype->SetAccessor(NanSymbol("length"), GetLength);

	// object
	NODE_SET_METHOD(constructorTemplate->GetFunction(), "open", Open);
	NODE_SET_METHOD(constructorTemplate->GetFunction(), "save", Save);

	// export
	target->Set(NanSymbol("Image"), constructorTemplate->GetFunction());

	// initialize image decoder/encoder
	ImageDecoder::Initialize();
	ImageEncoder::Initialize();

	// TODO return?
}

void OnDecoded(ImageDecoder::Result* result) {
	NanScope();

	// no callback?
	if (NULL == result->callback) return;

	int argc = 0;
	Local<Value> argv[2];

	// execute callback with error
	// note that we explicitly pass undefined to the 2nd argument
	// this is to respect the arity of the function and allow curry for example
	if (0 < strlen(result->error)) {
		argv[argc++] = Exception::Error(String::New(result->error));
		argv[argc++] = Local<Value>::New(Undefined());
	}
	else {
		// create the image instance with data
		Local<Object> instance = Image::New(result->filename, result->data);

		// execute callback with newly created image
		argv[argc++] = Local<Value>::New(Null());
		argv[argc++] = instance;
	}

	result->callback->Call(argc, argv);
	delete result->callback;
}

void OnEncoded(ImageEncoder::Result* result) {
	NanScope();

	// no callback?
	if (NULL == result->callback) return;

	int argc = 0;
	Local<Value> argv[1];

	// set error or not
	if (0 < strlen(result->error)) {
		argv[argc++] = Exception::Error(String::New(result->error));
	}
	else {
		argv[argc++] = Local<Value>::New(Null());
	}

	result->callback->Call(argc, argv);
	delete result->callback;
}