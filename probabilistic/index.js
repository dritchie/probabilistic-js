var trace = require("./trace")
var erp = require("./erp")
var control = require("./control")
var inference = require("./inference")
var memoize = require("./memoize")


module.exports = {}

// Forward trace exports
for (var prop in trace)
	module.exports[prop] = trace[prop]

// Forward erp exports
for (var prop in erp)
	module.exports[prop] = erp[prop]

// Forward control exports
for (var prop in control)
	module.exports[prop] = control[prop]

// Forward inference exports
for (var prop in inference)
	module.exports[prop] = inference[prop]

// FOrward memoize exports
for (var prop in memoize)
	module.exports[prop] = memoize[prop]