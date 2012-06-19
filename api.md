# Wrappers API

### $.once(f) :: g
Allows a function to be called at most once. Repeating calls to the wrapped function
will not call the underlying function, but simply return the old result.

````javascript
var initCar = $.once(startEngines);
initCar(); // starts engines
initCar(); // does nothing
````

### $.after(times, f) :: g
Allows a function to be called only after `times` calls to the wrapped function.
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

### $.delay(delayMs, f [, args..]) :: g
Delays the execution of a call by `delayMs` milliseconds from the execution of the wrapped
function. Remaining arguments will be forwarded to the `f` when the timer runs out.

````javascript
$.delay(2000, console.log, "hello", 2, "second late world");
````

### $.throttle(waitMs, f) :: g
Rate limits a function to be called at most once every `waitMs` milliseconds.
Unlike many other throttling functions, this obeys the waiting time exactly.


### $.trace(f [, log]) :: g
Passes the sliced arguments array, and the result of the wrapped function to the `log`
function (or console.log if omitted) as argument 1 and 2 respectively, then returns the
result of the function call. Allows for quick debugging of argument flow without
having to insert logs at both ends of a function; rather wrap the function at creation:

````javascript
var longProcedure = $.trace(function () {
  // ...
});
````



