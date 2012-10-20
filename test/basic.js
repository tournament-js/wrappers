var tap = require('tap')
  , test = tap.test
  , $ = require('../');

test("memoize", function (t) {
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

  t.end();
});


test("once", function (t) {
  var res = 0;
  var inc = $.once(function () {
    res += 1;
    return res;
  });
  t.equal(inc(), 1, "once inc works on first call");
  t.equal(res, 1, "once inc works on first call, modified");
  t.equal(inc(), 1, "once inc returned old result on second call");
  t.equal(res, 1, "once inc second call ignored");
  t.end();
});

test("allow", function (t) {
  var count = 0;
  var inc = $.allow(function () { count++; }, 2);
  inc();
  t.equal(count, 1, "twice inc works on fst call");
  inc();
  t.equal(count, 2, "twice inc works on snd call");
  inc();
  t.equal(count, 2, "twice inc failed on trd call");
  t.end();
});


test("after", function (t) {
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
  t.end();
});


test("throttle", function (t) {
  t.plan(6);

  var counter = 0;
  var inc = $.throttle(function () { counter++; }, 100);
  inc(); inc(); inc(); // do one of these, then one at 100ms

  setTimeout(inc, 190); // dead period of 90ms => do next one at 200ms
  setTimeout(inc, 210); // dead period of 10ms => do next one at 300ms
  setTimeout(inc, 420); // do this immediately

  var check = function (timePoint, expected) {
    setTimeout(function () {
      t.equal(counter, expected, "inc " + timePoint + "ms");
    }, timePoint);
  };

  check(10, 1);  // after 3 first spam calls
  check(110, 2); // spam calls should trigger another at ~100
  check(210, 3); // call at 190ms should kick in at ~200
  check(310, 4); // call at 210ms should kick in at ~300
  check(410, 4); // nothing between 300->400 nothing should have happened
  check(430, 5); // call at 420 should happen immediately
});

test("repeat", function (t) {
  t.plan(3);
  var counter = 0;
  var fiveInc = $.repeat(function () { counter++; }, 5, 20);

  var check = function (timePoint, expected) {
    setTimeout(function () {
      t.equal(counter, expected, "inc " + timePoint + "ms");
    }, timePoint);
  };

  check(10, 0); // nothing has been called yet
  setTimeout(fiveInc, 50);
  check(180, 5);
  setTimeout(fiveInc, 200);
  setTimeout(fiveInc, 200);
  setTimeout(fiveInc, 201);
  check(320, 20);
});


test("delay", function (t) {
  t.plan(3);

  var counter = 0;
  var inc = $.delay(function () { counter++; }, 100);

  t.equal(counter, 0, "function untouched by constructions");
  setTimeout(function () {
    t.equal(counter, 0, "delayed construct does not set timer");
    inc();
  }, 110);

  setTimeout(function () {
    t.equal(counter, 1, "but 100ms after call it works");
  }, 220);
});


test("defer", function (t) {
  t.plan(2);
  var run = false;
  var defRun = $.defer(function (){ run = true; });
  defRun();
  t.ok(!run, "deferred run has not yet run");
  setTimeout(function () {
    t.ok(run, "deferred has run now");
  }, 0);
});

test("repeat", function (t) {
  t.plan(3);
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
  }, 2400);
});

test("wrap", function (t) {
  t.plan(4);
  var wrapper = function (inner, arg1, arg2) {
    t.equal(arg1, 5, "arg1 got passed through");
    t.equal(arg2, "woo", "arg2 got passed through");
    inner(arg1, arg2); // has to pass on data
  };

  var fn = $.wrap(function (a, b) {
    t.equal(a, 5, "arg1 got passed through twice");
    t.equal(b, "woo", "arg2 got passed through twice");
  }, wrapper);

  fn(5, "woo");
});

test("intercept", function (t) {
  t.plan(4);
  var interceptor = function (arg1, arg2) {
    t.equal(arg1, 5, "arg1 got passed through");
    t.equal(arg2, "woo", "arg2 got passed through");
    // does not have to pass on data
  };

  var fn = $.intercept(function (a, b) {
    t.equal(a, 5, "arg1 got passed through twice");
    t.equal(b, "woo", "arg2 got passed through twice");
  }, interceptor);

  fn(5, "woo");
});
