# es-set <sup>[![Version Badge][npm-version-svg]][package-url]</sup>

[![dependency status][deps-svg]][deps-url]
[![dev dependency status][dev-deps-svg]][dev-deps-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]

[![npm badge][npm-badge-png]][package-url]

An ESnext spec-compliant `Set` shim/polyfill/replacement that works as far down as ES3.

This package implements the [es-shim API](https://github.com/es-shims/api) interface. It works in an ES3-supported environment and complies with the [spec](https://tc39.es/ecma262/#sec-set-objects).

## Getting started

```sh
npm install --save es-set
```

## Usage/Examples

```js
var set = new Set();
var obj = {};

set.add(obj);

set.has(obj); // true
map.has(3); // false
```

## Tests
Simply clone the repo, `npm install`, and run `npm test`

[package-url]: https://npmjs.org/package/es-shims/es-set
[npm-version-svg]: https://versionbadg.es/es-shims/es-set.svg
[deps-svg]: https://david-dm.org/es-shims/es-set.svg
[deps-url]: https://david-dm.org/es-shims/es-set
[dev-deps-svg]: https://david-dm.org/es-shims/es-set/dev-status.svg
[dev-deps-url]: https://david-dm.org/es-shims/es-set#info=devDependencies
[npm-badge-png]: https://nodei.co/npm/es-shims/es-set.png?downloads=true&stars=true
[license-image]: https://img.shields.io/npm/l/es-shims/es-set.svg
[license-url]: LICENSE
[downloads-image]: https://img.shields.io/npm/dm/es-shims/es-set.svg
[downloads-url]: https://npm-stat.com/charts.html?package=es-shims/es-set
