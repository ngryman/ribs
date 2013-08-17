/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * MIT Licensed
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
 * @param {string} formula - The formula to apply
 * @param {number} number - The base number to which apply the formula.
 * @return {number} - The result of the formula.
 */
utils.computeFormula = function(formula, number) {
	var f = parseFloat(formula),
		i, o, v;

	// early return for a number
	// here we cast the number back to a string in order to check if `parseFloat` hasn't be too smart and evicted
	// strings like `100-10` and giving `100`
	// this ensures we don't bypass the `-` operator.
	if (!isNaN(f) && String(f) === formula) return f;

	// splits operators and operands in order to process them
	f = formula.split(/([-xar])/);

	// a valid formula should be composed of pairs of operators and operands plus optional value (2n+1)
	if (0 === f.length % 2) throw new Error('invalid formula: ' + formula);

	// if a number was prepended, use it instead of argument
	v = parseFloat(f[0]);
	if (!isNaN(v)) number = v;

	// then process this list in order applying operator/operands to x
	for (i = 1; i < f.length; i += 2) {
		o = f[i];
		v = parseFloat(f[i + 1]);

		if (isNaN(v)) throw new Error('invalid operand: ' + v + ' for formula: ' + formula + '');

		if ('-' == o) number = number - v;
		else if ('x' == o) number = number * utils.percentage(v);
		else if ('a' == o) number = number + v;
		else if ('r' == o) number = utils.roundDown(number, v);
		else throw new Error('invalid operator: ' + o + ' for formula: ' + formula + '');
	}

	return number;
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