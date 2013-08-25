{
	"conditions": [
		["OS=='win'", {
			"variables": {
			}
		}]
	],
	"targets": [{
		"target_name": "ribs",
		"sources": [
			"src/image.cc",
			"src/image_decoder.cc",
			"src/smart_buffer.cc",
			"src/init.cc"
		],
		"conditions": [
			["OS=='win'", {
				"libraries": [
					"-l../deps/leptonica/lib/liblept168-static-mtdll.lib",
					"-l../deps/leptonica/lib/giflib416-static-mtdll.lib",
					"-l../deps/leptonica/lib/libjpeg8c-static-mtdll.lib",
					"-l../deps/leptonica/lib/libpng143-static-mtdll.lib",
					"-l../deps/leptonica/lib/libtiff394-static-mtdll.lib",
					"-l../deps/leptonica/lib/zlib125-static-mtdll.lib",
				],
				"include_dirs": [
					"deps/leptonica/include",
					"<!(node -p -e \"require('path').dirname(require.resolve('nan'))\")"
				],
				"msvs_settings": {
					"VCCLCompilerTool": {
						"DisableSpecificWarnings": [ "4244", "4267", "4305", "4506", "4530" ],
						# does not work, to specity int common.gypi
						"RuntimeLibrary": 2,

						# warning: C4530
						# can't ovveride default exception handling, we have to modify %USERPROFILE%\.node-gyp\__NODE_RELASE__\common.gypi
						#  https://github.com/TooTallNate/node-gyp/issues/26
						#"ExceptionHandling": "Sync"
					},
					"VCLinkerTool": {
						# does not work
						"ImageHasSafeExceptionHandlers": "false"
					}
				}
			}]
		],
		"cflags": [ "-fexceptions" ],
		"cflags_cc": [ "-fexceptions" ]
	}]
}