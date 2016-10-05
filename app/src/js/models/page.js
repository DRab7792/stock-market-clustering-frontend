var Backbone = require('backbone');

var Page = Backbone.Model.extend({
	attributes:{
		title: '',
		slug: '',
		wpid: null,
		meta: {},
		order: null,
	},

	initialize: function(options){
        this.options = options || {};
    },
    parse: function(data){
    	var self = this,
    		props = {};

    	// console.log(data);
    	props.title = (data.title && data.title.rendered) ? data.title.rendered : '';
    	props.slug = (data.slug) ? data.slug : '';
    	props.wpid = (data.id) ? data.id : null;
    	props.meta = (data.meta) ? data.meta : {};
    	props.order = (data.menu_order !== undefined) ? data.menu_order: null;

    	self.attributes = props;
    	return self;
    }
});

module.exports = Page;