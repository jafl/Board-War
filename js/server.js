var os      = require('os'),
	express = require('express');

exports.createServer = function(
	/* int */	port,
	/* map */	game_config,
	/* map */	games,
	/* bool */	debug)
{
	var app = express.createServer();

	app.use(express.cookieParser());
	app.use(express.static(__dirname + '/../static'));

	app.get('/', function(req, res)
	{
		var game_id   = req.param('game_id') || req.cookies.boardwar_game_id;
		var player_id = req.cookies.boardwar_player_id;

		if (!games[game_id])
		{
			game_id = '';
		}

		res.render('client.ejs',
		{
			host:        debug ? 'localhost' : os.hostname(),
			port:        port,
			title:       game_config.title,
			game_id:     game_id,
			player_id:   game_id && player_id,
			player_name: game_id && games[ game_id ] && games[ game_id ].player[ player_id ] && games[ game_id ].player[ player_id ].name,
			layout:      false
		});
	});

	// recovery cookie

	app.get('/create-cookie', function(req, res)
	{
		res.cookie('boardwar_game_id', req.param('game_id'));
		res.cookie('boardwar_player_id', req.param('player_id'));
		res.json(null);
	});

	app.get('/clear-cookie', function(req, res)
	{
		res.clearCookie('boardwar_game_id');
		res.clearCookie('boardwar_player_id');
		res.json(null);
	});

	app.listen(port);
	return app;
};
