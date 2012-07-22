var slice = Array.prototype.slice
  , $ = {};

var id = function (x) {
  return x;
};
// ---------------------------------------------
// Function Wrappers
// ---------------------------------------------

// numeric limitation wrappers
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

$.allow = function (fn, times) {
  return function () {
    if (times > 0) {
      times -= 1;
      return fn.apply(this, arguments);
    }
  };
};

$.after = function (fn, times) {
  return function () {
    times -= 1;
    if (times < 1) {
      return fn.apply(this, arguments);
    }
  };
};

// timer based wrappers
$.throttle = function (fn, wait) {
  var context, args, timeout, nextWait, result
    , last = Date.now() - wait; // first one should start immediately

  return function () {
    context = this;
    args = arguments;
    nextWait = Math.min(wait, Math.max(wait - (Date.now() - last), 0));
    if (!nextWait) {
      result = fn.apply(context, args);
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

$.repeat = function (fn, times, wait) {
  return function () {
    var args = arguments
      , context = this
      , count = 0;

    var intId = setInterval(function () {
      count += 1;
      if (count >= times) {
        clearInterval(intId);
      }
      fn.apply(context, args);
    }, wait);
  };
};

$.delay = function (fn, delay) {
  return function () {
    var context = this
      , args = arguments;
    setTimeout(function () {
      return fn.apply(context, args);
    }, delay);
  };
};

$.defer = function (fn) {
  return $.delay(fn, 0);
};

$.debounce = function (fn, wait, leading) {
  var timeout;
  return function () {
    var context = this
      , args = arguments;
    if (leading && !timeout) {
      fn.apply(context, args);
    }
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      timeout = null;
      if (!leading) {
        fn.apply(context, args);
      }
    }, wait);
  };
};

// debug wrappers
$.trace = function (fn, log) {
  log = log || console.log;
  return function () {
    var result = fn.apply(this, arguments);

    log('(' + slice.call(arguments, 0).join(', ') + ') -> ', result);
    return result;
  };
};

$.intercept = function (fn, interceptor) {
  return function () {
    interceptor.apply(this, arguments);
    return fn.apply(this, arguments);
  };
};

// misc. wrappers
$.memoize = function (fn, hasher) {
  var memo = Object.create(null);
  hasher = hasher || id;
  return function () {
    var key = hasher.apply(this, arguments);
    if (!(key in memo)) {
      memo[key] = fn.apply(this, arguments);
    }
    return memo[key];
  };
};

$.wrap = function (fn, wrapper) {
  return function () {
    return wrapper.apply(this, [fn].concat(slice.call(arguments, 0)));
  };
};

module.exports = $;
