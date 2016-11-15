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
		stockPrices: []
	},

	initialize: function(options){
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

    	return self;
    }
});

module.exports = Company;