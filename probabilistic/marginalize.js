
//this file provides a utility for marginalizing a function. it caches the marginal for each argument set, thus providing a simple dynamic programming construct.
//note that because a marginal is created, this acts as a query boundary for any free random variables or constraints within the function.

var erp = require("./erp")
var inference = require("./inference")

function MarginalRandomPrimitive(fn) {
    this.fn = fn
    this.cache = {}
}

//why create an object to assign the primitive? instead of just assigning the primitive?
MarginalRandomPrimitive.prototype = Object.create(RandomPrimitive.prototype)

//this is going to work ok, because traceUpdate is written properly to that it sets asside current trace state and reinstates it when done, hence nesting will do the right thing...
MarginalRandomPrimitive.prototype.getDist = function getDist(args) {
    //note: may need to convert args to string before using as key?
    //todo: need return dist to be values not stringified values.
    if(!(args in this.cache)) {
        this.cache[args] = distrib(function() {return this.fn(args)},
                                   traceMH, //todo which inference fn..?
                                   1000) 
    }
    return cache[args]
}


MarginalRandomPrimitive.prototype.sample_impl = function Marginal_sample_impl(params)
{
    //note: assumes dist is normalized.
    var dist = this.getDist(params)
    var x = Math.random()
    var accum = 0
    for(v in dist)
    {
        accum += dist[v]            //could store the CDF to avoid this sum.
        if(accum>=x) {return v}
    }
}

MarginalRandomPrimitive.prototype.logprob = function Marginal_logprob(val, params)
{
    //note: assumes dist is normalized.
    var dist = this.getDist(params)
    if(dist[val] == undefined) {return -Infinity}
	return Math.log(dist[val])
}


//assume fn is a function to be marginalized..
//returns an ERP that computes and caches marginals of the original function.
Marginalize = function Marginalize(fn)
{
    var marginalInt = new MarginalRandomPrimitive(fn)
    
    return trace.prob(function marginal(args, isStructural, conditionedValue)
                      {
                      //var args = Array.prototype.slice.apply(arguments) //...allow variadic args?
                      return marginalInt.sample(args, isStructural, conditionedValue)
                      })
}







