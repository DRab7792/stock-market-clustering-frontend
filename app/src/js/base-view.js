var React = require('react');
var Backbone = require('backbone');

var BaseView = Backbone.View.extend({
	initialize: function(options){
		this.options = options || {};
	},

	component: function(){
		return (this.options.component) ? this.options.component : null;
	},

	render: function(){
		React.renderComponent(this.component(), this.el);
		return this;
	}
});

module.exports = BaseView;