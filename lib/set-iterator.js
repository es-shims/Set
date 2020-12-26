'use strict';

var define = require('define-properties');
var hasSymbols = require('has-symbols')();

var GetIntrinsic = require('get-intrinsic');
var OrdinaryObjectCreate = require('es-abstract/2020/OrdinaryObjectCreate');

var addIterator = require('./helpers').addIterator;

var SetIterator = function SetIterator(it) {
	this['[[it]]'] = it;
};

var IteratorPrototype = GetIntrinsic('%IteratorPrototype%', true);
if (IteratorPrototype) {
	SetIterator.prototype = OrdinaryObjectCreate(IteratorPrototype);
}
addIterator(SetIterator.prototype);

define(SetIterator.prototype, {
	'[[isSetIterator]]': true,

	next: function next() {
		if (!this['[[isSetIterator]]']) {
			throw new TypeError('Not a SetIterator');
		}
		return this['[[it]]'].next();
	}
});

if (hasSymbols && Symbol.toStringTag) {
	Object.defineProperty(SetIterator.prototype, Symbol.toStringTag, {
		configurable: true,
		enumerable: false,
		value: 'Set Iterator',
		writable: false
	});
}

module.exports = SetIterator;
