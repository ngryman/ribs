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
			"src/codec.cc",
			"src/codec/jpeg.cc",
			"src/image.cc",
			"src/init.cc"
		],
		"conditions": [
			["OS=='win'", {
				"libraries": [
					#"-l../deps/lib/jpeg.lib"
				],
				"include_dirs": [
					"deps/include",
					"<!(node -p -e \"require('path').dirname(require.resolve('nan'))\")"
				],
				"msvs_settings": {
					"VCCLCompilerTool": {
						"DisableSpecificWarnings": [ "4244", "4267", "4506", "4530" ],

						# warning: C4530
						# can't ovveride default exception handling, we have to modify %USERPROFILE%\.node-gyp\__NODE_RELASE__\common.gypi
						#  https://github.com/TooTallNate/node-gyp/issues/26
						#"ExceptionHandling": "Sync"
					}
				}
			}]
		],
		"cflags": [ "-fexceptions" ],
		"cflags_cc": [ "-fexceptions" ]
	}]
}