'use strict';

var ToString = require('es-abstract/2020/ToString');
var Type = require('es-abstract/2020/Type');
var IsArray = require('es-abstract/2020/IsArray');
var IsCallable = require('es-abstract/2020/IsCallable');
var IteratorStep = require('es-abstract/2020/IteratorStep');
var IteratorClose = require('es-abstract/2020/IteratorClose');
var Call = require('es-abstract/2020/Call');
var GetIntrinsic = require('es-abstract/GetIntrinsic');
var callBound = require('es-abstract/helpers/callBound');
var callBind = require('es-abstract/helpers/callBind');
var GetIterator = require('es-get-iterator');

var MapShim = require('es-map/implementation');

var $mapForEach = callBind(MapShim.prototype.forEach);
var $slice = callBound('%String.prototype.slice%');
var $Number = GetIntrinsic('%Number%');

var isSet = require('./validation').isSet;

var SET_ITEM = {};
exports.SET_ITEM = SET_ITEM;

exports.fastkey = function fastkey(key) {
	switch (Type(key)) {
		case 'String': return '$' + key;
		case 'Null':
		case 'Undefined':
		case 'Boolean':
			return ToString(key);
		case 'Number':
			/*
			 * We prefix numbers with n because some engines (eg, old Chrome)
			 * only preserve insertion order for string keys
			 */
			return 'n' + key;
		default: return null;
	}
};

var decodeKey = function decodeKey(k) {
	if (k === 'null') {
		return null;
	} else if (k === 'undefined') {
		return undefined;
	} else if (k === 'true') {
		return true;
	} else if (k === 'false') {
		return false;
	} else if (k[0] === '$') {
		return $slice(k, 1);
	} else {
		// k[0] is 'n'
		return $Number($slice(k, 1));
	}
};

var iterateStorage = function iterateStorage(storage, fn) {
	// eslint-disable-next-line no-restricted-syntax
	for (var fkey in storage) {
		/*
		 * We set the value to SET_ITEM instead of using hasOwnProperty,
		 * so that we don't rely on an hasOwnProperty polyfill.
		 */
		if (storage[fkey] === SET_ITEM) {
			fn(fkey);
		}
	}
};
exports.iterateStorage = iterateStorage;

var ensureSet = function ensureSet(set) {
	if (!set['[[setData]]']) {
		var m = new MapShim();
		iterateStorage(set['[[storage]]'], function (fkey) {
			var k = decodeKey(fkey);
			m.set(k, k);
		});
		// eslint-disable-next-line no-param-reassign
		set['[[setData]]'] = m;
	}
	// eslint-disable-next-line no-param-reassign
	set['[[storage]]'] = null; // free old backing storage
};
exports.ensureSet = ensureSet;

var forEach = function forEach(set, fn, context) {
	ensureSet(set);

	$mapForEach(set['[[setData]]'], function (value, key) {
		if (typeof context === 'undefined') {
			fn(key, key, set);
		} else {
			Call(fn, context, [key, key, set]);
		}
	});
};
exports.forEach = forEach;

exports.addIterableToSet = function addIterableToSet(set, iterable) {
	if (IsArray(iterable) || Type(iterable) === 'String') {
		for (var i = 0; i < iterable.length; i++) {
			set.add(iterable[i]);
		}
	} else if (isSet(iterable)) {
		forEach(iterable, function (value) {
			set.add(value);
		});
	} else {
		var iter, adder;
		if (Type(iterable) !== 'Null' && Type(iterable) !== 'Undefined') {
			adder = set.add;
			if (!IsCallable(adder)) {
				throw new TypeError('bad set');
			}
			iter = GetIterator(iterable);
		}
		if (typeof iter === 'undefined') {
			throw new TypeError('Object is not iterable');
		}

		var next;
		while ((next = IteratorStep(iter))) {
			try {
				Call(adder, set, [next.value]);
			} catch (e) {
				IteratorClose(iter, true);
				throw e;
			}
		}
	}
};
