var trace = require("./trace")
var util = require("./util")


/*
 MCMC kernel that moves individual ERP draws in a non-reversible way, following Suwa-Todo algroithm.
 */


function infill(probs) {
    //build the infills: starting with the biggest prob val, distribute it's mass over the following states, decrementing remaining targetprobs as we go.
    var infill = probs.slice()
    var numprobs = probs.length
    var startInd = probs.indexOf(Math.max.apply(null,probs))
    var transition = []
    for(var i=startInd; i<startInd+numprobs; i++) {
        var sourcebin = i%numprobs
        transition[sourcebin]=[]
        for(var j=0; j<numprobs; j++) {transition[sourcebin][j] = 0} //is there a better way to init array to 0s?
        var source = probs[sourcebin]
        var bin=sourcebin
        while(source>1e-12) {
            bin= (bin+1)%numprobs
            //put as much or source into next bin as will fit..
            var fill = Math.min(source, infill[bin])
            source -= fill
            infill[bin] -= fill
            transition[sourcebin][bin]=fill
        }
    }
    return transition
}


function STKernel()
{
	this.proposalsMade = 0
	this.proposalsAccepted = 0
}

STKernel.prototype.next = function STKernel_next(trace) {
    this.proposalsMade += 1
    
    var trace = trace.deepcopy()
    var currNames = trace.freeVarNames(false, true) //NOTE: for now only make ST updates to non-structural, enumerable vars
    var name = util.randomChoice(currNames)
	var v = trace.getRecord(name)
    if(typeof v.erp.nextVal != 'function'){throw new Error("Oops, can't do ST update to non-enumerable variable.")}
    var origval = v.val
    
    //enumerate all the values of the chosen variable, score trace for each
    var vals = []
    var probs = []
    var val = v.erp.nextVal(null, v.params)
    while(val!=null) {
        vals.push(val)
        v.val = val
        v.logprob = v.erp.logprob(val, v.params)
        trace.traceUpdate(true)
        probs.push(trace.conditionsSatisfied?Math.exp(trace.logprob):0)
        val = v.erp.nextVal(val, v.params)
    }
    
    //normalize
    var n=0
    for(var i=0; i<probs.length; i++) {n+=probs[i]}
    for(var i=0; i<probs.length; i++) {probs[i]=probs[i]/n}
    
    //sample from the infill for the current value
    var transitions = infill(probs)
    var transition = transitions[vals.indexOf(origval)] //FIXME: duplicate vals will break this.
    var i = util.discreteChoice(transition)
    v.val = vals[i]
    v.logprob = v.erp.logprob(v.val, v.params)
    trace.traceUpdate(true) //cache instead of recomputing?
    
    return trace
}



module.exports =
{
STKernel: STKernel
}

