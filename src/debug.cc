/*!
 * ribs
 * Copyright (c) 2013-2014 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

#include "debug.h"

#ifdef DEBUG

#include <execinfo.h>
#include <cxxabi.h>
#include <iostream>

using namespace std;
using namespace ribs;

static inline string parseBinary(string& symbol);
static inline string parseFunction(string& symbol);

void Debug::PrintStackTrace(string text) {
	if (!text.empty())
		cerr << text << endl;

	auto frames = Debug::StackTrace();
	for (auto it = frames.begin(); it != frames.end(); it++)
		cerr << '\t' << *it << endl;
}

vector<string> Debug::StackTrace(int start, int maxFrames) {
	auto frames = vector<string>();

	// storage array for stack trace address data
	void* addrs[maxFrames];

	// retrieve current stack addresses
	int addrsLen = backtrace(addrs, sizeof(addrs) / sizeof(void*));
	if (0 == addrsLen) return frames;

	// resolve addresses into strings containing "filename(function+address)",
	// this array must be free()-ed
	char** symbols = backtrace_symbols(addrs, addrsLen);

	// iterate over all found symbols, except the first which is the address
	// of this function
	//
	// format of a symbol is:
	//   binary(function+address)
	//
	for (int i = start; i < addrsLen; i++) {
		auto symbol = string(symbols[i]);
		auto frame = string(
			parseBinary(symbol) +
			": " +
			parseFunction(symbol)
		);

		frames.push_back(frame);
	}

	free(symbols);

	return frames;
}

static inline string parseBinary(string& symbol) {
	size_t pos;
	string binary;

	// extract full binary name
	pos = symbol.find('(');
	binary = symbol.substr(0, pos);

	// only keep the base name
	pos = binary.rfind('/');
	if (string::npos != pos)
		binary = binary.substr(pos + 1);

	return binary;
}

static inline string parseFunction(string& symbol) {
	string function;
	size_t lpos, rpos;

	lpos = symbol.find('(') + 1;
	rpos = symbol.find('+');
	if (string::npos == rpos)
		rpos = symbol.find(')');

	function = symbol.substr(lpos, rpos - lpos);

	int status;
	size_t nameLength = 256;
	char name[nameLength];

	abi::__cxa_demangle(&function[0], name, &nameLength, &status);
	if (0 == status)
		function = name;

	return function;
}

#else

vector<string> Debug::StackTrace(int maxFrames) { return vector<string>(); }

#endif