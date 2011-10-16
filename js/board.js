function createSquares(
	/* array */ data)
{
	var layout = data.shift();
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
