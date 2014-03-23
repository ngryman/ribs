{
	'targets': [{
		'target_name': 'ribs',

		'sources': [
			'src/image.cc',
			'src/operation.cc',
			'src/operation/decode.cc',
			'src/operation/encode.cc',
			'src/operation/resize.cc',
			'src/operation/crop.cc',
			'src/debug.cc',
			'src/init.cc'
		],

		'include_dirs': [
			'<!@(pkg-config opencv --cflags-only-I | sed s/-I//g)',
			'<!(node -p -e \'require("path").dirname(require.resolve("nan"))\')'
		],

		'libraries': [
			'<!@(pkg-config opencv --libs)'
		],

		'cflags': [
			'-Wall',
			'-std=c++11',
			'<!@(pkg-config opencv --cflags-only-other)'
		],

		# negate defaults cflags defined in common.gpyi
		#
		#   https://github.com/TooTallNate/node-gyp/issues/26
		'cflags_cc!': [
			'-fno-rtti',
			'-fno-exceptions'
		]
	}]
}