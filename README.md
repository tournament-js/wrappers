# Wrappers
[![Build Status](https://secure.travis-ci.org/clux/wrappers.png)](http://travis-ci.org/clux/wrappers)
[![Dependency Status](https://david-dm.org/clux/wrappers.png)](https://david-dm.org/clux/wrappers)
[![unstable](http://hughsk.github.io/stability-badges/dist/unstable.svg)](http://nodejs.org/api/documentation.html#documentation_stability_index)

Wrappers is a small library exporting basic wrapper functions for functions.

## Usage
Attach it to the short variable of choice:

```javascript
var w = require('wrappers');
```

then get some cheap extra funcitonality out of your functions with standard wrappers:

```javascript
var safeInit = w.once(init); // invokes wrapped init function at most once
var tracedFn = w.trace(buggyFn); // logs input and output when called
var rateLimited = w.throttle(cpuHeavyFn, 200); // triggers at most every 200ms
var burstTrigger = w.repeat(w.repeat(fire, 5, 50), 3, 1000); // bursts of 5 every second 3 times
```

Read the [API](https://github.com/clux/wrappers/blob/master/api.md).

This module used to be included in functional utility library [interlude](https://github.com/clux/interlude), but is now an extra.

## Installation

```bash
$ npm install wrappers
```

## Running tests
Install development dependencies

```bash
$ npm install
```

Run the tests

```bash
$ npm test
```

## License
MIT-Licensed. See LICENSE file for details.
