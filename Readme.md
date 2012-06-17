# Wrappers ![travis build status](https://secure.travis-ci.org/clux/wrappers.png)
Wrappers is a small library exporting basic wrapper functions for functions.

## Usage
Attach it to the short variable of choice:

````javascript
var $ = require('wrappers');
````

then wrap your functions:

```javascript
var safeInit = $.once(init);
safeInit(); // calls init
safeInit(); // returns old result, does nothing
````

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
