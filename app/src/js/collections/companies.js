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
	name: '',
	description: '',
	variances: [],
	ranges: {},
	state: null,
	center: null,
	id: null,
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

		//Get the json files
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
	getStdDevRanges: function(){
		var self = this;

		//Get all the dates
		if (
			!self.models.length || 
			!self.models[0].get("stockPrices")
		){
			return console.log("No models found");
		}
		var dates = _.map(self.models[0].get("stockPrices").models, function(cur){
			return cur.get("date");
		});

		dates = dates.splice(config.app.movingAvgWindow);
	
		var num = 0, ranges = {}, prevVal = 0;
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

			//TODO - better fix for this error
			if (max - min === 0){
				ranges[curDate.format("YYYY-MM-DD")] = prevVal;
			}else{
				ranges[curDate.format("YYYY-MM-DD")] = (max - min);
				prevVal = max - min;
			}
		});

		self.ranges = ranges;

		self.state = self.states.RANGES;

		return self.ranges;
	},
	prepCompanyAttributes: function(){
		var self = this;

		//Get the most recent attribute for all companies
		_.each(self.models, function(curComp){
			curComp.getMostRecentAttributes();
		});

		//Get the mean value for each attribute
		var means = {}, nums = {};
		_.each(self.models, function(curComp){
			var curAttributes = curComp.get("preppedAttributes");

			_.each(Object.keys(curAttributes), function(curLabel){
				var curVal = curAttributes[curLabel];

				//Update number of vals for each attribute
				if (nums[curLabel]){
					nums[curLabel]++;	
				}else{
					nums[curLabel] = 1;
				}
				

				//Keep rolling mean update
				if (!means[curLabel]){
					means[curLabel] = curVal;
				}else{
					means[curLabel] = (means[curLabel] * (nums[curLabel] - 1) / nums[curLabel]) + (curVal / nums[curLabel]);
					
				}
			});
		});

		//Send the means to the companies for those with missing attributes
		_.each(self.models, function(curComp){
			curComp.prepAttributes(means);
		});
	}
});

module.exports = companies;