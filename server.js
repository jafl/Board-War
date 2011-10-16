var YUI = require('yui3').YUI;
YUI().use('json', function(Y)
{

if (process.argv.length < 3)
{
	console.log('usage: node server.js path-to-game-config [-p port] [-d]');
	process.exit(1);
}

var mod_config = require('./js/config.js');

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

var game_config = mod_config.load(config_path);

// games

var mod_game = require('./js/game.js');
var games    = mod_game.init(game_config);

// server

var mod_server = require('./js/server.js');
var app        = mod_server.createServer(port, game_config, games, debug);

// sockets

var sio = require('socket.io'),
	io  = sio.listen(app);

io.set('log level', 1);

io.sockets.on('connection', function(socket)
{
	var ctx = {};

	mod_game.configureSocket(socket, game_config, games, ctx);
});

});
