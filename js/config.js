var YUI = require('yui3').YUI;
YUI().use('json', function(Y)
{

var fs    = require('fs'),
	board = require('./board.js');

function string(
	/* string */ name,
	/* string */ data)
{
	var m = new RegExp('^' + name + '\\s*:\\s*(.*)$', 'm').exec(data);
	if (m && m.length)
	{
		return m[1];
	}
}

function number(
	/* string */	name,
	/* string */	data,
	/* int */		default_value)
{
	var s = string(name, data);
	if (!Y.Lang.isUndefined(s))
	{
		return parseInt(s, 10);
	}
	else
	{
		return default_value;
	}
}

exports.load = function(
	/* string */ path)
{
	var config =
	{
		max_games: 10
	};

	// game

	var data = fs.readFileSync(path + '/game', 'utf-8');

	config.title = string('title', data);

	// player

	try
	{
		data = fs.readFileSync(path + '/player', 'utf-8');
	}
	catch (ex)
	{
		data = '';
	}

	config.min_players = number('min', data, 2);
	config.max_players = number('max', data, 8);

	// board

	data = Y.Lang.trim(fs.readFileSync(path + '/board', 'utf-8')).split('\n');

	config.board = board.create(data);
	{
		
	};

	return config;
};

});
