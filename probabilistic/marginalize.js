
//this file provides a utility for marginalizing a function.
//it caches the marginal for each argument set, thus providing a simple dynamic programming construct.
//note that because a marginal is created, this acts as a query boundary for any free random variables or constraints within the function.

var erp = require("./erp")
var inference = require("./inference")
var trace = require("./trace")

function MarginalRandomPrimitive(fn) {
    this.fn = fn
    this.cache = {}
}

//why create an object to assign the primitive? instead of just assigning the primitive?
MarginalRandomPrimitive.prototype = Object.create(erp.RandomPrimitive.prototype)

//this is going to work ok, because traceUpdate is written properly to that it sets asside current trace state and reinstates it when done, hence nesting will do the right thing...
MarginalRandomPrimitive.prototype.getDist = function getDist(args) {

    var stringedargs = JSON.stringify(args) //stringify to use as key. needed?
    
    if(!(stringedargs in this.cache)) {
        console.log("Making marginal for args " + stringedargs)
        
        var dist = {}
        var fn = this.fn
        var computation = trace.prob( function computation(){return fn.apply(this, args)} )
        
        var samps = inference.traceMH(computation, 100, 1) //TODO: which inference fn..? may want rejection or enumeration sometimes.
        for(i in samps)
        {
            var v = samps[i].sample
            if(dist[v] == undefined){dist[v]={}; dist[v].prob=0; dist[v].val=v}
            dist[v].prob = dist[v].prob + 1
        }
        for(v in dist)
        {
            dist[v].prob /= samps.length
        }
        
        //console.log(" Marginal is " + JSON.stringify(hist))
        
        this.cache[stringedargs] = dist
    }
    return this.cache[stringedargs]
}


MarginalRandomPrimitive.prototype.sample_impl = function Marginal_sample_impl(params)
{
    //note: assumes dist is normalized.
    var dist = this.getDist(params)
    var x = Math.random()
    var accum = 0
    for(v in dist)
    {
        accum += dist[v].prob            //could store the CDF to avoid this sum.
        if(accum>=x) {return dist[v].val}
    }
}

MarginalRandomPrimitive.prototype.logprob = function Marginal_logprob(val, params)
{
    //note: assumes dist is normalized.
    var dist = this.getDist(params)
    if(dist[val] == undefined) {return -Infinity}
	return Math.log(dist[val].prob)
}


//assume fn is a function to be marginalized..
//returns an ERP that computes and caches marginals of the original function.
marginalize = function marginalize(fn)
{
    var marginalInt = new MarginalRandomPrimitive(fn)
    
    return trace.prob(function marginal(arg)
                      {
                      //should cast arguments to Array?
                      //might want ability to make it conditioned or structural...
                      return marginalInt.sample(arguments)
                      })
}



///////////////////////////////////////////////////////////////////////////////


module.exports =
{
marginalize: marginalize
}





