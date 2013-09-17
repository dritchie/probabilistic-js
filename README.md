probabilistic-js
================

Turning Javascript into a probabilistic programming language.

probabilistic-js works via _source code transformation_: you write probabilistic code in `.pjs` files which are transformed into plain-old deterministic Javascript in `.js` files before being executed. For example:

	node bin/p.js [-p] ./probcode.pjs

The `-p` option, if present, will keep around the transformed `.js` code, which can be useful for debugging in some cases. Take a look at `test.pjs` for some simple examples.

Programs written in probabilistic-js can also be run in the browser via [browserify](https://github.com/substack/node-browserify). The `webppl` directory contains the framework for a simple example (using the excellent [CodeMirror](http://codemirror.net/) widget). Just use the command:

	node node_modules/browserify/bin/cmd.js -r ./probabilistic/index > webppl/probabilistic.js

A running instance of this web demo can be found [here](http://graphics.stanford.edu/~dritchie/webppl).