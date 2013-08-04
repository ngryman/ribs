{
	'conditions': [
		['OS=="win"', {
			'variables': {
			}
		}]
	],
	'targets': [{
		'target_name': 'ribs',
		'sources': [
			'src/test.cc'
		],
		'conditions': [
			['OS=="win"', {
				'libraries': [
					'-l../deps/lib/cairo.lib'
				],
				'include_dirs': [
					'deps/include'
				]
			}]
		],
		'cflags': [ '-fexceptions' ],
		'cflags_cc': [ '-fexceptions' ]
	}]
}