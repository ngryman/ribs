/*!
 * ribs
 * Copyright (c) 2013-2014 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

'use strict';

var W = 8,
	H = 8,
	W_2 = W / 2,
	H_2 = H / 2;

module.exports = {
	4: {
		tl: {
			tl: { width: 4, height: 4, x: 0, y: 0 },
			t: { width: 4, height: 4, x: 0, y: 0 },
			tr: { width: 4, height: 4, x: 0, y: 0 },
			r: { width: 4, height: 4, x: 0, y: 0 },
			br: { width: 4, height: 4, x: 0, y: 0 },
			b: { width: 4, height: 4, x: 0, y: 0 },
			bl: { width: 4, height: 4, x: 0, y: 0 },
			l: { width: 4, height: 4, x: 0, y: 0 }
		},
		t: {
			tl: { width: 4, height: 4, x: 4, y: 0 },
			t: { width: 4, height: 4, x: 2, y: 0 },
			tr: { width: 4, height: 4, x: 0, y: 0 },
			r: { width: 4, height: 4, x: 0, y: 0 },
			br: { width: 4, height: 4, x: 0, y: 0 },
			b: { width: 4, height: 4, x: 2, y: 0 },
			bl: { width: 4, height: 4, x: 4, y: 0 },
			l: { width: 4, height: 4, x: 4, y: 0 }
		},
		tr: {
			tl: { width: 4, height: 4, x: 4, y: 0 },
			t: { width: 4, height: 4, x: 4, y: 0 },
			tr: { width: 4, height: 4, x: 4, y: 0 },
			r: { width: 4, height: 4, x: 4, y: 0 },
			br: { width: 4, height: 4, x: 4, y: 0 },
			b: { width: 4, height: 4, x: 4, y: 0 },
			bl: { width: 4, height: 4, x: 4, y: 0 },
			l: { width: 4, height: 4, x: 4, y: 0 }
		},
		r: {
			tl: { width: 4, height: 4, x: 4, y: 4 },
			t: { width: 4, height: 4, x: 4, y: 4 },
			tr: { width: 4, height: 4, x: 4, y: 4 },
			r: { width: 4, height: 4, x: 4, y: 2 },
			br: { width: 4, height: 4, x: 4, y: 0 },
			b: { width: 4, height: 4, x: 4, y: 0 },
			bl: { width: 4, height: 4, x: 4, y: 0 },
			l: { width: 4, height: 4, x: 4, y: 2 }
		},
		br: {
			tl: { width: 4, height: 4, x: 4, y: 4 },
			t: { width: 4, height: 4, x: 4, y: 4 },
			tr: { width: 4, height: 4, x: 4, y: 4 },
			r: { width: 4, height: 4, x: 4, y: 4 },
			br: { width: 4, height: 4, x: 4, y: 4 },
			b: { width: 4, height: 4, x: 4, y: 4 },
			bl: { width: 4, height: 4, x: 4, y: 4 },
			l: { width: 4, height: 4, x: 4, y: 4 }
		},
		b: {
			tl: { width: 4, height: 4, x: 4, y: 4 },
			t: { width: 4, height: 4, x: 2, y: 4 },
			tr: { width: 4, height: 4, x: 0, y: 4 },
			r: { width: 4, height: 4, x: 0, y: 4 },
			br: { width: 4, height: 4, x: 0, y: 4 },
			b: { width: 4, height: 4, x: 2, y: 4 },
			bl: { width: 4, height: 4, x: 4, y: 4 },
			l: { width: 4, height: 4, x: 4, y: 4 }
		},
		bl: {
			tl: { width: 4, height: 4, x: 0, y: 4 },
			t: { width: 4, height: 4, x: 0, y: 4 },
			tr: { width: 4, height: 4, x: 0, y: 4 },
			r: { width: 4, height: 4, x: 0, y: 4 },
			br: { width: 4, height: 4, x: 0, y: 4 },
			b: { width: 4, height: 4, x: 0, y: 4 },
			bl: { width: 4, height: 4, x: 0, y: 4 },
			l: { width: 4, height: 4, x: 0, y: 4 }
		},
		l: {
			tl: { width: 4, height: 4, x: 0, y: 4 },
			t: { width: 4, height: 4, x: 0, y: 4 },
			tr: { width: 4, height: 4, x: 0, y: 4 },
			r: { width: 4, height: 4, x: 0, y: 2 },
			br: { width: 4, height: 4, x: 0, y: 0 },
			b: { width: 4, height: 4, x: 0, y: 0 },
			bl: { width: 4, height: 4, x: 0, y: 0 },
			l: { width: 4, height: 4, x: 0, y: 2 }
		},
		2: {
			tl: { width: 4, height: 4, x: 2, y: 4 },
			t: { width: 4, height: 4, x: 0, y: 4 },
			tr: { width: 4, height: 4, x: 0, y: 4 },
			r: { width: 4, height: 4, x: 0, y: 2 },
			br: { width: 4, height: 4, x: 0, y: 0 },
			b: { width: 4, height: 4, x: 0, y: 0 },
			bl: { width: 4, height: 4, x: 2, y: 0 },
			l: { width: 4, height: 4, x: 2, y: 2 }
		}
	},
	16: {
		tl: {
			tl: { width: 8, height: 8, x: 0, y: 0 },
			t: { width: 8, height: 8, x: 0, y: 0 },
			tr: { width: 8, height: 8, x: 0, y: 0 },
			r: { width: 8, height: 8, x: 0, y: 0 },
			br: { width: 8, height: 8, x: 0, y: 0 },
			b: { width: 8, height: 8, x: 0, y: 0 },
			bl: { width: 8, height: 8, x: 0, y: 0 },
			l: { width: 8, height: 8, x: 0, y: 0 }
		},
		t: {
			tl: { width: 8, height: 8, x: 0, y: 0 },
			t: { width: 8, height: 8, x: 0, y: 0 },
			tr: { width: 8, height: 8, x: 0, y: 0 },
			r: { width: 8, height: 8, x: 0, y: 0 },
			br: { width: 8, height: 8, x: 0, y: 0 },
			b: { width: 8, height: 8, x: 0, y: 0 },
			bl: { width: 8, height: 8, x: 0, y: 0 },
			l: { width: 8, height: 8, x: 0, y: 0 }
		},
		tr: {
			tl: { width: 8, height: 8, x: 0, y: 0 },
			t: { width: 8, height: 8, x: 0, y: 0 },
			tr: { width: 8, height: 8, x: 0, y: 0 },
			r: { width: 8, height: 8, x: 0, y: 0 },
			br: { width: 8, height: 8, x: 0, y: 0 },
			b: { width: 8, height: 8, x: 0, y: 0 },
			bl: { width: 8, height: 8, x: 0, y: 0 },
			l: { width: 8, height: 8, x: 0, y: 0 }
		},
		r: {
			tl: { width: 8, height: 8, x: 0, y: 0 },
			t: { width: 8, height: 8, x: 0, y: 0 },
			tr: { width: 8, height: 8, x: 0, y: 0 },
			r: { width: 8, height: 8, x: 0, y: 0 },
			br: { width: 8, height: 8, x: 0, y: 0 },
			b: { width: 8, height: 8, x: 0, y: 0 },
			bl: { width: 8, height: 8, x: 0, y: 0 },
			l: { width: 8, height: 8, x: 0, y: 0 }
		},
		br: {
			tl: { width: 8, height: 8, x: 0, y: 0 },
			t: { width: 8, height: 8, x: 0, y: 0 },
			tr: { width: 8, height: 8, x: 0, y: 0 },
			r: { width: 8, height: 8, x: 0, y: 0 },
			br: { width: 8, height: 8, x: 0, y: 0 },
			b: { width: 8, height: 8, x: 0, y: 0 },
			bl: { width: 8, height: 8, x: 0, y: 0 },
			l: { width: 8, height: 8, x: 0, y: 0 }
		},
		b: {
			tl: { width: 8, height: 8, x: 0, y: 0 },
			t: { width: 8, height: 8, x: 0, y: 0 },
			tr: { width: 8, height: 8, x: 0, y: 0 },
			r: { width: 8, height: 8, x: 0, y: 0 },
			br: { width: 8, height: 8, x: 0, y: 0 },
			b: { width: 8, height: 8, x: 0, y: 0 },
			bl: { width: 8, height: 8, x: 0, y: 0 },
			l: { width: 8, height: 8, x: 0, y: 0 }
		},
		bl: {
			tl: { width: 8, height: 8, x: 0, y: 0 },
			t: { width: 8, height: 8, x: 0, y: 0 },
			tr: { width: 8, height: 8, x: 0, y: 0 },
			r: { width: 8, height: 8, x: 0, y: 0 },
			br: { width: 8, height: 8, x: 0, y: 0 },
			b: { width: 8, height: 8, x: 0, y: 0 },
			bl: { width: 8, height: 8, x: 0, y: 0 },
			l: { width: 8, height: 8, x: 0, y: 0 }
		},
		l: {
			tl: { width: 8, height: 8, x: 0, y: 0 },
			t: { width: 8, height: 8, x: 0, y: 0 },
			tr: { width: 8, height: 8, x: 0, y: 0 },
			r: { width: 8, height: 8, x: 0, y: 0 },
			br: { width: 8, height: 8, x: 0, y: 0 },
			b: { width: 8, height: 8, x: 0, y: 0 },
			bl: { width: 8, height: 8, x: 0, y: 0 },
			l: { width: 8, height: 8, x: 0, y: 0 }
		},
		2: {
			tl: { width: 8, height: 8, x: 0, y: 0 },
			t: { width: 8, height: 8, x: 0, y: 0 },
			tr: { width: 8, height: 8, x: 0, y: 0 },
			r: { width: 8, height: 8, x: 0, y: 0 },
			br: { width: 8, height: 8, x: 0, y: 0 },
			b: { width: 8, height: 8, x: 0, y: 0 },
			bl: { width: 8, height: 8, x: 0, y: 0 },
			l: { width: 8, height: 8, x: 0, y: 0 }
		}
	}
};