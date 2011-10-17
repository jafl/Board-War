var connector_half_width = 0.05;

function squareId(
	/* int */ x,
	/* int */ y)
{
	return '(' + x + ',' + y + ')';
}

function createSquares(
	/* array */ data)
{
	var layout = data.shift();

	var m = /^([0-9]+)x([0-9]+)(\s+wrap)?$/.exec(layout);
	if (!m || !m.length)
	{
		console.log('unsupported board layout: %s', layout);
		process.exit(1);
	}

	var w = parseInt(m[1], 10);
	var h = parseInt(m[2], 10);

	if (m[3])
	{
		var wrap = true;
	}

	if (wrap)
	{
		console.log('wrapped board is not yet supported');
		process.exit(1);
	}

	var board = [];

	// squares

	for (var x=0; x<w; x++)
	{
		for (var y=0; y<h; y++)
		{
			board.push(
			{
				type: 'square',
				id:   squareId(x,y),
				x:    x,
				y:    y,
				w:    1,
				h:    1
			});
		}
	}

	// horizontal connectors

	for (var x=1; x<w; x++)
	{
		for (var y=0; y<h; y++)
		{
			board.push(
			{
				type:    'connector',
				x:       x - connector_half_width,
				y:       y - 2*connector_half_width,
				w:       2*connector_half_width,
				h:       1 + 4*connector_half_width,
				squares: [ squareId(x-1,y), squareId(x,y) ]
			});
		}
	}

	// vertical connectors

	for (var x=0; x<w; x++)
	{
		for (var y=1; y<h; y++)
		{
			board.push(
			{
				type:    'connector',
				x:       x - 2*connector_half_width,
				y:       y - connector_half_width,
				w:       1 + 4*connector_half_width,
				h:       2*connector_half_width,
				squares: [ squareId(x,y-1), squareId(x,y) ]
			});
		}
	}

	return board;
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
