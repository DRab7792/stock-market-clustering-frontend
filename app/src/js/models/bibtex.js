var Backbone = require('backbone');

var Bibtex = Backbone.Model.extend({
	defaults:{
		references: {}
	},
    url: null,

	initialize: function(options){
        this.options = options || {};

        if (this.options.url){
            this.url = this.options.url;
        }
    },
    parse: function(data){
    	var self = this,
    		props = {};

        

    	return self;
    }
});


module.exports = Bibtex;