/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

'use strict';

/**
 * Utils namespace.
 */

var utils = {};

/**
 * Applies a formula to a given number.
 * A formula is a succession of operators and operands like this: `x50-20r2`. If it is prefixed by a number value, this
 * will be used instead of the argument: `100-10` will give `90`.
 *
 * The operands can be on of the following values:
 *  - `-`: deducts value
 *  - `x`: multiply by percentage
 *  - `a`: adds value
 *  ` `r`: rounds down to the nearest
 *
 * @param {string} formula - The formula to apply.
 * @param {number} number - The base number to which apply the formula.
 * @return {number} - The result of the formula.
 */
utils.computeFormula = function(formula, number) {
	var f = parseFloat(formula),
		i, o, v, len;

	// early return for null values
	if (null == formula) return 0;
	// sanitize number
	number = number || 0;

	// early return for a number
	// here we cast the number back to a string in order to check if `parseFloat` hasn't be too smart and evicted
	// strings like `100-10` and giving `100`
	// this ensures we don't bypass the `-` operator.
	if (!isNaN(f) && String(f) === formula) return f;

	// splits operators and operands in order to process them
	f = formula.split(/([-xar])/);
	len = f.length;

	// a valid formula should be composed of pairs of operators and operands plus optional value (2n+1)
	if (0 === len % 2) throw new Error('invalid formula: ' + formula);

	// if a number was prepended, use it instead of argument
	v = parseFloat(f[0]);
	if (!isNaN(v)) number = v;
	else if (1 == len) throw new Error('invalid formula: ' + formula);

	// then process this list in order applying operator/operands to x
	for (i = 1; i < len; i += 2) {
		o = f[i];
		v = parseFloat(f[i + 1]);

		if (isNaN(v)) throw new Error('invalid operand: ' + v + ' for formula: ' + formula);

		if ('-' == o) number = number - 2 * v;
		else if ('x' == o) number = number * utils.percentage(v);
		else if ('a' == o) number = number + 2 * v;
		else if ('r' == o) number = utils.roundDown(number, v);
		else throw new Error('invalid operator: ' + o + ' for formula: ' + formula);
	}

	return number;
};

/**
* Fetch initial coordinates (top left point) of an area, relative to given coordinates and the mode of computation.
*
* @param mode - The mode to compute those coordinates.
* It can be one of the following values (non order sensitive):
*  - `tl`: top left
*  - `t`: top center
*  - `tr`: top right
*  - `r`: center right
*  - `br`: bottom right
*  - `b`: bottom center
*  - `bl`: bottom left
*  - `l`: center left
*
* @param {number} width - Reference width to compute initial coordinates.
* @param {number} height - Reference height to compute initial coordinates.
* @param {number} x - Reference x coordinates to compute initial coordinates.
* @param {number} y - Reference y coordinates to compute initial coordinates.
* @param {object} coords - Output coordinates, will hold `x` and `y` values of the anchor.
*/
utils.computeRegionOrigin = function(mode, width, height, x, y, coords) {
	x = x || 0;
	y = y || 0;

	// early return for invalid anchor
	// return center by default
	if ('string' != typeof mode || 0 === mode.length || mode.length > 2) {
		coords.x = x - Math.round(width / 2);
		coords.y = y - Math.round(height / 2);
		return;
	}

	mode = mode.toLowerCase();

	// x axis alignment
	if (~mode.indexOf('l')) coords.x = x;
	else if (~mode.indexOf('r')) coords.x = x - width;
	else coords.x = x - Math.round(width / 2);

	// y axis alignment
	if (~mode.indexOf('t')) coords.y = y;
	else if (~mode.indexOf('b')) coords.y = y - height;
	else coords.y = y - Math.round(height / 2);
};

/**
* Fetch coordinates of an anchor point applied to given `width` and `height`.
*
* @param {string} anchor - The anchor point.
* It can be one of the following values (non order sensitive):
*  - `tl`: top left
*  - `t`: top center
*  - `tr`: top right
*  - `r`: center right
*  - `br`: bottom right
*  - `b`: bottom center
*  - `bl`: bottom left
*  - `l`: center left
*
* @param {number} width - Reference width to compute the anchor.
* @param {number} height - Reference height to compute the anchor.
* @param {object} coords - Output coordinates, will hold `x` and `y` values of the anchor.
*/
utils.computeAnchor = function(anchor, width, height, coords) {
	// compute region origin taking 0,0 as reference point.
	// This gives us negative coordinates that are the result of central symmetry around 0,0
	utils.computeRegionOrigin(anchor, width, height, 0, 0, coords);

	// so we transform them back to get the values we want
	coords.x = -coords.x;
	coords.y = -coords.y;
};

/**
 * Rounds down a number to the nearest multiple value.
 *
 * @param {number} number - The number to round down.
 * @param {number} multiple - The multiple to round to.
 * @return {number} - The rounded result.
 */
utils.roundDown = function(number, multiple) {
	return Math.floor(number / multiple) * multiple;
};

/**
 * Converts a string percentage to a number between 0-1.
 *
 * @param {String} percentage - String percentage.
 * @return {number} - Number between 0-1.
 */
utils.percentage = function(percentage) {
	return utils.clamp(parseFloat(percentage) / 100, 0, 1);
};

/**
 * Clamps a number.
 *
 * @param {Number} number - Number to clamp.
 * @param {Number} min - Minimum.
 * @param {Number} max - Maximum.
 * @return {number} - Clamped number.
 */
utils.clamp = function(number, min, max) {
	return Math.max(min, Math.min(max, number));
};

/**
 * The most simple function in da world!
 */
utils.noop = function() {};

/**
 * Checks if an argument is one of the specified types.
 *
 * @param {string} argName - Argument name to check.
 * @param {*} arg - Argument value to check.
 * @param {boolean} nullable - Can `arg` be `null` or `undefined`?
 * @param {...string} type - One of JavaScript primitive types.
 */
utils.checkType = function(argName, arg, nullable, type) {
	if (null == arg) {
		if (nullable) return;
		throw new Error(argName + ' should not be null nor undefined');
	}

	var types = Array.prototype.slice.call(arguments, 3);

	// if no type matches, throws an exception meant to be catch by the user.
	if (!types.some(function(type) { return type == typeof arg; })) {
		throw new Error(argName + ' should be a ' + types.join(' or '));
	}
};

/**
 * Export.
 */

module.exports = utils;