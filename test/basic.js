var tap = require('tap')
  , test = tap.test
  , $ = require('../');


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


test("after", function (t) {
  var count = 0;
  var inc = $.after(3, function () { count ++; });
  inc();
  t.equal(count, 0, "inc not called enough (1)")
  inc();
  t.equal(count, 0, "inc not called enough (2)")
  inc();
  t.equal(count, 1, "inc called enough (3)")
  inc();
  t.equal(count, 2, "inc called enough (4)");
  t.end();
});


test("throttle", function (t) {
  t.plan(4);

  var counter = 0;
  var inc = $.throttle(100, function () { counter++; });
  inc(); inc(); inc();
  $.delay(70, inc);
  // incr should happen at 100ms

  // dead period of 20ms
  $.delay(120, inc); // => do next one at 200ms

  // do next one at 300ms
  $.delay(210, inc);

  // do the next one at 400ms
  $.delay(390, inc);

  // do the next one immediately (after 500ms)
  $.delay(550, inc);


  var start = Date.now();
  $.delay(30, function () {
    t.equal(counter, 1, "inc 30ms");
  });
  $.delay(110, function () {
    t.equal(counter, 2, "inc 110ms");
  });
  $.delay(210, function () {
    t.equal(counter, 3, "inc 210ms");
  });
  $.delay(310, function () {
    t.equal(counter, 4, "incr 310ms");
  });
  $.delay(410, function () {
    t.equal(counter, 5, "incr 410ms");
  });
  $.delay(510, function () {
    t.equal(counter, 5, "incr 510ms");
  });
  $.delay(560, function () {
    t.equal(counter, 6, "incr 560ms");
  });
});
