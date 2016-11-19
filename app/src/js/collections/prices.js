var Backbone = require('backbone'),
	Price = require('../models/price'),
	moment = require('moment'),
	config = require('../config'),
	_ = require('underscore');

var prices = Backbone.Collection.extend({
	mean: 0,
	stdDeviation: 0,
	model: function(){
		return new Price();
	},
	initialize: function(options){
		this.options = options || {};
	},
	comparator: function(a, b){
		// console.log(a.get("date").format());
		var a = a.get("date").unix();
		var b = b.get("date").unix();

		if (a < b){
			return -1;
		}else if (a > b){
			return 1;
		}else{
			return 0;
		}
	},
	parse: function(data){
		var self = this;
		
		_.each(data, function(cur){
			var curPrice = new Price();

			curPrice.parse(cur);

			self.add(curPrice);
		});

		//Sort prices by date
		self.sort();

		self.getMeanPrice();
		self.getStdDeviation();

		_.each(self.models, function(cur){
			cur.getStdDeviations(self.mean, self.stdDeviation);
		});

		self.getMovingMean();

		return self;
	},
	getStdDeviation: function(){
		var self = this;

		var mean = self.mean,
			sumSqrd = 0;

		//Calculate the sum squared
		_.each(self.models, function(cur){
			var x = cur.get("average");
			sumSqrd += (x - mean) * (x - mean);
		});

		var variance = sumSqrd / (self.models.length - 1);
		
		self.stdDeviation = Math.pow(variance, 0.5);
	},
	getMeanPrice: function(){
		var self = this;
		var sum = 0;

		//Sum of average prices for each day
		_.each(self.models, function(cur){
			sum += cur.get("average");
		});

		self.mean = (sum / self.models.length);
	},
	getMovingMean: function(){
		var self = this;

		//Use a 10 day moving average window
		var avgWindow = config.app.movingAvgWindow;

		//Start the calculations
		self.models.forEach(function(cur, i){
			//Before day 10
			if (i < avgWindow){
				cur.setSmoothedStdDeviations(0);
				return;
			}

			//Now calculate the average of the last 10 days
			var sum = 0, vals = 0;
			for (var n = (i - avgWindow); n <= i; n++) {
				sum += self.models[n].get("stdDeviations");
				vals++;
			}
			var mean = sum / vals;

			cur.setSmoothedStdDeviations(mean);
		});
	}
});

module.exports = prices;