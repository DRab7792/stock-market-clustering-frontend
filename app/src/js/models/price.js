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

    	props.symbol = (data.Symbol) ? data.Symbol : '';   

    	props.date = (data.Date) ? data.Date : '';   

    	props.open = (data.Open) ? parseFloat(data.Open) : 0;

    	props.high = (data.High) ? parseFloat(data.High) : 0;

    	props.low = (data.Low) ? parseFloat(data.Low) : 0;

    	props.close = (data.Close) ? parseFloat(data.Close) : 0;   

    	props.volume = (data.Volume) ? parseInt(data.Volume) : 0;   

		self.attributes = props;   	

    	return self;
    },

    getAverage: function(){
    	var self = this;

    	if (self.get("high") && self.get("low")){
    		return (self.get("high") + self.get("low")) / 2;
    	}else{
    		return null;
    	}
    },

    getStdDeviations: function(mean, stdDev){
        var self = this;

        var avg = self.getAverage();

        var diff = mean - avg;

        return diff / stdDev;
    }
});

module.exports = Price;