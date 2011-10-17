YUI.add('bw-admin', function(Y) {
"use strict";

Y.namespace('BW.Admin');

Y.BW.Admin.init = function(
	/* socket */	socket,
	/* map */		ctx)
{
	Y.one('#admin').setStyle('display', ctx.game.running ? 'none' : 'block');
	Y.one('#game-url').set('innerHTML', ctx.game.url);

	Y.on('click', function()
	{
		Y.one('#admin').setStyle('display', 'block');
	},
	'#show-admin');

	Y.on('click', function()
	{
		Y.one('#admin').setStyle('display', 'none');
	},
	'#hide-admin');

	Y.one('#copy-game-url')
		.plug(Y.ClipBoard, { moviepath: '/', page: Y.one('#admin-bd') })
		.on('clipboard:load', function()
		{
			this.on('mouseover', function()
			{
				this.setAttribute('copy', ctx.game.url);
			});

			this.clipboard.setEvent('click', function()
			{
				this.clipboard.hide();
			},
			true);
		});

	Y.delegate('click', function()
	{
		var id = this.get('id');
		socket.emit('game:delete-player', id.replace('remove-player-', ''));
		Y.one('#'+id).ancestor('li').remove();
	},
	'#admin-player-list', 'button');

	if (ctx.game.running)
	{
		Y.one('#start-game').setStyle('display', 'none');
	}
	else
	{
		Y.on('click', function()
		{
			socket.emit('game:start');
			Y.one('#start-game').setStyle('display', 'none');
			Y.one('#admin').setStyle('display', 'none');
		},
		'#start-game');
	}

	Y.on('click', function()
	{
		socket.emit('game:end');
	},
	'#end-game');
};

Y.BW.Admin.addPlayer = function(
	/* object */	p,
	/* map */		ctx)
{
	Y.one('#admin-player-list').append(Y.Lang.sub(ctx.admin_player_list_tmpl,
	{
		id:   p.id,
		name: p.name
	}));
}

}, '@VERSION@', {requires:['node-style', 'gallery-clipboard']});
