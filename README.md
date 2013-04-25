probabilistic-js
================

Turning V8 Javascript into a probabilistic programming language.

V8's CallSite API (which I used for tracking execution traces) unfortunately doesn't provide a way to get a lexically-unique id for a function (i.e. an id for the function's code). Getting around this requires all function declarations/expressions that will be used in probabilistic programs to be wrapped in a decorator function `prob`. You can do this yourself, or you can use the utilities in `probabilistic/transform.js` to perform automatic source code transformation.