# Wrappers API
Wrappers export function wrappers, i.e. functions to call on your functions; to return
slightly modified or extended versions of your function. All methods exported herein
return new functions to be used as before, but with added benefits.

## Timer Based Flow Control
### $.delay(f, wait) :: g
A curried version of `setTimeout` waiting for the arguments of `f` only.
Delays the execution of a call by `wait` milliseconds from the execution of the wrapped
function. Remaining arguments will be forwarded to `f` when the timer runs out.

````javascript
var slowLog = $.delay(2000, console.log);
slowLog(2, "second late world");
console.log("hello ...");
// hello ...
// 2 'second late world'
````

### $.defer(f) :: g
Shortcut for `delay` with zero timeout, which defers the function call
until the current call stack has cleared.

### $.debounce(f, wait [, leading]) :: g
Creates and returns a [debounced](http://en.wiktionary.org/wiki/debounce)
version of the passed function that will postpone execution until wait
milliseconds have elapsed since the last invocation.
Useful for implementing behavior that should only happen after the input
has stopped arriving, like triggering a redraw after a bunch of resize events.

````javascript
$(handle).slider({slide: $.debounce(redrawUI, 200)});
````

Pass true for the optional `leading` parameter to cause debounce to trigger the
function on the leading intead of the trailing edge of the wait interval.
Useful in circumstances like preventing accidental double-clicks
on a "submit" button from firing a second time.

### $.throttle(f, wait) :: g
Rate limits a function to be called at most once every `waitMs` milliseconds.
Similar to `_.throttle`, but obeys the waiting time exactly, and ends
up doing a lot less function calls and setting a lot less timers for it.

### $.repeat(f, times, wait) :: g
Returns a repeating version of the function `f`. Upon invocation it calls
`setInterval` with `wait` delay between each call, counts the times called,
then clears the timer once the number has been reached.

````javascript
var count = 0;
var shootFive = $.repeat(function () { count++; }, 5, 200);
shootFive(); // in one second, count === 5
````

## Numeric Invocation Limiters
### $.once(f) :: g
Allows a function to be called at most once. Repeating calls to the wrapped function
will not call the underlying function, but simply return the old result.

````javascript
var initCar = $.once(startEngines);
initCar(); // starts engines
initCar(); // does nothing
````

### $.after(f, times) :: g
Returned function will call only after `times` calls to the wrapped function.
Useful in flow control when waiting for a set of asynchronous success callbacks to finish.
Rather than maintaining the counter inside the business logic; call the wrapped function
at each callback.

````javascript
var buildDone = $.after(startTests, targets.length);
targets.forEach(function (target) {
  child_process.execFile('make', [target].concat(flags), {}, buildDone);
});
// buildDone is called after each child_process build is done
// the final call to buildDone will call startTests
````

### $.allow(f, times) :: g
Like `after`, but here only the first `times` calls will work. In other words
`$.allow($.after(f, n), n)` will work only on the `n`-th call.

## Debug
### $.trace(f [, log]) :: g
Passes the sliced arguments array, and the result of the wrapped function to the `log`
function (or console.log if omitted) as argument 1 and 2 respectively, then returns the
result of the function call. Allows for quick debugging of argument flow without
having to insert logs at both ends of a function; rather wrap the function at creation:

````javascript
var f = $.trace(function (a, b) {
  return 5;
});
f(2, "hi"); // 5
// (2, "hi") -> 5
````

### $.intercept(f, interceptor) :: g
Intercept the arguments of `f`. This constructs a function `g` which will call
the `interceptor` with the same arguments as `g` right before calling `f`.

````javascript
var write = function () {
  fs.appendFile(logFile, slice.call(arguments, 0));
};
var plus2i = $.intercept($.plus2, write);
plus2i(2, 3); // appends: `[ 2, 3 ]` to logFile asynchronously
// 5
````

Note that the `plus2` function is available with [interlude](https://github.com/clux/interlude) only.

## Misc.
### $.wrap(f, wrapper) :: g
Wraps `f` in a custom wrapper. The created function will call the `wrapper` function with (f, argsAry) and can do with these things what it wishes. If `f` returns f.apply(this, args) then the wrapper will be unobtrusive.

````javascript
var wrapper = function (f, args) {
  console.log('procedure was called with', args.join(', '));
  return f.apply(this, args);
};
var wrapProc = $.wrap(procedure, wrapper);
wrapProc(); // logs then runs procedure as normal
````

Note that if you wanted to simply log everything going in and out of a function
it'd be easier to use `trace`.

### $.memoize(f [, hasher]) :: g
Memoizes a given function by caching the computed result.
Useful for speeding up slow-running computations.
If passed the optional hash function, this will be used to compute the hash key for
storing the result, based on the arguments to the original function.
The default hasher just uses the first argument to the memoized function as the key.
