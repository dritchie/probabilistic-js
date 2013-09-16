var fs = require("fs")
var path = require("path")
var transform = require("probabilistic/transform")
var browserify = require("browserify")

if (require.main === module)
{
	var usage = "usage: node p.js [-c] srcfile"

	var numargs = process.argv.length
	if (numargs < 3 || numargs > 4 || (numargs == 4 && process.argv[2] != "-c"))
	{
		console.log(usage)
	}

	var srcfile
	if (numargs == 3)
		srcfile = process.argv[2]
	else
		srcfile = process.argv[3]
	srcfile = fs.realpathSync(srcfile)
	var keepCompiledCode = (numargs === 4)

	// Flatten module dependency graph using browserify
	var b = browserify()
	b.add(srcfile)
	// Node asynchronous callback nonsense...
	function browserifyDone(err, src)
	{
		// Run probTransform for callsite naming
		src = transform.probTransform(src)

		console.log(src)

		// Write this "compiled" code to a '.p.js' file
		var compiledfile = path.join(path.dirname(srcfile), path.basename(srcfile).replace(".js", ".p.js"))
		fs.writeFileSync(compiledfile, src)

		// 'require' the compiled code file to run it
		require(compiledfile)

		// If the user gave us the -p option, keep the compiled code around.
		// Otehrwise, delete it.
		if (!keepCompiledCode)
			fs.unlink(compiledfile)
	}
	var bundlestream = b.bundle({},browserifyDone)
}


// TODO: node package file that specifies all the dependencies.