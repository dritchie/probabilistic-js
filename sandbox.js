var trace = require('./probabilistic/trace')
var util = require('./probabilistic/util')
util.openModule(trace)

function foo()
{
	//console.log(arguments.callee.caller.caller);
	//console.log(arguments.callee);
	//console.log(trace.getStack(0, 1)[0].getFunction().name)
	// var frameobj = trace.getStack(0, 1)[0]; var frameobj2 = trace.derp()
	// console.log(frameobj.getFileName())
	// console.log(frameobj.getLineNumber())
	// console.log(frameobj.getColumnNumber())
	// console.log(frameobj.pos)
	// console.log(frameobj2.pos)
}
foo = prob(foo)
foo = prob(foo)
console.log(foo.__probabilistic_lexical_id)