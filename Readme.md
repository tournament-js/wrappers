# Wrappers ![travis build status](https://secure.travis-ci.org/clux/wrappers.png)
Wrappers is a small library exporting basic wrapper functions for functions.

## Usage
Attach it to the short variable of choice:

````javascript
var $ = require('wrappers');
````

then get some cheap extra funcitonality out of your functions with standard wrappers:

```javascript
var safeInit = $.once(init); // invokes wrapped init function at most once
var cpuSafeFib = $.guard(fibonacci, $.lt(500)); // guards on condition <500
var buggyTraced = $.trace(buggyFunction); // logs input and output while calling
var rateLimitedF = $.throttle(cpuHeavyF, 200); // triggers at most every 200ms
var burstTrigger = $.repeat($.repeat(fire, 5, 50), 3, 1000); // bursts of 5 every second 3 times
````

Read the [API](https://github.com/clux/wrappers/blob/master/api.md).
Note this module can be gotten directly as is, or gotten via the larger utility library: [interlude](https://github.com/clux/interlude) for which it was made.

## Installation

````bash
$ npm install wrappers
````

## Running tests
Install development dependencies

````bash
$ npm install
````

Run the tests

````bash
$ npm test
````

## License
MIT-Licensed. See LICENSE file for details.
