var YUI = require('yui3').YUI;
YUI().use('json', function(Y)
{

var util = require('./util.js');

var game_cull_interval = 24 * 3600 * 1000;	// 1 day (ms)

var game_count = 0;

exports.init = function(
	/* map */ config)
{
	var games = {};

	setInterval(function()
	{
		var limit = new Date().getTime() - game_cull_interval;
		var dead  = [];
		Y.each(games, function(g, id)
		{
			if (g.ping.getTime() < limit)
			{
				dead.push(id);
			}
		});

		Y.each(dead, function(id)
		{
			console.log('game %s cancelled', id);
			delete games[id];
			game_count--;
		});
	},
	3600 * 1000);	// 1 hour (ms)

	return games;
};

exports.configureSocket = function(
	/* socket */	socket,
	/* map */		game_config,
	/* map */		games,
	/* map */		ctx)
{
	socket.on('game:init', function(id)
	{
		ctx.game_id = id;
		if (!ctx.game_id && game_count < game_config.max_games)
		{
			ctx.game_id = util.guid();
			games[ ctx.game_id ] =
			{
				start:  new Date(),
				ping:   new Date(),
				player: {}
			};
			game_count++;

			ctx.player_id = util.guid();	// so we know it's admin

			console.log('game %s started', ctx.game_id);
		}
		else if (!ctx.game_id)
		{
			console.log('rejected connection because server already has %d games', game_config.max_games);
			socket.emit('game:server-full');
			return;
		}

		ctx.game = games[ ctx.game_id ];
		if (!ctx.game)
		{
			socket.emit('game:end');
			socket.disconnect();
			return;
		}

		socket.emit('game:init', ctx.game_id);
	});

	socket.on('game:hello', function(name, id)
	{
		if (!ctx.game)
		{
			socket.emit('game:end');
			socket.disconnect();
			return;
		}

		ctx.game.ping = new Date();

		var admin = false, rejoin = false;
		if (id && ctx.game.player[id])
		{
			ctx.player_id     = id;
			ctx.player        = ctx.game.player[ ctx.player_id ];
			ctx.player.socket = socket;
			admin             = ctx.player.admin;
			rejoin            = true;
		}
		else
		{
			if (ctx.player_id)
			{
				admin = true;
			}
			else
			{
				ctx.player_id = util.guid();
			}

			ctx.player = ctx.game.player[ ctx.player_id ] =
			{
				name:   name,
				admin:  admin,
				socket: socket
			};
		}

		console.log('player "%s" %sconnected%s to game %s', ctx.player.name, rejoin ? 're-' : '', admin ? ' as admin' : '', ctx.game_id);
		socket.emit('game:welcome', ctx.player_id, admin, ctx.game.running);

		socket.broadcast.emit('game:new-player',
		{
			id:    ctx.player_id,
			name:  ctx.player.name,
			admin: ctx.player.admin
		});

		if (rejoin)
		{
			Y.each(ctx.game.player, function(p, id)
			{
				if (id != ctx.player_id)
				{
					socket.emit('game:new-player',
					{
						id:    id,
						name:  p.name,
						admin: p.admin
					});
				}
			});
		}
	});

	socket.on('game:delete-player', function(id)
	{
		if (ctx.game && ctx.game.player[id])
		{
			console.log('player "%s" ejected from game %s', ctx.game.player[id].name, ctx.game_id);
			ctx.game.player[id].socket.emit('game:end');
			delete ctx.game.player[id];

			socket.broadcast.emit('game:delete-player', id);
		}
	});

	socket.on('game:start', function()
	{
		console.log('game %s started', ctx.game_id);
		ctx.game.running = true;
		socket.broadcast.emit('game:start');
	});

	socket.on('game:end', function()
	{
		if (ctx.game)
		{
			console.log('game %s ended', ctx.game_id);
			delete games[ ctx.game_id ];
			game_count--;

			Y.each(ctx.game.player, function(p)
			{
				p.socket.emit('game:end');
			});
		}
	});

	socket.on('disconnect', function(id)
	{
		if (ctx.game)
		{
			var count = 0;
			Y.each(ctx.game.player, function(p)
			{
				count++;
			});

			if (count === 0)
			{
				console.log('game %s cancelled', ctx.game_id);
				delete games[ ctx.game_id ];
				game_count--;
			}
		}
	});
};

});
