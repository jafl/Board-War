function createSquares(
	/* array */ data)
{
	var layout = data.shift();

	var m = /^([0-9]+)x([0-9]+)$/.exec(layout);
	if (m && m.length)
	{
		var w = parseInt(m[1], 10);
		var h = parseInt(m[2], 10);
	}
	else
	{
		console.log('unsupported board layout: %s', layout);
		process.exit(1);
	}
}

exports.create = function(
	/* array */ data)
{
	var type = data.shift();

	if (type == 'square')
	{
		return createSquares(data);
	}
	else
	{
		console.log('unsupported board type: %s', type);
		process.exit(1);
	}
};
