var Backbone = require('backbone'),
	config = require('./config.js'),
	_ = require('underscore'),
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
	//Custom navigate function so the url does not change
	navigate: function(hash){
		//Check routes and form variables from regex
		var route, opts, self = this;
		_.each(Object.keys(this.routes), function(cur){
			var regex = self._routeToRegExp(cur);
			if (regex.test(hash)){
				route = cur;
				opts = self._extractParameters(regex, hash);
				opts = opts.splice(0, opts.length - 1); //Chop null value off array
			}
		});
		if (!this.routes[route]) return;

		//Trigger controller function
		var action = this.routes[route].split("#");
		if (
			!app.controllers[action[0]] ||
			!app.controllers[action[0]][action[1]]
		){
			return;
		}
		app.controllers[action[0]][action[1]](opts);

		//Push state
		window.history.pushState({hash: hash}, hash);

		//Save in local storage for refresh
		window.localStorage.setItem("hash", hash);
	},
	getRoute: function(){
		return (window.history.state && window.history.state.hash) ? window.history.state.hash : "";
	}
});


module.exports = Router;