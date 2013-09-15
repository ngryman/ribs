/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

#include "image_decoder.h"
#include "smart_buffer.h"

#include <setjmp.h>
#include "jpeglib.h"
#include "jerror.h"

using namespace v8;
using namespace std;
using namespace ribs;

static jmp_buf jpeg_jmpbuf; // not sure this is really thread safe...
static void jpeg_error_do_not_exit(j_common_ptr cinfo);

struct Baton {
	// data
	ImageDecoder::Result result;
	ImageDecoder::Callback callback;
	// fs stuff
	uv_fs_t fs;
	uv_file fd;
	uint8_t* buf;
	SmartBuffer buffer;
	// decoder stuff
	uv_work_t work;
};

// TODO: benchmark this size
// TODO: when custom allocator will be available, perhaps a big increase would be possible in the working area
static const int ChunkSize = 32 * 1024;

static void OnOpen(uv_fs_t* req);
static void OnRead(uv_fs_t* req);
static void Close(uv_fs_t* req);
static void BeginDecode(Baton* baton);
static void DecodeAsync(uv_work_t* req);
static void OnDecoded(uv_work_t* req);
static void Done(Baton* baton);

void ImageDecoder::Initialize(void) {
}

void ImageDecoder::Decode(const char* filename, ImageDecoder::Callback callback, NanCallback* jsCallback) {
	// create our Baton that will be passed over different uv calls
	Baton* baton = new Baton();
	baton->buf = NULL;
	// ensure error is empty
	baton->result.error[0] = 0;
	baton->result.filename = filename;
	baton->result.data = NULL;
	baton->result.callback = jsCallback;
	baton->callback = callback;
	// reference baton in the request
	baton->fs.data = baton;

	// open the file async
	uv_fs_open(uv_default_loop(), &baton->fs, baton->result.filename, O_RDONLY, 0, OnOpen);
}

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

	// stores file descriptor on read
	baton->fd = req->result;

	// read the file async
	uv_fs_req_cleanup(req);
	uv_fs_read(uv_default_loop(), &baton->fs, baton->fd, baton->buf, ChunkSize, 0, OnRead);
}

void OnRead(uv_fs_t* req) {
	Baton* baton = static_cast<Baton*>(req->data);

	if (-1 == req->result) {
		RibsError(baton->result.error, "can't read file", uv_strerror(uv_last_error(uv_default_loop())));
		Close(req);
		return Done(baton);
	}

	// copy data
	baton->buffer.append(baton->buf, req->result);

	// schedule a new read if all the buffer was read
	if (req->result == ChunkSize) {
		uv_fs_req_cleanup(req);
		uv_fs_read(uv_default_loop(), &baton->fs, baton->fd, baton->buf, ChunkSize, baton->buffer.length(), OnRead);
	}
	else {
		Close(req);
		BeginDecode(baton);
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

void BeginDecode(Baton* baton) {
	// reference baton in the request
	baton->work.data = baton;
	// pass the request to libuv to be run when a worker-thread is available to
	uv_queue_work(
		uv_default_loop(),
		&baton->work,
		DecodeAsync,
		(uv_after_work_cb)OnDecoded
	);
}

void DecodeAsync(uv_work_t* req) {
	Baton* baton = static_cast<Baton*>(req->data);
	JSAMPROW in;
	uint32_t* out;

	if (setjmp(jpeg_jmpbuf)) {
		free(out);
		free(in);
		RibsError(baton->result.error, "can't decode JPEG file", "internal jpeg error");
		return;
	}


	jpeg_error_mgr jerr;
	jpeg_decompress_struct cinfo;

	cinfo.err = jpeg_std_error(&jerr);
	jerr.trace_level = 0;
	jerr.error_exit = jpeg_error_do_not_exit; // do not exit!

	jpeg_create_decompress(&cinfo);
	jpeg_mem_src(&cinfo, baton->buffer, baton->buffer.length());
	jpeg_read_header(&cinfo, TRUE);

	jpeg_calc_output_dimensions(&cinfo);
	uint32_t spp = cinfo.out_color_components;
	uint32_t width = cinfo.output_width;
	uint32_t height = cinfo.output_height;
	uint32_t stride = width * 4;

	in = (JSAMPROW) calloc(sizeof(JSAMPLE), width * spp);
	out = (uint32_t*) calloc(sizeof(uint32_t), height * stride);
	if (!out || !in) {
		if (out) free(out);
		if (in) free(in);
		RibsError(baton->result.error, "can't decode JPEG file", "not enough memory");
		return;
	}

	jpeg_start_decompress(&cinfo);

	uint32_t* p = out;
	for (uint32_t y = 0; y < height; ++y) {
		jpeg_read_scanlines(&cinfo, &in, (JDIMENSION) 1);
		for (uint32_t x = 0; x < width; ++x, p++) {
			if (1 == cinfo.jpeg_color_space) {
				*p = 255 << 24
					| in[x] << 16
					| in[x] << 8
					| in[x];
				printf("%d %d %d", in[x] << 16, in[x] << 8, in[x]);
			}
			else {
				uint32_t bx = 3 * x;
				*p = 255 << 24
					| in[bx + 0] << 16
					| in[bx + 1] << 8
					| in[bx + 2];
			}
		}
	}

	jpeg_finish_decompress(&cinfo);
	jpeg_destroy_decompress(&cinfo);
	free(in);

	baton->result.width = width;
	baton->result.height = height;
	baton->result.data = reinterpret_cast<pixel_t*>(out);
};

void OnDecoded(uv_work_t* req) {
	// check if image was decoded correctly
	// TODO: check will be done before this
	Baton* baton = static_cast<Baton*>(req->data);
	if (NULL == baton->result.data) {
		RibsError(baton->result.error, "can't decode file", "unknown image format");
	}

	Done(baton);
};

void Done(Baton* baton) {
	// forward result to the callback
	baton->callback(&baton->result);

	// free baton allocated memory
	if(baton->buf) delete[] baton->buf;
	delete baton;
}

/**
 * JPEG
 */

// jpeg error_exit() kills the process. we don't want that.
static void jpeg_error_do_not_exit(j_common_ptr cinfo) {
	(*cinfo->err->output_message)(cinfo);
	jpeg_destroy(cinfo);
	longjmp(jpeg_jmpbuf, 0);
	return;
}

// libjpeg < 8: does not provide jpeg_mem_src
#if JPEG_LIB_VERSION < 80

/* Read JPEG image from a memory segment */
static void init_source(j_decompress_ptr cinfo) {}

static boolean fill_input_buffer(j_decompress_ptr cinfo) {
	ERREXIT(cinfo, JERR_INPUT_EMPTY);
	return TRUE;
}

static void skip_input_data(j_decompress_ptr cinfo, long num_bytes) {
	jpeg_source_mgr* src = (jpeg_source_mgr*) cinfo->src;
	if (num_bytes > 0) {
		src->next_input_byte += (size_t) num_bytes;
		src->bytes_in_buffer -= (size_t) num_bytes;
	}
}

static void term_source (j_decompress_ptr cinfo) {}

static void jpeg_mem_src (j_decompress_ptr cinfo, void* buffer, long nbytes) {
	jpeg_source_mgr* src;

	if (cinfo->src == NULL) {
		cinfo->src = (struct jpeg_source_mgr *)
		(*cinfo->mem->alloc_small) ((j_common_ptr) cinfo, JPOOL_PERMANENT,
		sizeof(struct jpeg_source_mgr));
	}

	src = (struct jpeg_source_mgr*) cinfo->src;
	src->init_source = init_source;
	src->fill_input_buffer = fill_input_buffer;
	src->skip_input_data = skip_input_data;
	src->resync_to_restart = jpeg_resync_to_restart; /* use default method */
	src->term_source = term_source;
	src->bytes_in_buffer = nbytes;
	src->next_input_byte = (JOCTET*)buffer;
}

#endif