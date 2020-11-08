'use strict';

var implementation = require('./implementation');
var support = require('./lib/support');

module.exports = function getPolyfill() {
	/* eslint-disable operator-linebreak */
	if (
		typeof Set !== 'function' ||
		support.isGoogleTranslate() ||
		support.setHasOldFirefoxInterface() ||
		!support.setHasCorrectName() ||
		!support.setKeysIsValues() ||
		!support.setSupportsChaining() ||
		!support.setUsesSameValueZero() ||
		!support.setCompliantConstructor()
	) {
		return implementation;
	}

	return Set;
};
