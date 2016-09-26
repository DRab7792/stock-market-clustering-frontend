var React = require('react'),
	Backbone = require('backbone');

var BaseView = Backbone.View.extend({
	initialize: function(options){
		this.options = options || {};
	},

	component: function(){
		return (this.options.component) ? this.options.component : null;
	},
});

module.exports = BaseView;