# Wrappers API
Wrappers export function wrappers, i.e. functions to call on your functions; to return
slightly modified or extended versions of your function. All methods exported herein
return new functions intended to be used as before, but with added benefits.

## Timer Based Procedure Wrappers
### $.delay(wait, f) :: g
Delays the execution of a call by `wait` milliseconds from the execution of the wrapped
function. Remaining arguments will be forwarded to the `f` when the timer runs out.

````javascript
var slowLog = $.delay(2000, console.log);
slowLog(2, "second late world");
console.log("hello ...");
// hello ...
// 2 'second late world'
````

### $.defer(f) :: g
Shortcut for `delay` with zero timeout, deferring the function call
until the current call stack has cleared.

### $.debounce(f, wait [, leading]) :: g
Creates and returns a [debounced](http://en.wikipedia.com/debounce)
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

### $.throttle(wait, f) :: g
Rate limits a function to be called at most once every `waitMs` milliseconds.
Unlike many other throttling functions, this obeys the waiting time exactly and ends
up doing less work for it. TODO: perf verify this obviousness

### $.repeat(times, wait, f) :: g
Returns a burst fire version of the function `f`. Upon invocation it calls
`setInterval` with `wait` delay between each call, counts the times called,
then clears the timer once the number has been reached.

## Numeric Limitation Wrappers
### $.once(f) :: g
Allows a function to be called at most once. Repeating calls to the wrapped function
will not call the underlying function, but simply return the old result.

````javascript
var initCar = $.once(startEngines);
initCar(); // starts engines
initCar(); // does nothing
````

### $.after(times, f) :: g
Returned function will call only after `times` calls to the wrapped function.
Useful in flow control when waiting for a set of asynchronous success callbacks to finish.
Rather than maintaining the counter inside the business logic; call the wrapped function
at each callback.

````javascript
var buildDone = $.after(targets.length, startTests)
targets.forEach(function (target) {
  child_process.execFile('make', [target].concat(flags), {}, buildDone);
});
// buildDone is called after each child_process build is done
// the final call to buildDone will call startTests
````

### $.allow(times, f) :: g
Like `after`, but here only the first `times` calls will work. In other words
`$.allow(n, $.after(n, f))` will work exactly once on the nth call.

## Debug Wrappers
### $.wrap(f, wrapper) :: g
Wraps `f` in a custom wrapper. The created function will call the `wrapper` function
with (f, argsAry) and can do with these things what it wishes. If it
returns f.apply(this, args) then the wrapper will be unobtrusive.

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

### $.trace(f [, log]) :: g
Passes the sliced arguments array, and the result of the wrapped function to the `log`
function (or console.log if omitted) as argument 1 and 2 respectively, then returns the
result of the function call. Allows for quick debugging of argument flow without
having to insert logs at both ends of a function; rather wrap the function at creation:

````javascript
var procedure = $.trace(function (a, b) {
  // ...
  return 5;
});
procedure(2, "hi");
// (2, "hi") -> 5
````
