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

ApiHandler.prototype.getVisuals = function(callback){
	var url = config.app.wpApiUrl + "/wp/v2/visuals-api",
		callback = callback || function(){};

	request(url, function(err, res){
		if (err){
			return callback(err);
		}

		var data = JSON.parse(res.body);
		return callback(null, data);
	});
}

module.exports = ApiHandler;