var React = require('react'),
	config = require('../config'),
	ReactBackbone = require('react.backbone');

var Home = React.createBackboneClass({
	getInitialState: function() {
	    return {};
	},
	render: function(){
		var assetsUrl =  config.app.assetsUrl;

		return (<div>
		</div>);
	}
});

module.exports = Home;