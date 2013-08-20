/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * MIT Licensed
 */

#include "image.h"

using namespace v8;
using namespace std;

Persistent<Function> Image::constructor;

Image::Image() {};
Image::~Image() {};

void Image::Init(Handle<Object> target) {
	// constructor
	Local<FunctionTemplate> ctor = FunctionTemplate::New(New);
	ctor->SetClassName(NanSymbol("Image"));
	ctor->InstanceTemplate()->SetInternalFieldCount(1);
	NODE_SET_METHOD(ctor, "fromFile", FromFile);

	// prototype
	Local<ObjectTemplate> proto = ctor->PrototypeTemplate();
	proto->SetAccessor(NanSymbol("width"), GetWidth);
	proto->SetAccessor(NanSymbol("height"), GetHeight);

	// export
	NanAssignPersistent(Function, constructor, ctor->GetFunction());
	target->Set(NanSymbol("Image"), constructor);
}

NAN_METHOD(Image::New) {
	NanScope();

	Image* image = new Image();
	image->width = args[0]->IsUndefined() ? 0 : args[0]->IntegerValue();
	image->height = args[1]->IsUndefined() ? 0 : args[1]->IntegerValue();

	image->Wrap(args.This());
	NanReturnValue(args.This());
}

NAN_GETTER(Image::GetWidth) {
	NanScope();
	Image* image = ObjectWrap::Unwrap<Image>(args.This());
	NanReturnValue(Number::New(image->width));
}

NAN_GETTER(Image::GetHeight) {
	NanScope();
	Image* image = ObjectWrap::Unwrap<Image>(args.This());
	NanReturnValue(Number::New(image->height));
}

NAN_METHOD(Image::FromFile) {
	NanScope();

	// which type of image?
	string filename = FromV8String(args[0]);
	Type type = typeOf(filename);

	// loads image data by type
	switch (type) {
		case Image::JPEG:
			NanReturnValue(Image::loadFromJPG(filename));
		case Image::PNG:
			NanReturnValue(Image::loadFromPNG(filename));
		case Image::GIF:
			NanReturnValue(Image::loadFromGIF(filename));
		case Image::UNKNOWN:
			NanThrowError((filename + " is not a valid image.").c_str());
	}

	// makes the compiler happy
	NanReturnUndefined();
}

Image::Type Image::typeOf(const string& filename) {
	size_t pos = filename.find_last_of(".");
	if (string::npos == pos) return Image::UNKNOWN;

	string ext = filename.substr(pos + 1);
	if ("jpeg" == ext || "jpg" == ext) return Image::JPEG;
	if ("png" == ext) return Image::PNG;
	if ("gif" == ext) return Image::GIF;
	return Image::UNKNOWN;
}

Local<Object> Image::loadFromJPG(const std::string& filename) {
	// instanciates the new image
	Local<Object> instance = constructor->NewInstance();
	Image* image = ObjectWrap::Unwrap<Image>(instance);

	// JPEG setup
	jpeg_decompress_struct args;
	jpeg_error_mgr err;
	args.err = jpeg_std_error(&err);
//	jpeg_create_decompress(&args);

	return instance;
}

Local<Object> Image::loadFromPNG(const std::string& filename) {
	// instanciates the new image
	Local<Object> instance = constructor->NewInstance();
	Image* image = ObjectWrap::Unwrap<Image>(instance);

    // TODO

	return instance;
}

Local<Object> Image::loadFromGIF(const std::string& filename) {
	// instanciates the new image
	Local<Object> instance = constructor->NewInstance();
	Image* image = ObjectWrap::Unwrap<Image>(instance);

    // TODO

	return instance;
}