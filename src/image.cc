/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

#include "image.h"

using namespace std;
using namespace v8;
using namespace node;
using namespace ribs;

Persistent<FunctionTemplate> Image::constructorTemplate;

static void DecodeAsync(uv_work_t* req);
static void AfterDecodeAsync(uv_work_t* req);
static void EncodeAsync(uv_work_t* req);
static void AfterEncodeAsync(uv_work_t* req);

struct Baton {
	cv::Mat mat;
	NanCallback* callback;
	uv_work_t req;
};

struct DecodeBaton : Baton {
	cv::Mat res;
};

struct EncodeBaton : Baton {
	vector<uchar> res;
	string ext;
	uint32_t quality;
};

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

Local<Object> Image::New(cv::Mat& mat) {
	NanScope();

	// create a new instance an feed it
	Local<Object> instance = constructorTemplate->GetFunction()->NewInstance();
	Image* image = Unwrap<Image>(instance);
	image->mat = mat;

	// Let v8 handle [] accessor
	instance->SetIndexedPropertiesToPixelData(mat.data, image->Length());
//	instance->SetIndexedPropertiesToExternalArrayData(pixels, kExternalUnsignedIntArray, image->Length());

	// give a hint to GC about the amount of memory attached to this object
	// this help GC to know exactly the amount of memory it will free if collecting this object
	// this ensure GC will collect more regularly exhausted image objects
	V8::AdjustAmountOfExternalAllocatedMemory(mat.total());
	NanReturnValue(instance);
}

NAN_GETTER(Image::GetWidth) {
	NanScope();
	Image* image = Unwrap<Image>(args.This());
	NanReturnValue(Number::New(image->Width()));
}

NAN_GETTER(Image::GetHeight) {
	NanScope();
	Image* image = Unwrap<Image>(args.This());
	NanReturnValue(Number::New(image->Height()));
}

NAN_GETTER(Image::GetLength) {
	NanScope();
	NanReturnValue(Number::New(args.This()->GetIndexedPropertiesPixelDataLength()));
}

NAN_GETTER(Image::GetChannels) {
	NanScope();
	Image* image = Unwrap<Image>(args.This());
	NanReturnValue(Number::New(image->Channels()));
}

NAN_METHOD(Image::Decode) {
	NanScope();

	NanCallback* callback = NULL;

	// if no input buffer is specified we throw a JavaScript exception.
	if (!Buffer::HasInstance(args[0])) {
		return ThrowException(Exception::Error(String::New("invalid input data")));
	}
	// if a callback is specified we will decode asynchronously.
	// if not, we will do it synchronously and return the resulting image.
	if (args[1]->IsFunction()) {
		callback = new NanCallback(args[1].As<Function>());
	}

	// convert the node buffer to an OCV matrix.
	// we do this because OCV only accepts matrix as input for imdecode.
	// however this should not have any performance input as the matrix does not copy data.
	pixel_t* buffer = reinterpret_cast<pixel_t*>(Buffer::Data(args[0]->ToObject()));
	size_t   length = Buffer::Length(args[0]->ToObject());
	cv::Mat  tmpMat(length, 1, CV_8UC1, buffer);

	// async

	if (callback) {
		DecodeBaton* baton = new DecodeBaton();
		baton->mat = tmpMat;
		baton->callback = callback;
		baton->req.data = baton;

		uv_queue_work(uv_default_loop(), &baton->req, DecodeAsync, (uv_after_work_cb)AfterDecodeAsync);

		NanReturnUndefined();
	}

	// sync

	cv::Mat dstMat;

	try {
		// decode
		dstMat = cv::imdecode(tmpMat, CV_LOAD_IMAGE_UNCHANGED);
	}
	catch (...) {
		// OCV uses assertion to handle errors, thus the message is not very explicit.
		// we simply do nothing and check destination matrix.
	}
	if (dstMat.empty()) {
		ThrowException(Exception::Error(String::New("invalid file")));
	}

	// create and return a new image object
	Local<Object> instance = Image::New(dstMat);
	NanReturnValue(instance);
}

NAN_METHOD(Image::Encode) {
	NanScope();

	Image* image = Unwrap<Image>(args.This());
	const string filename = FromV8String(args[0]);
	const string ext = filename.substr(filename.find_last_of('.'));
	const uint32_t quality = args[1]->Uint32Value();
	NanCallback* callback = NULL;

	// if no input image is specified we throw a JavaScript exception.
	if (NULL == image) {
		return ThrowException(Exception::Error(String::New("invalid input image")));
	}

	// if a callback is specified we will decode asynchronously.
	// if not, we will do it synchronously and return the resulting image.
	if (args[2]->IsFunction()) {
		callback = new NanCallback(args[2].As<Function>());
	}

	// async

	if (callback) {
		EncodeBaton* baton = new EncodeBaton();
		baton->mat = image->mat;
		baton->ext = ext;
		baton->quality = quality;
		baton->callback = callback;
		baton->req.data = baton;

		uv_queue_work(uv_default_loop(), &baton->req, EncodeAsync, (uv_after_work_cb)AfterEncodeAsync);

		NanReturnUndefined();
	}

	// sync

	vector<uchar> dstVec;

	try {
		vector<int> params;

		// quality
		if (quality > 0) {
			params.push_back(".jpg" == ext ? CV_IMWRITE_JPEG_QUALITY : CV_IMWRITE_PNG_COMPRESSION);
			params.push_back(quality);
		}

		// encode
		cv::imencode(ext, image->mat, dstVec);
	}
	catch (...) {
		// OCV uses assertion to handle errors, thus the message is not very explicit.
		// we simply do nothing and check destination vector.
	}

	if (dstVec.empty()) {
		ThrowException(Exception::Error(String::New("invalid file")));
	}

	// create buffer and return it
	Local<Object> buffer = NanNewBufferHandle(reinterpret_cast<char*>(&dstVec[0]), dstVec.size());
	NanReturnValue(buffer);
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
	prototype->SetAccessor(NanSymbol("channels"), GetChannels);
	NODE_SET_PROTOTYPE_METHOD(constructorTemplate, "encode", Encode);

	// object
	NODE_SET_METHOD(constructorTemplate->GetFunction(), "decode", Decode);

	// export
	target->Set(NanSymbol("Image"), constructorTemplate->GetFunction());

	// TODO return?
}

void DecodeAsync(uv_work_t* req) {
	DecodeBaton* baton = static_cast<DecodeBaton*>(req->data);

	try {
		// decode
		baton->res = cv::imdecode(baton->mat, CV_LOAD_IMAGE_UNCHANGED);
	}
	catch (...) {
		// OCV uses assertion to handle errors, thus the message is not very explicit.
		// we simply do nothing and let the AfterDecodeAsync function tell it's an invalid file.
	}
}

void AfterDecodeAsync(uv_work_t* req) {
	NanScope();

	DecodeBaton* baton = static_cast<DecodeBaton*>(req->data);

	int argc = 0;
	Local<Value> argv[2];

	// execute callback with error.
	// note that we explicitly pass undefined to the 2nd argument.
	// this is to respect the arity of the function and allow curry for example.
	if (baton->res.empty()) {
		argv[argc++] = Exception::Error(String::New("invalid file"));
		argv[argc++] = Local<Value>::New(Undefined());
	}
	else {
		// create a new image object
		Local<Object> instance = Image::New(baton->res);

		// execute callback with the newly created image
		argv[argc++] = Local<Value>::New(Null());
		argv[argc++] = instance;
	}

	TryCatch tryCatch;

	baton->callback->Call(argc, argv);

	if (tryCatch.HasCaught()) {
		FatalException(tryCatch);
	}

	delete baton->callback;
	delete baton;
}

void EncodeAsync(uv_work_t* req) {
	EncodeBaton* baton = static_cast<EncodeBaton*>(req->data);

	try {
		vector<int> params;

		// quality
		if (baton->quality > 0) {
			params.push_back(".jpg" == baton->ext ? CV_IMWRITE_JPEG_QUALITY : CV_IMWRITE_PNG_COMPRESSION);
			params.push_back(baton->quality);
		}

		// encode
		cv::imencode(baton->ext, baton->mat, baton->res);
	}
	catch (...) {
		// OCV uses assertion to handle errors, thus the message is not very explicit.
		// we simply do nothing and let the AfterDecodeAsync function tell it's an invalid file.
	}
}

void AfterEncodeAsync(uv_work_t* req) {
	NanScope();

	EncodeBaton* baton = static_cast<EncodeBaton*>(req->data);

	int argc = 0;
	Local<Value> argv[2];

	// execute callback with error.
	// note that we explicitly pass undefined to the 2nd argument.
	// this is to respect the arity of the function and allow curry for example.
	if (baton->res.empty()) {
		argv[argc++] = Exception::Error(String::New("invalid file"));
		argv[argc++] = Local<Value>::New(Undefined());
	}
	else {
		// create a buffer object
		Local<Object> buffer = NanNewBufferHandle(reinterpret_cast<char*>(&baton->res[0]), baton->res.size());

		// execute callback with the newly created image
		argv[argc++] = Local<Value>::New(Null());
		argv[argc++] = buffer;
	}

	TryCatch tryCatch;

	baton->callback->Call(argc, argv);

	if (tryCatch.HasCaught()) {
		FatalException(tryCatch);
	}

	delete baton->callback;
	delete baton;
}