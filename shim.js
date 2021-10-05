'use strict';

var define = require('define-properties');
var globalThis = require('globalthis')();
var SLOT = require('internal-slot');

var getPolyfill = require('./polyfill');
var support = require('./lib/support');
var addIterableToSet = require('./lib/set-helpers').addIterableToSet;
var addIterator = require('./lib/helpers').addIterator;

var Call = require('es-abstract/2021/Call');
var OrdinarySetPrototypeOf = require('es-abstract/2021/OrdinarySetPrototypeOf');

var force = function () {
	return true;
};

var replaceGlobal = function (SetShim) {
	define(globalThis, { Set: SetShim }, { Set: force });
	return SetShim;
};

// eslint-disable-next-line max-lines-per-function
module.exports = function shimSet() {
	if (typeof Set !== 'function' || support.isGoogleTranslate() || support.setHasOldFirefoxInterface()) {
		return replaceGlobal(getPolyfill());
	}

	var OrigSet = Set;
	var OrigSet$prototype = OrigSet.prototype;
	var OrigSet$add = OrigSet$prototype.add;
	var OrigSet$has = OrigSet$prototype.has;
	var OrigSet$delete = OrigSet$prototype['delete'];

	if (!support.setCompliantConstructor()) {
		var SetShim = function Set() {
			if (!(this instanceof SetShim)) {
				throw new TypeError('Constructor Set requires "new"');
			}
			if (this && SLOT.has(this, '[[SetCompliantConstructorShim]]')) {
				throw new TypeError('Bad construction');
			}
			var s = new OrigSet();
			SLOT.set(s, '[[SetCompliantConstructorShim]]', true);
			if (arguments.length > 0) {
				addIterableToSet(s, arguments[0]);
			}
			delete s.constructor;
			OrdinarySetPrototypeOf(s, SetShim.prototype);
			return s;
		};
		SetShim.prototype = OrigSet$prototype;
		define(SetShim.prototype, { constructor: SetShim }, {
			constructor: function () { return true; }
		});

		replaceGlobal(SetShim);
	}

	if (!support.setUsesSameValueZero()) {
		define(Set.prototype, {
			add: function add(v) {
				Call(OrigSet$add, this, [v === 0 ? 0 : v]);
				return this;
			},
			'delete': function _delete(v) {
				return Call(OrigSet$delete, this, [v === 0 ? 0 : v]);
			},
			has: function has(v) {
				return Call(OrigSet$has, this, [v === 0 ? 0 : v]);
			}
		}, {
			add: force,
			'delete': force,
			has: force
		});
	} else if (!support.setSupportsChaining()) {
		define(Set.prototype, {
			add: function add(v) {
				Call(OrigSet$add, this, [v]);
				return this;
			}
		}, { add: force });
	}

	if (!support.setKeysIsValues()) {
		define(Set.prototype, { keys: Set.prototype.values }, { keys: force });
	}

	if (!support.setHasCorrectName()) {
		define(Set.prototype, {
			has: function has(v) {
				return Call(OrigSet$has, this, v);
			}
		}, { has: force });
	}

	if (Object.getPrototypeOf) {
		// Shim incomplete iterator implementations.
		addIterator(Object.getPrototypeOf(new Set().values()));
	}

	return globalThis.Set;
};
