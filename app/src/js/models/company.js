var Backbone = require('backbone'),
	PriceCollection = require('../collections/prices'),
	_ = require('underscore');

var Company = Backbone.Model.extend({
	defaults:{
		name: '',
		id: null,
		symbol: null,
		category: {},
		attributes: {},
		clearbit_id: null,
		stockPrices: [],
		state: null,
		preppedAttributes: {},
		distances: [],
		cluster: {
			isCenter: false,
			distFromCenter: 0
		}	
	},
	states: {
		EMPTY: 0,
		LOADED: 1,
		PREPPED: 2,
		CLUSTERED: 3,
	},
	initialize: function(options){
		this.set("state", this.states.EMPTY);
        this.options = options || {};
    },

    parse: function(data){
    	var self = this, props = {};

    	props.name = (data.name_latest) ? data.name_latest : '';

    	props.id = (data.company_id) ? data.company_id : null;

		props.symbol = (data.symbol) ? data.symbol : '';    	

		props.attributes = (data.attributes) ? data.attributes : {};

		props.category = (data.category) ? data.category : {}; 

		if (data.stock_prices){
			props.stockPrices = new PriceCollection();

			props.stockPrices.parse(data.stock_prices);
		}

		self.attributes = props;   	

		this.set("state", this.states.LOADED);

    	return self;
    },
    getMostRecentAttributes: function(){
    	var self = this, attributes = self.get("attributes");

    	var adjAttributes = {}, years = ["2016", "2015", "2014", "2013", "2012", "2011", "2010"];

    	_.each(Object.keys(attributes), function(curLabel){
    		var cur = attributes[curLabel], recent = null;

    		_.each(years, function(curYear){
    			if (!recent && cur[curYear]){
    				recent = cur[curYear];
    				return false;
    			}
    		});

    		adjAttributes[curLabel] = recent;
    	});

    	self.set("preppedAttributes", adjAttributes);
    },
    prepAttributes: function(means){
    	var self = this, attributes = self.get("preppedAttributes");

    	_.each(Object.keys(means), function(curLabel){
    		if (!attributes[curLabel]){
    			attributes[curLabel] = means[curLabel];
    		}
    	});

    	self.set("preppedAttributes", attributes);

    	self.set("state", self.states.PREPPED);
    }
});

module.exports = Company;