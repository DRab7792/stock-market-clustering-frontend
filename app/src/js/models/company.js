var Backbone = require('backbone');

var Company = Backbone.Model.extend({
	defaults:{
		name: '',
		id: null,
		symbol: null,
		category: {},
	},

	initialize: function(options){
        this.options = options || {};
    },
});

module.exports = Company;