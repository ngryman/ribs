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