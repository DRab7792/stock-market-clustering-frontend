var Backbone = require('backbone'),
	Price = require('../models/price'),
	_ = require('underscore');

var prices = Backbone.Collection.extend({
	model: function(){
		return new Price();
	},
	initialize: function(options){
		this.options = options || {};
	},
	parse: function(data){
		var self = this;
		
		_.each(data, function(cur){
			var curPrice = new Price();

			curPrice.parse(cur);

			self.add(curPrice);
		});

		self.getMeanPrice();
		self.getStdDeviation();

		return self;
	},
	getStdDeviation: function(){
		var self = this;

		var mean = self.mean,
			sumSqrd = 0;

		//Calculate the sum squared
		_.each(self.models, function(cur){
			var x = cur.getAverage();
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
			sum += cur.getAverage();
		});

		self.mean = (sum / self.models.length);
	}
});

module.exports = prices;