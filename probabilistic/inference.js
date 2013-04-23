var trace = require("./trace")
var util = require("./util")

/*
Compute the discrete distribution over the given computation
Only appropriate for computations that return a discrete value
(Variadic arguments are arguments to the sampling function)
*/
function distrib(computation, samplingFn)
{
	var args = Array.prototype.slice.apply(arguments)
	var hist = {}
	var samps = samplingFn.apply(this, [computation].concat(args.slice(2)))
	for (var i = 0; i < samps.length; i++)
	{
		var stringrep = JSON.stringify(samps[i].sample)
		var prevval = hist[stringrep] || 0
		hist[stringrep] = prevval + 1
	}
	for (var s in hist)
		hist[s] /= samps.length
	return hist
}

/*
Compute the mean of a set of values
*/
function mean(values)
{
	var m = values[0]
	var n = values.length
	for (var i = 1; i < n; i++)
		m += values[i]
	return m / n
}

/*
Compute the expected value of a computation
Only appropraite for computations whose return value is a number
*/
function expectation(computation, samplingFn)
{
	var args = Array.prototype.slice.apply(arguments)
	var samps = samplingFn.apply(this, [computation].concat(args.slice(2)))
	return mean(samps.map(function(s) { return s.sample }))
}

/*
Maximum a posteriori inference (returns the highest probability sample)
*/
function MAP(computation, samplingFn)
{
	var args = Array.prototype.slice.apply(arguments)
	var samps = samplingFn.apply(this, [computation].concat(args.slice(2)))
	var maxelem = {sample: null, logprob: -Infinity}
	var s = null
	for (var i = 0; i < samps.length; i++)
	{
		s = samps[i]
		if (s.logprob > maxelem.logprob)
			maxelem = s
	}
	return maxelem.sample
}

/*
Rejection sample a result from computation that satisfies all
conditioning expressions
*/
function rejectionSample(computation)
{
	var tr = trace.newTrace(computation)
	return tr.returnValue
}


/*
MCMC transition kernel that takes random walks by tweaking a
single variable at a time
*/
function RandomWalkKernel(structural, nonstructural)
{
	structural = (structural == undefined ? true : structural)
	nonstructural = (nonstructural == undefined ? true : nonstructural)
	this.structural = structural
	this.nonstructural = nonstructural
	this.proposalsMade = 0
	this.proposalsAccepted = 0
}

RandomWalkKernel.prototype.next = function RandomWalk_next(currTrace)
{
	this.proposalsMade += 1
	var name = util.randomChoice(currTrace.freeVarNames(this.structural, this.nonstructural))

	/*
	If we have no free random variables, then just run the computation
	and generate another sample (this may not actually be deterministic,
	in the case of nested query)
	*/
	if (!name)
	{
		currTrace.traceUpdate()
		return currTrace
	}
	/*
	Otherwise, make a proposal for a randomly-chosen variable, probabilistically
	accept it
	*/
	else
	{
		var retval = currTrace.proposeChange(name)
		var nextTrace = retval[0]; var fwdPropLP = retval[1]; var rvsPropLP = retval[2]
		fwdPropLP -= Math.log(currTrace.freeVarNames(this.structural, this.nonstructural).length)
		rvsPropLP -= Math.log(nextTrace.freeVarNames(this.structural, this.nonstructural).length)
		var acceptThresh = nextTrace.logprob - currTrace.logprob + rvsPropLP - fwdPropLP
		if (nextTrace.conditionsSatisfied && Math.log(Math.random()) < acceptThresh)
		{
			this.proposalsAccepted += 1
			return nextTrace
		}
		else
			return currTrace
	}
}

RandomWalkKernel.prototype.stats = function RandomWalk_stats()
{
	console.log("Acceptance ratio: " + this.proposalsAccepted/this.proposalsMade + " (" +
		this.proposalsAccepted + "/" + this.proposalsMade + ")")
}


/*
Do MCMC for 'numsamps' iterations using a given transition kernel
*/
function mcmc(computation, kernel, numsamps, lag, verbose)
{
	lag = (lag === undefined ? 1 : lag)
	var currentTrace = trace.newTrace(computation)
	var samps = []
	var iters = numsamps*lag
	for (var i = 0; i < iters; i++)
	{
		currentTrace = kernel.next(currentTrace)
		if (i % lag === 0)
			samps.push({sample: currentTrace.returnValue, logprob: currentTrace.logprob})
	}
	if (verbose)
		kernel.stats()
	return samps
}


/*
Sample from a probabilistic computation for some
number of iterations using single-variable-proposal
Metropolis-Hastings 
*/
function traceMH(computation, numsamps, lag, verbose)
{
	lag = (lag === undefined ? 1 : lag)
	return mcmc(computation, new RandomWalkKernel(), numsamps, lag, verbose)
}


module.exports = 
{
	distrib: distrib,
	mean: mean,
	expectation: expectation,
	MAP: MAP,
	rejectionSample: rejectionSample,
	traceMH: traceMH
}