var YUI = require('yui3').YUI;
YUI().use('json', function(Y)
{

if (process.argv.length < 3)
{
	console.log('usage: node server.js path-to-game-config [-p port] [-d]');
	process.exit(1);
}

var os      = require('os'),
	express = require('express'),
	util    = require('./js/util.js');

// options

var config_path = process.argv[2],
	port        = 80,
	debug       = false;

for (var i=3; i<process.argv.length; i++)
{
	var s = process.argv[i];
	if (s == '-p')
	{
		i++;
		port = parseInt(process.argv[i], 10);
	}
	else if (s == '-d')
	{
		debug = true;
		require('long-stack-traces');
	}
}

// config

var game_config =
{
	title: 'Board War'
};

	// TODO: load config_path

// games

var games = {};

	// TODO: cull games older than 24 hours

// server

var app = express.createServer();

app.use(express.cookieParser());
app.use(express.static(__dirname + '/static'));

app.get('/', function(req, res)
{
	var game_id   = req.param('game_id') || req.cookies.boardwar_game_id;
	var player_id = req.cookies.boardwar_player_id;

	if (!games[game_id])
	{
		game_id = '';
	}

	res.render('board.ejs',
	{
		host:        os.hostname(),
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

// sockets

var sio = require('socket.io'),
	io  = sio.listen(app);

io.set('log level', 1);

io.sockets.on('connection', function(socket)
{
	var game_id, player_id, game, player;

	socket.on('init', function(id)
	{
		game_id = id;
		if (!game_id)
		{
			game_id = util.guid();
			games[ game_id ] =
			{
				start:  new Date(),
				ping:   new Date(),
				player: {}
			};

			player_id = util.guid();	// so we know it's admin

			console.log('game ' + game_id + ' started');
		}

		game = games[ game_id ];
		if (!game)
		{
			socket.emit('end-game');
			socket.disconnect();
			return;
		}

		socket.emit('init', game_id);
	});

	socket.on('hello', function(name, id)
	{
		if (!game)
		{
			socket.emit('end-game');
			socket.disconnect();
			return;
		}

		game.ping = new Date();

		var admin = false;
		if (id && game.player[id])
		{
			player_id     = id;
			player        = game.player[ player_id ];
			player.socket = socket;
			admin         = player.admin;
		}
		else
		{
			if (player_id)
			{
				admin = true;
			}
			else
			{
				player_id = util.guid();
			}

			player = game.player[ player_id ] =
			{
				name:   name,
				admin:  admin,
				socket: socket
			};
		}

		console.log('player "' + player.name + '" connected' + (admin ? ' as admin' : '') + ' to game ' + game_id);
		socket.emit('welcome', player_id, admin);
	});

	socket.on('delete-player', function(id)
	{
		if (game && game.player[id])
		{
			console.log('player "' + game.player[id].name + '" disconnected from game ' + game_id);
			delete game.player[id];
		}
	});

	socket.on('end-game', function()
	{
		if (game)
		{
			console.log('game ' + game_id + ' ended');
			delete games[ game_id ];

			Y.each(game.player, function(p)
			{
				p.socket.emit('end-game');
			});
		}
	});

	socket.on('disconnect', function(id)
	{
		if (game)
		{
			var count = 0;
			Y.each(game.player, function(p)
			{
				count++;
			});

			if (count === 0)
			{
				console.log('game ' + game_id + ' cancelled');
				delete games[ game_id ];
			}
		}
	});
});

});
