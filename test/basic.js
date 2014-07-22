var $ = require('../');

exports.memoize = function (t) {
  // not a great example, as fib could be super memoized manually
  // but it's still faster for same call..
  var fib = function (n) {
    return (n < 2) ? n : fib(n - 1) + fib(n - 2);
  };
  var fastFib = $.memoize(fib);
  t.equal(fib(10), fastFib(10), 'memoized fib 10');
  t.equal(fib(11), fastFib(11), 'memoized fib 11');

  var memo = Object.create(null);
  var hasher = function () {
    return Array.prototype.slice.call(arguments, 0).join('-');
  };
  // this fn is anti-memoization, second call returns null
  var onceReturn = function (x, y) {
    var key = hasher(x, y);
    memo[key] = (key in memo) ? null : x + y;
    return memo[key];
  };
  t.equal(onceReturn(2, 3), 5, "onceReturn works like called first time");
  t.equal(onceReturn(2, 3), null, "onceReturn again with same params => null");

  var memoReturn = $.memoize(onceReturn);
  t.equal(memoReturn(2, 4), 6, "memoReturn works first call");
  t.equal(memoReturn(2, 4), 6, "memoReturn returns memoized second time");
  t.equal(onceReturn(2, 4), null, "just to prove memoReturn called orig");

  t.done();
};


exports.once = function (t) {
  var res = 0;
  var inc = $.once(function () {
    res += 1;
    return res;
  });
  t.equal(inc(), 1, "once inc works on first call");
  t.equal(res, 1, "once inc works on first call, modified");
  t.equal(inc(), 1, "once inc returned old result on second call");
  t.equal(res, 1, "once inc second call ignored");
  t.done();
};

exports.allow = function (t) {
  var count = 0;
  var inc = $.allow(function () { count++; }, 2);
  inc();
  t.equal(count, 1, "twice inc works on fst call");
  inc();
  t.equal(count, 2, "twice inc works on snd call");
  inc();
  t.equal(count, 2, "twice inc failed on trd call");
  t.done();
};


exports.after = function (t) {
  var count = 0;
  var inc = $.after(function () { count ++; }, 3);
  inc();
  t.equal(count, 0, "inc after 1")
  inc();
  t.equal(count, 0, "inc after 2")
  inc();
  t.equal(count, 1, "inc after 3")
  inc();
  t.equal(count, 2, "inc after 4");
  t.done();
};

exports.throttle = function (t) {
  t.expect(6);

  var counter = 0;
  var inc = $.throttle(function () { counter++; }, 100);
  inc(); inc(); inc(); // do one of these, then one at 100ms

  setTimeout(inc, 190); // dead period of 90ms => do next one at 200ms
  setTimeout(inc, 210); // dead period of 10ms => do next one at 300ms
  setTimeout(inc, 420); // do this immediately

  var check = function (timePoint, expected) {
    setTimeout(function () {
      t.equal(counter, expected, "inc " + timePoint + "ms");
      if (expected === 5) {
        t.done(); // last check call
      }
    }, timePoint);
  };

  check(10, 1);  // after 3 first spam calls
  check(110, 2); // spam calls should trigger another at ~100
  check(210, 3); // call at 190ms should kick in at ~200
  check(310, 4); // call at 210ms should kick in at ~300
  check(410, 4); // nothing between 300->400 nothing should have happened
  check(430, 5); // call at 420 should happen immediately
};

exports.delay = function (t) {
  t.expect(3);

  var counter = 0;
  var inc = $.delay(function () { counter++; }, 100);

  t.equal(counter, 0, "function untouched by constructions");
  setTimeout(function () {
    t.equal(counter, 0, "delayed construct does not set timer");
    inc();
  }, 110);

  setTimeout(function () {
    t.equal(counter, 1, "but 100ms after call it works");
    t.done();
  }, 220);
};


exports.defer = function (t) {
  t.expect(2);
  var run = false;
  var defRun = $.defer(function (){ run = true; });
  defRun();
  t.ok(!run, "deferred run has not yet run");
  setTimeout(function () {
    t.ok(run, "deferred has run now");
    t.done();
  }, 0);
};

exports.repeat = function (t) {
  t.expect(3);
  var count = 0
  var burst = $.repeat(function() { count++ }, 5, 200);
  t.equal(count, 0, "nothing fired yet by repeat");
  burst();
  setTimeout(function () {
    t.equal(count, 5, "have shot 5 times");
    burst();
  }, 1200);

  setTimeout(function () {
    t.equal(count, 10, "have shot 5 times again");
    t.done();
  }, 2400);
};

exports.wrap = function (t) {
  t.expect(4);
  var wrapper = function (inner, arg1, arg2) {
    t.equal(arg1, 5, "arg1 got passed through");
    t.equal(arg2, "woo", "arg2 got passed through");
    inner(arg1, arg2); // has to pass on data
  };

  var fn = $.wrap(function (a, b) {
    t.equal(a, 5, "arg1 got passed through twice");
    t.equal(b, "woo", "arg2 got passed through twice");
    t.done();
  }, wrapper);

  fn(5, "woo");
};

exports.debounce = function (t) {
  var intervals = [10, 50, 100, 200, 300, 350, 530];
  t.expect(intervals.length + 1);
  var i = 0;
  var incr = $.debounce(function () { i++; }, 200);
  intervals.forEach(function (interval) {
    setTimeout(function () {
      incr();
      t.equal(i, 0, "i not incremented after " + interval + "ms");
      // keeps not being incremented because we keep calling it
      // with less than 20ms in between
    }, interval);
  });
  var wait = intervals.reduce(function (acc, e) {
    return acc + e;
  }, 0) + 200 + 10; // 200 after input stopped arriving (+ buffer)
  setTimeout(function () {
    t.equal(i, 1, "but incremented after (" + wait + "ms)");
    t.done();
  }, wait);
};

exports.trace = function (t) {
  var log = function (a) {
    t.equal(a, '(1, woo) -> hi', 'output');
    t.done();
  };
  var ctx = {
    o: 'yes',
    fn: $.trace(function (a, b) {
      t.equal(a, 1, 'a passed through');
      t.equal(b, "woo", 'b passed through');
      t.equal(this.o, 'yes', 'context correct');
      return 'hi';
    }, log)
  };
  ctx.fn(1, "woo");
};

exports.intercept = function (t) {
  t.expect(4);
  var interceptor = function (arg1, arg2) {
    t.equal(arg1, 5, "arg1 got passed through");
    t.equal(arg2, "woo", "arg2 got passed through");
    // does not have to pass on data
  };

  var fn = $.intercept(function (a, b) {
    t.equal(a, 5, "arg1 got passed through twice");
    t.equal(b, "woo", "arg2 got passed through twice");
    t.done();
  }, interceptor);

  fn(5, "woo");
};
