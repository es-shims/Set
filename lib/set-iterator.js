'use strict';

var define = require('define-properties');
var hasSymbols = require('has-symbols')();
var SLOT = require('internal-slot');

var GetIntrinsic = require('get-intrinsic');
var DefinePropertyOrThrow = require('es-abstract/2021/DefinePropertyOrThrow');
var OrdinaryObjectCreate = require('es-abstract/2021/OrdinaryObjectCreate');

var addIterator = require('./helpers').addIterator;

var SetIterator = function SetIterator(it) {
	SLOT.set(this, '[[isSetIterator]]', true);
	SLOT.set(this, '[[it]]', it);
};

var IteratorPrototype = GetIntrinsic('%IteratorPrototype%', true);
if (IteratorPrototype) {
	SetIterator.prototype = OrdinaryObjectCreate(IteratorPrototype);
}
addIterator(SetIterator.prototype);

define(SetIterator.prototype, {
	next: function next() {
		if (!SLOT.has(this, '[[isSetIterator]]')) {
			throw new TypeError('Not a SetIterator');
		}
		return SLOT.get(this, '[[it]]').next();
	}
});

if (hasSymbols && Symbol.toStringTag) {
	DefinePropertyOrThrow(SetIterator.prototype, Symbol.toStringTag, {
		'[[Configurable]]': true,
		'[[Enumerable]]': false,
		'[[Value]]': 'Set Iterator',
		'[[Writable]]': false
	});
}

module.exports = SetIterator;
