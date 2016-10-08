var Backbone = require('backbone'),
	BackboneRouteControl = require('backbone-route-control');

var Router = BackboneRouteControl.extend({
	routes: {
		'': 					'pages#showHome',
		'proposal': 			'pages#showProposal',
		'paper': 				'pages#showOverview',
		'paper/:section': 		'pages#showSection',
		'paper/:section/:sub': 	'pages#showSubsection',
		'code': 				'pages#showCode',
		'sources': 				'pages#showSources',
		'stack': 				'pages#showStack'
	},
	getRoute: function(){
		// console.log(Backbone.history);
		return Backbone.history.location.hash;
	}
});


module.exports = Router;