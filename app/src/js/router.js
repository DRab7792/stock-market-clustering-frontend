var Backbone = require('backbone');
var BackboneRouteControl = require('backbone-route-control');

var Router = BackboneRouteControl.extend({
	routers: {
		'': 					'pages#home',
		'proposal': 			'pages#proposal',
		'paper': 				'paper#overview',
		'paper/:section': 		'paper#section',
		'paper/:section/:sub': 	'paper#subsection',
		'code': 				'pages#code',
		'sources': 				'pages#sources',
		'stack': 				'pages#stack'
	}
});

module.exports = Router;