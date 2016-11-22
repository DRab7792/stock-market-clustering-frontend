var React = require('react'),
	ReactDOM = require('react-dom'),
	ReactBackbone = require('react.backbone');

var Spinner = React.createBackboneClass({
	getInitialState: function() {
	    return { };
	},
	render: function(){
		return <div className="c-spinner">
			<div className="c-spinner__circle"></div>
		</div>;
	}
});

module.exports = Spinner;