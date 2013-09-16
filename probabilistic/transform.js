var esprima = require("esprima")
var escodegen = require("escodegen")
var estraverse = require("escodegen/node_modules/estraverse")


// Add a string format method
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

var replcode = "(function() {__pr.enterfn({0}); var x = __p_REPLACEME_p__; __pr.leavefn(); return x; })()"

function makeWrappedCallReplacer(callNode)
{
	var replacer = 
	{
		enter: function(node)
		{
			if (node.type == estraverse.Syntax.Identifier &&
				node.name == "__p_REPLACEME_p__")
			{
				return callNode
			}
			return node
		}
	}
	return replacer
}

var nextid = 0
var callWrapper = 
{
	enter: function(node)
	{
		if (node.skip) return estraverse.VisitorOption.Skip;
		if (node.type == estraverse.Syntax.CallExpression)
		{
			var replacer = makeWrappedCallReplacer(node)
			var wrapast = esprima.parse(replcode.format(nextid)).body[0].expression
			nextid++
			wrapast.callee.skip = true
			estraverse.replace(wrapast, replacer)
			return wrapast
		}
		return node
	}
}


/*
Transform a string of code by the above two transformations
*/
function probTransform(codeString)
{
	var ast = esprima.parse(codeString)
	estraverse.replace(ast, callWrapper)
	var preamble = "var __pr = null\ntry {\n\t__pr = require('probabilistic/index')\n} catch (e) {\n\t__pr = require('./probabilistic/index')\n}\n"
	return preamble + escodegen.generate(ast)
}


module.exports =
{
	probTransform: probTransform
}