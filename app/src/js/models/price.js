var Backbone = require('backbone'),
	_ = require('underscore');

var Price = Backbone.Model.extend({
	defaults:{
		date: '',
		symbol: '',
		open: 0,
		high: 0,
		low: 0,
		close: 0,
		volume: 0
	},

	initialize: function(options){
        this.options = options || {};
    },

    parse: function(data){
    	var self = this, props = {};

    	props.symbol = (data.symbol) ? data.symbol : '';   

    	props.date = (data.date) ? data.date : '';   

    	props.open = (data.open) ? data.open : 0;

    	props.high = (data.high) ? data.high : 0;

    	props.low = (data.low) ? data.low : 0;

    	props.close = (data.close) ? data.close : 0;   

    	props.volume = (data.volume) ? data.volume : 0;   

		self.attributes = props;   	

    	return self;
    }
});

module.exports = Price;