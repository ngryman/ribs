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
 * Convert a string percentage to a number between 0-1.
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
 * Checks if an arguments is one of the specified types.
 *
 * @param {string} argName - Argument name to check.
 * @param {*} arg - Argument value to check.
 * @param {...string} type - One of JavaScript primitive types.
 */
utils.checkType = function(argName, arg, type) {
	var types = Array.prototype.slice.call(arguments, 2);

	// if no type matches, throws an exception meant to be catch by the user.
	if (!types.some(function(type) { return type == typeof arg })) {
		throw new Error(argName + ' should be a ' + types.join(' or '));
	}
};

/**
 * Export.
 */

module.exports = utils;