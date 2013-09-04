/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

#include "image.h"
#include "image_decoder.h"

using namespace v8;
using namespace node;
using namespace std;

static void OnDecoded(ImageDecoder::Result* result);

Persistent<FunctionTemplate> Image::constructorTemplate;

Image::Image(Handle<Object> wrapper) {
	Wrap(wrapper);
}

Image::~Image() {};

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

Local<Object> Image::New(const string& filename, int width, int height, int depth, uint32_t* pixels) {
	NanScope();

	// create a new instance an feed it
	Local<Object> instance = constructorTemplate->GetFunction()->NewInstance();
	Image* image = Unwrap<Image>(instance);
	image->filename = filename;
	image->width = width;
	image->height = height;
	image->depth = depth;
	// TODO: pixCreate?

	NanReturnValue(instance);
}

Local<Object> Image::New(const string& filename, Pix* raw) {
	NanScope();

	// create a new instance an feed it
	Local<Object> instance = constructorTemplate->GetFunction()->NewInstance();
	Image* image = Unwrap<Image>(instance);
	image->filename = filename;
	pixGetDimensions(raw, &image->width, &image->height, &image->depth);
	image->raw = raw;

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

NAN_GETTER(Image::GetDepth) {
	NanScope();
	Image* image = Unwrap<Image>(args.This());
	NanReturnValue(Number::New(image->depth));
}

NAN_GETTER(Image::GetPixels) {
	NanScope();
	Image* image = Unwrap<Image>(args.This());

	if (pixGetColormap(image->raw)) {
		Pix* rgbRaw = pixRemoveColormap(image->raw, REMOVE_CMAP_TO_FULL_COLOR);
		pixDestroy(&image->raw);
		image->raw = rgbRaw;
	}

	//Pix* pixd = pixConvertTo32(image->raw);
	// TODO: error check

	Local<Value> pixels = NanNewBufferHandle(reinterpret_cast<char*>(pixGetData(image->raw)), image->width * image->height);
	NanReturnValue(pixels);
}

NAN_METHOD(Image::FromFile) {
	NanScope();

	// get filename & callback
	string filename = FromV8String(args[0]);
	NanCallback* callback = new NanCallback(args[1].As<Function>());

	// start the decoding process async
	ImageDecoder::Decode(filename, OnDecoded, callback);

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
	prototype->SetAccessor(NanSymbol("depth"), GetDepth);
	prototype->SetAccessor(NanSymbol("pixels"), GetPixels);

	// object
	NODE_SET_METHOD(constructorTemplate->GetFunction(), "fromFile", FromFile);

	// export
	target->Set(NanSymbol("Image"), constructorTemplate->GetFunction());

	// initialize image decoder
	ImageDecoder::Initialize();

	// TODO return?
}

void OnDecoded(ImageDecoder::Result* result) {
	NanScope();

	int argc = 0;
	Local<Value> argv[2];

	// execute callback with error
	if (!result->error.empty()) {
		argv[argc++] = Exception::Error(String::New(result->error.c_str()));
	}
	else {
		// create the image instance with data
		Local<Object> instance = Image::New(result->filename, result->raw);

		// execute callback with newly created image
		argv[argc++] = Local<Value>::New(Null());
		argv[argc++] = instance;
	}

	result->callback->Call(argc, argv);
	delete result->callback;
}