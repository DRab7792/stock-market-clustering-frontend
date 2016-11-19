var Backbone = require('backbone'),
	_ = require('underscore'),
    moment = require('moment');

var Price = Backbone.Model.extend({
	defaults:{
		date: '',
		symbol: '',
		open: 0,
		high: 0,
		low: 0,
		close: 0,
		volume: 0,
        average: 0,
        stdDeviations: 0,
        smoothedStdDeviations: 0
	},

	initialize: function(options){
        this.options = options || {};
    },

    parse: function(data){
    	var self = this, props = {};

    	props.symbol = (data.Symbol) ? data.Symbol : '';   

    	props.date = (data.Date) ? moment(data.Date, "YYYY-MM-DD") : '';   

    	props.open = (data.Open) ? parseFloat(data.Open) : 0;

    	props.high = (data.High) ? parseFloat(data.High) : 0;

    	props.low = (data.Low) ? parseFloat(data.Low) : 0;

    	props.close = (data.Close) ? parseFloat(data.Close) : 0;   

    	props.volume = (data.Volume) ? parseInt(data.Volume) : 0;   

		self.attributes = props;   	

        self.getAverage();

    	return self;
    },

    getAverage: function(){
    	var self = this, average = 0;

    	if (self.get("high") && self.get("low")){
    		average = (self.get("high") + self.get("low")) / 2;
    	}

        self.set("average", average);

        return average;
    },

    getStdDeviations: function(mean, stdDev){
        var self = this;

        var avg = self.getAverage();

        var diff = mean - avg;

        var stdDevs = (diff / stdDev);

        self.set("stdDeviations", stdDevs);

        return stdDevs;
    },
    setSmoothedStdDeviations: function(smoothedVal){
        var self = this;

        self.set("smoothedStdDeviations", smoothedVal);

        return smoothedVal;
    }
});

module.exports = Price;