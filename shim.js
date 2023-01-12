'use strict';

var define = require('define-properties');
var globalThis = require('globalthis')();

var getPolyfill = require('./polyfill');
var support = require('./lib/support');
var addIterator = require('./lib/helpers').addIterator;

var Call = require('es-abstract/2022/Call');

var force = function () {
	return true;
};

var replaceGlobal = function (SetShim) {
	define(globalThis, { Set: SetShim }, { Set: force });
	return SetShim;
};

module.exports = function shimSet() {
	if (typeof Set === 'function') {
		if (support.isGoogleTranslate()) {
			delete Set.prototype.remove;
			delete Set.prototype.items;
			delete Set.prototype.map;
			define(Set.prototype, { keys: Set.prototype.values }, { keys: force });
		}

		if (support.setHasOldFirefoxInterface()) {
			if (typeof new Set().size === 'function') {
				// TODO: define size getter
			}
			if (typeof Set.prototype.values !== 'function') {
				// TODO: define values/keys/entries
			}
			if (typeof Set.prototype.forEach !== 'function') {
				// TODO: FF 24: define forEach
			}
		}
	}

	var OrigSet = typeof Set === 'function' ? Set : null;
	if (
		typeof Set !== 'function'
		|| !support.setCompliantConstructor()
	) {
		OrigSet = getPolyfill();
		replaceGlobal(OrigSet);
	}

	// modify the built-in Set, which may be replaced above already:

	var OrigSet$prototype = OrigSet.prototype;
	var OrigSet$add = OrigSet$prototype.add;
	var OrigSet$has = OrigSet$prototype.has;
	var OrigSet$delete = OrigSet$prototype['delete'];

	if (!support.setUsesSameValueZero()) {
		define(OrigSet.prototype, {
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
		define(OrigSet.prototype, {
			add: function add(v) {
				Call(OrigSet$add, this, [v]);
				return this;
			}
		}, { add: force });
	}

	if (!support.setKeysIsValues()) {
		define(OrigSet.prototype, { keys: OrigSet.prototype.values }, { keys: force });
	}

	if (!support.setHasCorrectName()) {
		define(OrigSet.prototype, {
			has: function has(v) {
				return Call(OrigSet$has, this, v);
			}
		}, { has: force });
	}

	if (Object.getPrototypeOf) {
		// Shim incomplete iterator implementations.
		addIterator(Object.getPrototypeOf(new OrigSet().values()));
	}

	return OrigSet;
};
