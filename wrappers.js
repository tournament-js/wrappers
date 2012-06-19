var slice = Array.prototype.slice
  , $ = {};

var id = function (x) {
  return x;
};
// ---------------------------------------------
// Function Wrappers
// ---------------------------------------------

// Memoize an expensive function by storing its results in a proper hash.
$.memoize = function (fn, hasher) {
  var memo = Object.create(null);
  hasher = hasher || id; // simplistic default hash fn stores first argument as the memo key
  return function () {
    var key = hasher.apply(this, arguments);
    if (!(key in memo)) {
      memo[key] = fn.apply(this, arguments);
    }
    return memo[key];
  };
};

$.once = function (fn) {
  var done = false, result;
  return function () {
    if (!done) {
      done = true;
      result = fn.apply(this, arguments);
    }
    return result;
  };
};

$.after = function (times, fn) {
  return function () {
    if (--times < 1) {
      return fn.apply(this, arguments);
    }
  };
};

//$.allow? like once but for n > 1

$.delay = function (delay, fn) {
  var args = slice.call(arguments, 2);
  return setTimeout(function () {
    return fn.apply(null, args);
  }, delay);
};


$.debounce = function (fn, wait, immediate) {
  var timeout;
  return function () {
    var context = this, args = arguments;
    if (immediate && !timeout) fn.apply(context, args);
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      timeout = null;
      if (!immediate) fn.apply(context, args);
    }, wait);
  };
};

$.throttle = function (wait, fn) {
  var context, args, timeout, nextWait, result
    , last = Date.now() - wait; // first one should start immediately

  return function () {
    context = this;
    args = arguments;
    nextWait = Math.min(wait, Math.max(wait - (Date.now() - last), 0));
    if (!nextWait) {
      result = fn.apply(context, args)
      last = Date.now();
    } else if (!timeout) {
      timeout = setTimeout(function () {
        timeout = null;
        fn.apply(context, args);
        last = Date.now();
      }, nextWait);
    }
    return result;
  };
};

//$.forever/every as setInterval?


// debug function, wrap it in a function reporting its scope and arguments
// particularly useful when combined with $.iterate
$.trace = function (fn, log) {
  log = log || console.log;
  return function () {
    var result = fn.apply(this, arguments);
    log('(' + slice.call(arguments, 0).join(', ') + ') -> ', result);
    return result;
  };
};

$.traceBy = function (fn, via) {
  return function () {
    var result = fn.apply(this, arguments);
    via(slice.call(arguments, 0), result);
    return result;
  };
};

// _.wrap, passes to a callback of form (fn, args..)
// can log arguments and return, but should return fn.apply(args) to work unobtrusively
$.wrap = function (fn, wrapper) {
  return function () {
    return wrapper.apply(this, [fn].concat(slice.call(arguments, 0)));
  };
};




// unsure about these
/*

// guard a function by a condition function
// returns a function that will only apply f(x) if cond(x) is true
$.guard = function (fn, cond) {
  return function (x) {
    return (cond(x)) ? fn(x) : null;
  };
};

// var guardedFibonacci = $.guard(fibonacci, lt(100));

// $.either null guard a function, else return errorFn result
// if errorFn is a logger, then curry it with the required message
$.either = function (guardedFn, errorFn) {
  return function (x) {
    var result = guardedFn(x);
    return (result === null) ? errorFn(x) : result;
  };
};

// var errorMsg;
// var cpuSafeFibonacci = $.either(guardedFibonacci, $.constant(errorMsg));
// or
// var cpuSafeFibonaci = $.either(guardedFibonacci, $.curry(console.log, errorMsg))
*/

//TODO: throttle, debounce

module.exports = $;
