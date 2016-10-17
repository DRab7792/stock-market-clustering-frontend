var Backbone = require('backbone'),
	config = require('./config.js'),
	BackboneRouteControl = require('backbone-route-control');

var routes = {};
routes[''] = 					'pages#showHome';
routes['proposal'] = 			'pages#showProposal';
routes['proposal/:section'] = 	'pages#showProposal';
routes['paper'] = 				'pages#showPaper';
routes['paper/:section'] = 		'pages#showPaper';
routes['code'] = 				'pages#showCode';
routes['sources'] = 			'pages#showSources';
routes['stack'] = 				'pages#showStack';

var Router = BackboneRouteControl.extend({
	routes: routes,
	getRoute: function(){
		
		return Backbone.history.location.hash;
	}
});


module.exports = Router;