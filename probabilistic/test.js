var util = require("./util")
util.openModule(util)
var pr = require("./init")
util.openModule(pr)

var samples = 150
var lag = 20
var runs = 5
var errorTolerance = 0.07

function test(name, estimates, trueExpectation, tolerance)
{
	tolerance = (tolerance === undefined ? errorTolerance : tolerance)
	process.stdout.write("test: " + name + "...")
	var errors = estimates.map(function(est) { return Math.abs(est - trueExpectation) })
	var meanAbsError = mean(errors)
	if (meanAbsError > tolerance)
		console.log("failed! True mean: " + trueExpectation + " | Test mean: " + mean(estimates))
	else
		console.log("passed.")
}

function mhtest(name, computation, trueExpectation, tolerance)
{
	tolerance = (tolerance === undefined ? errorTolerance : tolerance)
	test(name, repeat(runs, function() { return expectation(computation, traceMH, samples, lag) }), trueExpectation, tolerance)
}

// function larjtest...

function eqtest(name, estvalues, truevalues, tolerance)
{
	tolerance = (tolerance === undefined ? errorTolerance : tolerance)
	process.stdout.write("test: " + name + "...")
	if (estvalues.length !== truevalues.length) throw new Error("lengths must be equal!")
	for (var i = 0; i < estvalues.length; i++)
	{
		var estv = estvalues[i]
		var truev = truevalues[i]
		if (Math.abs(estv - truev) > tolerance)
		{
			console.log("failed! True value: " + truev + " | Test value: " + estv)
			return
		}
	}
	console.log("passed.")
}

///////////////////////////////////////////////////////////////////////////////

console.log("starting tests...")


/*
ERP Tests
*/

test(
	"flip sample",
	repeat(runs, function() { return mean(repeat(samples, function() { return flip(0.7) }))}),
	0.7)

mhtest(
	"flip query",
	prob(function() { return flip(0.7) }),
	0.7)