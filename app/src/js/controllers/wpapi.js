var WPAPI = require('wpapi'),
	request = require('request'),
	config = require('../config.js');

var ApiHandler = function(options){
	this.options = options || {};

	this.rest = new WPAPI({
		endpoint: config.app.wpApiUrl
	});
};

ApiHandler.prototype.getOptions = function(callback){
	var url = config.app.optionsUrl,
		callback = callback || function(){};

	request(url, function(err, res){
		if (err){
			return callback(err);
		}

		var options = JSON.parse(res.body);
		return callback(null, options);
	});
}

module.exports = ApiHandler;