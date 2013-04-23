var trace = require("./trace")


/*
Abstract base class for all ERPs
*/
function RandomPrimitive() {}

RandomPrimitive.prototype.sample_impl = function ERP_sample_impl(params)
{
	throw new Error("ERP subclasses must implement sample_impl!")
}

RandomPrimitive.prototype.logprob = function ERP_logprob(val, params)
{
	throw new Error("ERP subclasses must implement logprob!")
}

RandomPrimitive.prototype.sample = function ERP_sample(params, isStructural, conditionedValue)
{
	// The '+ 0' is there in case V8 ever implements tail call optimization
	return trace.lookupVariableValue(this, params, isStructural, 2, conditionedValue) + 0
}

RandomPrimitive.prototype.proposal = function ERP_proposal(currval, params)
{
	// Subclasses can override to do more efficient things
	return this.sample_impl(params)
}

RandomPrimitive.prototype.logProposalProb = function ERP_logProposalProb(currval, propval, params)
{
	// Subclasses can override to do more efficient things
	return this.logprob(propval, params)
}


///////////////////////////////////////////////////////////////////////////////


function FlipRandomPrimitive() {}
FlipRandomPrimitive.prototype = Object.create(RandomPrimitive.prototype)

FlipRandomPrimitive.prototype.sample_impl = function Flip_samle_impl(params)
{
	return (Math.random() < params[0])
}

FlipRandomPrimitive.prototype.logprob = function Flip_logprob(val, params)
{
	return Math.log(val ? params[0] : 1-params[0])
}

FlipRandomPrimitive.prototype.proposal = function Flip_proposal(currval, params)
{
	return !currval
}

FlipRandomPrimitive.prototype.logProposalProb = function Flip_logProposalProb(currval, propval, params)
{
	return 0
}

var flipInst = new FlipRandomPrimitive()
var flip = trace.prob(function flip(p, isStructural, conditionedValue)
{
	p = (p == undefined) ? 0.5 : p
	return flipInst.sample([p], isStructural, conditionedValue) + 0
})


///////////////////////////////////////////////////////////////////////////////

module.exports = 
{
	flip: flip
}