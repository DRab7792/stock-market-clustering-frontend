var React = require('react'),
	ReactBackbone = require('react.backbone'),
	Header = require('./header.jsx'),
	Footer = require('./footer.jsx');

var Main = React.createBackboneClass({
	getInitialState: function() {
	    return {
	          
	    };
	},
	render: function(){
		return (<div>
			<Header 
				router={this.props.app.router} 
				wpApi={this.props.app.wpApi}
			/>
			<div className="p-wrapper">

			</div>
			<Footer/>
		</div>);
	}
});

module.exports = Main;