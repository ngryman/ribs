/*!
 * ribs
 * Copyright (c) 2013-2014 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

#ifndef __RIBS_DEBUG_H__
#define __RIBS_DEBUG_H__

#include <string>
#include <vector>

namespace ribs {

class Debug {
public:
	static void                     PrintStackTrace(std::string text = "");
	static std::vector<std::string> StackTrace(int start = 2, int maxFrames = 64);
};

}

#endif