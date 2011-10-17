YUI.add('bw-board', function(Y) {
"use strict";

Y.namespace('BW.Board');

var canvas_max_size = 500;

Y.BW.Board.init = function(
	/* object */	board,
	/* map */		ctx)
{
	ctx.game.board = board;

	var w = 0, h = 0;
	Y.each(board, function(obj)
	{
		w = Math.max(w, obj.x + obj.w);
		h = Math.max(h, obj.y + obj.h);
	});

	var scale = Math.min(canvas_max_size/w, canvas_max_size/h);

	w = Math.ceil(w * scale);
	h = Math.ceil(h * scale);

	ctx.canvas =
	{
		node:  Y.Node.create('<canvas width="'+w+'" height="'+h+'"></canvas>'),
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

		c.set('strokeStyle', '#999');
		c.beginPath();
		c.moveTo(obj.x * s, obj.y * s);
		c.poly(
		[
			{ dx:  obj.w * s },
			{ dy:  obj.h * s },
			{ dx: -obj.w * s },
			{ dy: -obj.h * s }
		]);
		c.stroke();
	}
};

Y.BW.Board.render = function(
	/* map */ ctx)
{
	var board = ctx.game.board;

	Y.each(board, function(obj)
	{
		var f = draw[ obj.type ];
		if (f)
		{
			f(obj, ctx);
		}
	});
}

}, '@VERSION@', {requires:['node', 'gallery-canvas']});
