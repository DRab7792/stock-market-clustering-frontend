var Backbone = require('backbone');

var Visual = Backbone.Model.extend({
	defaults:{
		title: '',
		slug: '',
		wpid: null,
		meta: {}
	},

	initialize: function(options){
        this.options = options || {};
    },
    parse: function(data){
    	var self = this,
    		props = {};

    	props.title = (data.title && data.title.rendered) ? data.title.rendered : '';
    	props.slug = (data.slug) ? data.slug : '';
    	props.wpid = (data.id) ? data.id : null;
    	props.meta = (data.meta) ? data.meta : {};

    	self.attributes = props;
    	return self;
    }
});

module.exports = Visual;