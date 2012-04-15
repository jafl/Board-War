var mod_crypto = require('crypto');

exports.guid = function()
{
	var h = mod_crypto.createHash('md5');
	h.update(new Date().getTime().toString());
	h.update(Math.random().toString());
	return h.digest('hex');
};
