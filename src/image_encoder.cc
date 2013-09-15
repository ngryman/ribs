/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

#include "image.h"
#include "image_encoder.h"
#include "smart_buffer.h"

#include <setjmp.h>
#include "jpeglib.h"
#include "jerror.h"

using namespace v8;
using namespace std;
using namespace ribs;

static void jpeg_error_do_not_exit(j_common_ptr cinfo);

struct Baton {
	// data
	ImageEncoder::Result result;
	ImageEncoder::Callback callback;
	// parameters
	const Image* image;
	uint32_t quality;
	bool progressive;
	// fs stuff
	uv_fs_t fs;
	uv_file fd;
	uint8_t* buf;
	size_t buflen;
	// decoder stuff
	uv_work_t work;
	pixel_t* data;
	jmp_buf jpeg_jmpbuf;
};

// TODO: benchmark this size
// TODO: when custom allocator will be available, perhaps a big increase would be possible in the working area
static const int ChunkSize = 32 * 1024;

static void BeginEncode(Baton * baton);
static void EncodeAsync(uv_work_t* req);
static void OnEncoded(uv_work_t* req);
static void OnOpen(uv_fs_t* req);
static void OnWrite(uv_fs_t* req);
static void Close(uv_fs_t* req);
static void Done(Baton* baton);

void ImageEncoder::Initialize(void) {
}

void ImageEncoder::Encode(const char* filename, int32_t quality, bool progressive, const Image* image, Callback callback, NanCallback* jsCallback) {
	// create our Baton that will be passed over different uv calls
	Baton* baton = new Baton();
	baton->data = image->pixels();
	baton->buf = NULL;
	// ensure error is empty
	baton->result.error[0] = 0;
	baton->result.filename = filename;
	baton->image = image;
	baton->quality = quality;
	baton->progressive = progressive;
	baton->result.callback = jsCallback;
	baton->callback = callback;
	// reference baton in the request
	baton->fs.data = baton;

	// encode async
	BeginEncode(baton);
}

void BeginEncode(Baton* baton) {
	// reference baton in the request
	baton->work.data = baton;
	// pass the request to libuv to be run when a worker-thread is available to
	uv_queue_work(
		uv_default_loop(),
		&baton->work,
		EncodeAsync,
		(uv_after_work_cb)OnEncoded
    );
}

void EncodeAsync(uv_work_t* req) {
	Baton* baton = static_cast<Baton*>(req->data);
	uint32_t width = baton->image->width();
	uint32_t height = baton->image->height();
	uint32_t quality = baton->quality;
	uint32_t progressive = baton->progressive;
	uint32_t* in;
	JSAMPROW out;
	uint8_t* buf;
	unsigned long buflen;

	if (setjmp(baton->jpeg_jmpbuf)) {
		free(out);
		free(in);
		RibsError(baton->result.error, "can't decode JPEG file", "internal jpeg error");
		return;
	}

	// quality clamping
	if (quality > 100) quality = 100;

	jpeg_error_mgr jerr;
	jpeg_compress_struct cinfo;

	cinfo.err = jpeg_std_error(&jerr);
	cinfo.client_data = reinterpret_cast<void*>(&baton->jpeg_jmpbuf);
	jerr.error_exit = jpeg_error_do_not_exit; // do not exit!
	jpeg_create_compress(&cinfo);
	jpeg_mem_dest(&cinfo, &buf, &buflen);
//	FILE* file = fopen(baton->result.filename, "w+");
//	jpeg_stdio_dest(&cinfo, file);

	cinfo.image_width = width;
	cinfo.image_height = height;
	cinfo.input_components = 3;
	cinfo.in_color_space = JCS_RGB;
	jpeg_set_defaults(&cinfo);
	// setting optimize_coding to TRUE seems to improve compression by approx 2-4 percent, add increases comp time by
	// approx 20%.
	cinfo.optimize_coding = TRUE;

	jpeg_set_quality(&cinfo, quality, TRUE);
	if (progressive) jpeg_simple_progression(&cinfo);

	uint32_t spp = cinfo.input_components;
	in = reinterpret_cast<uint32_t*>(baton->image->pixels());
	out = (JSAMPROW) calloc(sizeof(JSAMPLE), width * spp);
	if (!out) {
		RibsError(baton->result.error, "can't encode to JPEG file", "not enough memory");
		return;
	}

	jpeg_start_compress(&cinfo, TRUE);

	uint32_t* pin = in;
	JSAMPROW pout = out;
	for (uint32_t y = 0; y < height; ++y) {
		pout = out;
		for (uint32_t x = 0; x < width; ++x, pin++, pout += spp) {
			pout[0] = (*pin >> 16) & 0xff;
			pout[1] = (*pin >> 8) & 0xff;
			pout[2] = (*pin) & 0xff;
		}
		jpeg_write_scanlines(&cinfo, &out, (JDIMENSION) 1);
	}

	jpeg_finish_compress(&cinfo);
	jpeg_destroy_compress(&cinfo);
	free(out);

	baton->buf = buf;
	baton->buflen = buflen;
};

void OnEncoded(uv_work_t* req) {
	Baton* baton = static_cast<Baton*>(req->data);

	Done(baton);

	// open the file async
//	uv_fs_open(uv_default_loop(), &baton->fs, baton->result.filename, O_WRONLY, 0, OnOpen);
};

void OnOpen(uv_fs_t* req) {
	Baton* baton = static_cast<Baton*>(req->data);

	if (-1 == req->result) {
		RibsError(baton->result.error, "can't open file", uv_strerror(uv_last_error(uv_default_loop())));
		uv_fs_req_cleanup(req);
		return Done(baton);
	}

	// allocate temporary buffer
	baton->buf = new uint8_t[ChunkSize];
	if (NULL == baton->buf) {
		RibsError(baton->result.error, "can't open file", "not enough memory");
		Close(req);
		return Done(baton);
	}

	// stores file descriptor for writing
	baton->fd = req->result;

	// write to the file async
	uv_fs_req_cleanup(req);
	uv_fs_write(uv_default_loop(), &baton->fs, baton->fd, baton->buf, ChunkSize, 0, OnWrite);
}

void OnWrite(uv_fs_t* req) {
	Baton* baton = static_cast<Baton*>(req->data);

	if (-1 == req->result) {
		RibsError(baton->result.error, "can't write to file", uv_strerror(uv_last_error(uv_default_loop())));
		Close(req);
		return Done(baton);
	}

	// copy data
//	baton->buffer.append(baton->buf, req->result);

	// schedule a new read if all the buffer was read
	if (req->result == ChunkSize) {
		uv_fs_req_cleanup(req);
//		uv_fs_write(uv_default_loop(), &baton->fs, baton->fd, baton->buf, ChunkSize, baton->buffer.length(), OnWrite);
	}
	else {
		Close(req);
		BeginEncode(baton);
	}
}

void Close(uv_fs_t* req) {
	// clean previous request
	uv_fs_req_cleanup(req);

	Baton* baton = static_cast<Baton*>(req->data);

	// close file sync
	// it's a quick operation that does not need threading overhead
	int err = uv_fs_close(uv_default_loop(), req, baton->fd, NULL);

	// fail silently
	if (-1 == err) {
		// TODO: log warning
		//baton->result.error = RibsError("Error closing file", uv_strerror(uv_last_error(uv_default_loop())));
		uv_fs_req_cleanup(req);
	}
}

void Done(Baton* baton) {
	// forward result to the callback
	baton->callback(&baton->result);

	// free baton allocated memory
	delete baton;
}

// jpeg error_exit() kills the process. we don't want that.
static void jpeg_error_do_not_exit(j_common_ptr cinfo) {
	(*cinfo->err->output_message)(cinfo);
	jpeg_destroy(cinfo);
	longjmp(*reinterpret_cast<jmp_buf*>(&cinfo->client_data), 0);
	return;
}

// libjpeg < 8: does not provide jpeg_mem_dest
#if JPEG_LIB_VERSION < 80

// http://www.cis.cau.edu/~pmolnar/robotics/docs/aibo/sample/W3AIBO/W3AIBO/jpeg_mem_dest.c

typedef struct {
    jpeg_destination_mgr pub;
    JOCTET *buf;
    size_t bufsize;
    size_t jpegsize;
} mem_destination_mgr;

typedef mem_destination_mgr *mem_dest_ptr;

METHODDEF(void) init_destination(j_compress_ptr cinfo)
{
	mem_dest_ptr dest = (mem_dest_ptr) cinfo->dest;

	dest->pub.next_output_byte = dest->buf;
	dest->pub.free_in_buffer = dest->bufsize;
    dest->jpegsize = 0;
}

METHODDEF(boolean) empty_output_buffer(j_compress_ptr cinfo)
{
    mem_dest_ptr dest = (mem_dest_ptr) cinfo->dest;

    dest->pub.next_output_byte = dest->buf;
    dest->pub.free_in_buffer = dest->bufsize;

    return FALSE;
    ERREXIT(cinfo, JERR_BUFFER_SIZE);
}

METHODDEF(void) term_destination(j_compress_ptr cinfo)
{
    mem_dest_ptr dest = (mem_dest_ptr) cinfo->dest;
    dest->jpegsize = dest->bufsize - dest->pub.free_in_buffer;
}

GLOBAL(void) jpeg_mem_dest(j_compress_ptr cinfo, JOCTET* buf, size_t bufsize)
{
	mem_dest_ptr dest;

	if (cinfo->dest == NULL) {
        cinfo->dest = (jpeg_destination_mgr*)
            (*cinfo->mem->alloc_small) ((j_common_ptr)cinfo, JPOOL_PERMANENT,
                                        sizeof(mem_destination_mgr));
	}

	dest = (mem_dest_ptr) cinfo->dest;

	dest->pub.init_destination    = init_destination;
	dest->pub.empty_output_buffer = empty_output_buffer;
	dest->pub.term_destination    = term_destination;

    dest->buf      = buf;
    dest->bufsize  = bufsize;
    dest->jpegsize = 0;
}

GLOBAL(int) jpeg_mem_size(j_compress_ptr cinfo)
{
    mem_dest_ptr dest = (mem_dest_ptr) cinfo->dest;
    return dest->jpegsize;
}

#endif