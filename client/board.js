YUI.add('bw-board', function(Y) {
"use strict";

Y.namespace('BW.Board');

var canvas_max_size = 400;

Y.BW.Board.init = function(
	/* array */	data,
	/* map */	ctx)
{
	var board = ctx.game.board = data[0];
	if (data[1])
	{
		eval(data[1]);
	}

	var xmin = 0, xmax = 0, ymin = 0, ymax = 0;
	Y.each(board, function(obj)
	{
		xmin = Math.min(xmin, obj.x);
		xmax = Math.max(xmax, obj.x + obj.w);
		ymin = Math.min(ymin, obj.y);
		ymax = Math.max(ymax, obj.y + obj.h);
	});

	var scale = Math.min(canvas_max_size/(xmax-xmin), canvas_max_size/(ymax-ymin));

	var w = Math.ceil((xmax-xmin) * scale);
	var h = Math.ceil((ymax-ymin) * scale);

	ctx.canvas =
	{
		node:  Y.Node.create('<canvas width="'+w+'" height="'+h+'"></canvas>'),
		xoff:  Math.round(-xmin * scale),
		yoff:  Math.round(-ymin * scale),
		scale: scale
	};
	Y.one('#board').appendChild(ctx.canvas.node);

	ctx.canvas.context = new Y.Canvas.Context2d(ctx.canvas.node);

	Y.BW.Board.render(ctx);
}

var draw =
{
	square: function(obj, ctx)
	{
		var c = ctx.canvas.context;
		var s = ctx.canvas.scale;

		c.set('fillStyle', '#EEE');
		c.fillRect(obj.x * s, obj.y * s, obj.w * s, obj.h * s);

		c.set('strokeStyle', '#999');
		c.strokeRect(obj.x * s, obj.y * s, obj.w * s, obj.h * s);
	},

	boundary: function(obj, ctx)
	{
		var c = ctx.canvas.context;
		var s = ctx.canvas.scale;

		c.set('fillStyle', '#444');
		c.fillRect(obj.x * s, obj.y * s, obj.w * s, obj.h * s);
	}
};

Y.BW.Board.render = function(
	/* map */ ctx)
{
	var board = ctx.game.board;

	var c = ctx.canvas.context
	c.save();
	c.translate(ctx.canvas.xoff, ctx.canvas.yoff);

	Y.each(board, function(obj)
	{
		c.save();

		var f = draw[ obj.type ];
		if (f)
		{
			f(obj, ctx);
		}

		c.restore();
	});

	c.restore();
}

}, '@VERSION@', {requires:['node', 'gallery-canvas']});
