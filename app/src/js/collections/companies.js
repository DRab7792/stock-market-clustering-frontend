var Backbone = require('backbone'),
	config = require('../config'),
	async = require('async'),
	Company = require('../models/company'),
	_ = require('underscore');

var companies = Backbone.Collection.extend({
	model: function(){
		return Company;
	},
	initialize: function(options){
		this.options = options || {};
	},
	fetchAll: function(data, callback){
		var self = this;
		
		var companyList = require('../../data/directory.json');

		var modules = _.map(companyList, function(cur){
			var filename = config.app.dataUrl + cur + ".json";

			return filename;
		});

		async.each(modules, function(cur, done){
			$.ajax({
				url: cur,
				dataType: 'json',
				method: 'GET',
				success: function(res){
					var company = new Company();

					company.parse(res);

					self.add(company);

					return done();
				},
				error: function(xhr, status, error){
					return done(status);
				}
			});
		}, function(err){
			if (err){
				console.log("Error loading data for companies", err);
				return callback(err);
			}

			return callback();
		});
	},
});

module.exports = companies;