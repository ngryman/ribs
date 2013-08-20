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
			"src/init.cc"
		],
		"conditions": [
			["OS=='win'", {
				"libraries": [
					"-l../deps/lib/jpeg.lib"
				],
				"include_dirs": [
					"deps/include",
					"<!(node -p -e \"require('path').dirname(require.resolve('nan'))\")"
				]
			}]
		],
		"cflags": [ "-fexceptions" ],
		"cflags_cc": [ "-fexceptions" ]
	}]
}