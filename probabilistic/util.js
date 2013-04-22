
function openModule(mod)
{
	for (var prop in mod)
	{
		if (mod.hasOwnProperty(prop))
		{
			global[prop] = mod[prop]
		}
	}
}

module.exports = 
{
	openModule: openModule
}