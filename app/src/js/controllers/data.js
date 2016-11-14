var CompanyCollection = require('../collections/companies'),
	request = require('request'),
	async = require('async'),
	company = require('../models/company');

var DataController = function(options){
	this.app = options.app;	
	this.companies = [];
};

DataController.prototype.initialLoad = function(callback){
	var self = this,
		callbackIn = (callback) ? callback : function(){};

	//Make calls for pages, wp options and tex files
	async.series([
		function(done){
			self.loadCompanies(function(err){
				return done(err);
			});
		}
	], function(err){
		if (err){
			console.log("Error loading wordpress pages", err);
			return callbackIn(err);
		}

		return callbackIn();
	});
};

DataController.prototype.loadCompanies = function(callback){
	var self = this,
	callbackIn = (callback) ? callback : function(){};

	self.companies = new CompanyCollection();

	this.companies.fetch({}, function(){
		return callbackIn();
	});
};

module.exports = DataController;