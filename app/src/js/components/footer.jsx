var React = require('react'),
	ReactBackbone = require('react.backbone');

var Footer = React.createBackboneClass({
	getInitialState: function() {
	    return {
	          
	    };
	},
	render: function(){
		var assetsUrl =  "assets/";


		return (<footer className="c-footer">
			<a href="/" className="c-footer__logo">
				<img className="c-footer__logo__icon" src={assetsUrl+"logo-no-text.svg"} />
			</a>
			<span className="c-footer__copyright">Copyright 2016</span>
		</footer>);
	}
});

module.exports = Footer;