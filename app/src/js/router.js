var Backbone = require('backbone'),
	BackboneRouteControl = require('backbone-route-control');

var Router = BackboneRouteControl.extend({
	routes: {
		'': 					'pages#showHome',
		'proposal': 			'pages#showProposal',
		'proposal/:section': 	'pages#showProposal',
		'paper': 				'pages#showPaper',
		'paper/:section': 		'pages#showPaper',
		'code': 				'pages#showCode',
		'sources': 				'pages#showSources',
		'stack': 				'pages#showStack'
	},
	getRoute: function(){
		
		return Backbone.history.location.hash;
	}
});


module.exports = Router;