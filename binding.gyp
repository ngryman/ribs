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
			"src/image_encoder.cc",
			"src/smart_buffer.cc",
			"src/init.cc"
		],
		"include_dirs": [
			"deps/leptonica/include",
			"<!(node -p -e \"require('path').dirname(require.resolve('nan'))\")"
		],
		"conditions": [
			["OS=='mac'", {
				"libraries": [
					"-L../deps/leptonica/lib",
					#"-llept",
					"-lgif",
					"-ljpeg",
					"-lpng",
					"-ltiff",
					"-lwebp",
				],
				"cflags": [
					"-Wall"
				]
			}],
			["OS=='win'", {
				"libraries": [
					# TODO: check if -L works here
					"-l../deps/leptonica/lib/liblept.lib",
					"-l../deps/leptonica/lib/giflib.lib",
					"-l../deps/leptonica/lib/libjpeg.lib",
					"-l../deps/leptonica/lib/libpng.lib",
					"-l../deps/leptonica/lib/libtiff.lib",
					"-l../deps/leptonica/lib/zlib.lib",
				],
				"msvs_settings": {
					"VCCLCompilerTool": {
						"DisableSpecificWarnings": [ "4244", "4267", "4305", "4506", "4530" ],
						# does not work, to specity in common.gypi
						# fixed with utils/fix_msvs_settings.js
						"RuntimeLibrary": 2,

						# warning: C4530
						# can't ovveride default exception handling, we have to modify %USERPROFILE%\.node-gyp\__NODE_RELASE__\common.gypi
						#  https://github.com/TooTallNate/node-gyp/issues/26
						#"ExceptionHandling": "Sync"
					},
					"VCLinkerTool": {
						# does not work, even in common.gypi
						# fixed with utils/fix_msvs_settings.js
						"ImageHasSafeExceptionHandlers": "false"
					}
				}
			}]
		],
		"cflags": [ "-fexceptions" ],
		"cflags_cc": [ "-fexceptions" ]
	}]
}