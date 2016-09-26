var Backbone = require('backbone'),
	BackboneRouteControl = require('backbone-route-control');

var Router = BackboneRouteControl.extend({
	routes: {
		'': 					'pages#home',
		'proposal': 			'pages#proposal',
		'paper': 				'paper#overview',
		'paper/:section': 		'paper#section',
		'paper/:section/:sub': 	'paper#subsection',
		'code': 				'pages#code',
		'sources': 				'pages#sources',
		'stack': 				'pages#stack'
	},
	getRoute: function(){
		// console.log(Backbone.history);
		return Backbone.history.location.hash;
	}
});

module.exports = Router;