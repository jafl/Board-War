var crypto = require('crypto');

exports.guid = function()
{
	var h = crypto.createHash('md5');
	h.update(new Date().getTime().toString());
	h.update(Math.random().toString());
	return h.digest('hex');
};
