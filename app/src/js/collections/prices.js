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

		return self;
	},
});

module.exports = prices;