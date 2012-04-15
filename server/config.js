var YUI = require('yui').YUI;
YUI({useSync: true}).use('oop', function(Y) {
"use strict";

var fs    = require('fs'),
	board = require('./board.js');

function raw_string(
	/* string */ name,
	/* string */ data)
{
	var m = new RegExp('^' + name + '\\s*:\\s*(.*)$', 'm').exec(data);
	if (m && m.length)
	{
		return m[1];
	}
}

function string(
	/* string */ name,
	/* string */ data)
{
	return raw_string(name, data) || '';
}

function number(
	/* string */	name,
	/* string */	data,
	/* int */		default_value)
{
	var s = raw_string(name, data);
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
	var config = {};

	// game

	var data = fs.readFileSync(path + '/game', 'utf-8');

	config.title     = string('title', data);
	config.home_url  = string('homeURL', data) || 'https://github.com/jafl/Board-War';
	config.max_games = number('maxGames', data, 10);

	// player

	data = fs.readFileSync(path + '/player', 'utf-8');

	config.min_players = number('min', data, 2);
	config.max_players = number('max', data, 8);

	// board

	data = Y.Lang.trim(fs.readFileSync(path + '/board', 'utf-8')).split(/\s*%%\s*/);

	config.board      = board.create(data[0].split('\n'));
	config.board_code = data[1];

	// styling

	config.css = fs.readFileSync(path + '/style.css', 'utf-8')

	// images -- send using data: format

	config.images = [];

	Y.each(fs.readdirSync(path + '/img'), function(name)
	{
		var m = /\.([^.]+)$/.exec(name);
		if (m && m.length)
		{
			config.images.push(
			{
				name: name,
				data: 'data:image/' + m[1] + ';base64,' +
						fs.readFileSync(path + '/img/' + name).toString('base64')
			});
		}
	});

	return config;
};

});
