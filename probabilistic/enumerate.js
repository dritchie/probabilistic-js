var trace = require("./trace")
var util = require("./util")


/*
Enumerate through random choices in the program.
Assumes: 
    all random choice have an iteration method that iterates over thier (finite) domain, returning special symbol when end of domain is reached.
    random choice names are always returned in evauation order.
Returns a discrete distribution (the marginal on return values).
*/

function enumerateDist(computation) {
    var dist = {}
    function addElt(val, logprob) {
        var stringrep = JSON.stringify(val)
        if (!dist[stringrep]) {
            dist[stringrep]={}
            dist[stringrep].val = val
            dist[stringrep].prob = 0
        }
        dist[stringrep].prob += Math.exp(logprob)
    }
    
//    initialize at start of domain for each ERP:
    trace.startEnumerate()
	var currTrace = trace.newTrace(computation, false) //no rejectionInit
    currTrace.traceUpdate()
    if (currTrace.conditionsSatisfied) addElt(currTrace.returnValue, currTrace.logprob)
    //FIXME: does this score include conditions?
    
//    console.log(currTrace.vars)

    
//    while the first ERP hasn't rolled over, increment, update, score
    while (true) {
        var names = currTrace.freeVarNames() //FIXME: check order
        var newval = null
        while (newval == null) {
            // if we are out of names it means we're done enumerating:
            if (names.length == 0) {return dist}
            
            //otherwise get next var and increment:
            var varname = names.pop()
            var v = currTrace.getRecord(varname)
            var newval = v.erp.nextVal(v.val)
            if (newval == null) {
                v.val = v.erp.nextVal(null) //get first in domain
            } else {
                v.val = newval
            }
            v.logprob = v.erp.logprob(v.val, v.params)
        }
        // accumulate this ret/prob in marginal:
        currTrace.traceUpdate()
        if (currTrace.conditionsSatisfied) addElt(currTrace.returnValue, currTrace.logprob)
//        console.log(currTrace.vars)

    }
    
    trace.stopEnumerate()
}





module.exports =
{
enumerateDist: enumerateDist
}
