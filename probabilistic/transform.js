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

var replcode = "(function() {__pr.enterfn({0}); var ret = __p_REPLACEME_p__; __pr.leavefn(); return ret; })()"

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
		if (!node.skip && node.type == estraverse.Syntax.CallExpression)
		{
			var replacer = makeWrappedCallReplacer(node)
			var wrapast = esprima.parse(replcode.format(nextid)).body[0].expression
			nextid++

			// We do NOT wrap the calls to enterfn, the fn itself, or leavefn
			wrapast.callee.body.body[0].expression.skip = true
			node.skip = true
			wrapast.callee.body.body[2].expression.skip = true

			estraverse.replace(wrapast, replacer)

			// OK, now we need to extract and evaluate any & all args to this call
			//   *before* passing them to the call. This is because if we leave it them
			//   inline, the order of evaluation might get messed up.
			// For example, if we have a function call as one of the args, then this call
			//   will see the id of the outer function call on the stack, which does not reflect
			//   the execution structure of the original program.
			var vardecls =
			{
				type: "VariableDeclaration",
				declarations: [],
				kind: "var"
			}
			for (var i = 0; i < node.arguments.length; i++)
			{
				var arg = node.arguments[i]
				var decl =
				{
					type: "VariableDeclaration",
					declarations:
					[{
						type: "VariableDeclarator",
						id: {type: "Identifier", name: "arg"+i},
						init: arg
					}],
					kind: "var"
				} 
				node.arguments[i] = {type: "Identifier", name: "arg"+i}
				wrapast.callee.body.body.splice(i, 0, decl)
			}

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
	var preamble = "var __pr = null\ntry {\n\t__pr = require('probabilistic/index')\n} catch (e) {\n\t__pr = require('./probabilistic/index')\n}\n__pr.openModule(__pr)\n"
	return preamble + escodegen.generate(ast)
}


module.exports =
{
	probTransform: probTransform
}

"var x = foo(1, bar(), 3)"