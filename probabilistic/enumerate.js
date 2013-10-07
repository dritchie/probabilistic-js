var trace = require("./trace")
var util = require("./util")


/*
Enumerate through random choices in the program.
Assumes: 
    all random choice have an iteration method that iterates over thier (finite) domain, returning special symbol when end of domain is reached.
    random choice names are always returned in evauation order.
Returns a discrete distribution (the marginal on return values).
*/

function enumerate(computation) {
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
    trace.initEnumerate = true
	var currentTrace = trace.newTrace(computation, false) //no rejectionInit

    
//    while the first ERP hasn't rolled over, increment, update, score
    while() {
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
                v.val == v.erp.nextVal(null) //get first in domain
            } else {
                v.val = newval
            }
        }
        // accumulate this ret/prob in marginal:
        currTrace.traceUpdate()
        addElt(currTrace.returnValue, returnValue.logprob)
    }
    
    trace.initEnumerate = false
}



module.exports =
{
enumerate: enumerate
}
