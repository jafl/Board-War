YUI.add('bw-game', function(Y) {
"use strict";

Y.namespace('BW.Game');

Y.BW.Game.configureSocket = function(
	/* socket */	socket,
	/* map */		ctx)
{
	socket.emit('game:init', ctx.game_id);

	socket.on('game:server-full', function()
	{
		alert('The server cannot host any more games at this time.  Please try again later.');
		window.location = ctx.home_url;
	});

	socket.on('game:init', function(id)
	{
		ctx.game_id = id;
		if (ctx.player_name)
		{
			socket.emit('game:hello', ctx.player_name, ctx.player_id);
			return;
		}

		Y.one('body').addClass('connect');

		var f = new Y.FormManager('connect_form');
		f.prepareForm();
		f.initFocus();

		Y.one('#connect-form').on('submit', function(e)
		{
			e.halt();
			if (f.validateForm())
			{
				socket.emit('game:hello', Y.one('#player-name').get('value'), ctx.player_id);
			}
		});
	});

	socket.on('game:welcome', function(id, _admin, running)
	{
		ctx.player_id    = id;
		ctx.admin        = _admin;
		ctx.game.url     = ctx.base_url + '?game_id=' + ctx.game_id;
		ctx.game.running = running;

		Y.io(ctx.base_url + 'create-cookie?game_id=' + ctx.game_id + '&player_id=' + ctx.player_id);

		Y.one('body').replaceClass('connect', ctx.admin ? 'admin' : 'player');
		if (ctx.admin)
		{
			Y.BW.Admin.init(socket, ctx);
		}
	});

	socket.on('game:board', function(board)
	{
		Y.BW.Board.init(board, ctx);
	});

	socket.on('game:new-player', function(p)
	{
		if (ctx.player[ p.id ])
		{
			return;
		}

		ctx.player[ p.id ] = p;
		if (ctx.admin)
		{
			Y.BW.Admin.addPlayer(p, ctx);
		}
	});

	socket.on('game:delete-player', function(id)
	{
		delete ctx.player[id];
	});

	socket.on('game:start', function()
	{
		ctx.game.running = true;
	});

	socket.on('game:end', function()
	{
		Y.io(ctx.base_url + 'clear-cookie',
		{
			on: { complete: function()
			{
				window.location = ctx.admin ? ctx.base_url : ctx.home_url;
			}}
		});
	});
};

}, '@VERSION@', {requires:['node', 'io', 'gallery-formmgr', 'bw-board', 'bw-admin']});
