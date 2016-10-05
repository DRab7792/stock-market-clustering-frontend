var React = require('react'),
	config = require('../config'),
	ReactBackbone = require('react.backbone');

var Footer = React.createBackboneClass({
	getInitialState: function() {
	    return {
	          
	    };
	},
	render: function(){
		var assetsUrl =  config.app.assetsUrl;

		return (<footer className="c-footer">
			<img className="c-footer__logo__icon" src={assetsUrl+"logo-no-text.svg"} />
			<span className="c-footer__copyright">&copy; 2016</span>
		</footer>);
	}
});

module.exports = Footer;