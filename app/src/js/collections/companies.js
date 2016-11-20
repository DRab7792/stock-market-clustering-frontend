var Backbone = require('backbone'),
	config = require('../config'),
	async = require('async'),
	config = require('../config'),
	Company = require('../models/company'),
	_ = require('underscore');

var companies = Backbone.Collection.extend({
	states: {
		EMPTY: 0,
		LOADED: 1,
		RANGES: 2
	},
	variances: [],
	ranges: {},
	state: null,
	model: function(){
		return Company;
	},
	initialize: function(options){
		this.state = this.states.EMPTY;
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

			self.state = self.states.LOADED;

			return callback();
		});
	},
	getStdDevVariances: function(){
		var self = this;

		var dates = _.map(self.models[0].get("stockPrices").models, function(cur){
			return cur.get("date");
		});

		dates = dates.splice(config.app.movingAvgWindow);
	
		var num = 0, ranges = {};
		_.each(dates, function(curDate){
			var sum = 0, max = -10, min = 10;

			//Calculate the range
			_.each(self.models, function(curCompany){
				if (!curCompany.get("stockPrices")) return;
				var prices = curCompany.get("stockPrices");
				var companyDev = prices.dates[curDate.format("YYYY-MM-DD")];

				if (companyDev < min){
					min = companyDev;
				}
				if (companyDev > max){
					max = companyDev;
				}
			});

			ranges[curDate.format("YYYY-MM-DD")] = (max - min); //sumSqrd / (num - 1);
		});

		self.ranges = ranges;

		self.state = self.states.RANGES;

		return self.ranges;
	}
});

module.exports = companies;