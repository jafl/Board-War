"use strict";

var mod_os      = require('os'),
	mod_express = require('express');

exports.createServer = function(
	/* int */	port,
	/* map */	game_config,
	/* map */	games,
	/* bool */	debug)
{
	var app = mod_express.createServer();

	app.use(mod_express.cookieParser());
	app.use(mod_express.static(__dirname + '/../client'));
	app.set('view options', { layout: false });

	app.get('/', function(req, res)
	{
		var game_id   = req.param('game_id') || req.cookies.boardwar_game_id;
		var player_id = req.cookies.boardwar_player_id;

		if (!games[game_id])
		{
			game_id = '';
		}

		res.render('boardwar.hbs',
		{
			host:        debug ? 'localhost' : mod_os.hostname(),
			port:        port,
			title:       game_config.title,
			game_id:     game_id,
			player_id:   game_id && player_id,
			player_name: game_id && games[ game_id ] && games[ game_id ].player[ player_id ] && games[ game_id ].player[ player_id ].name,
			home_url:    game_config.home_url,
			css:         game_config.css,
			img:         game_config.images
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
