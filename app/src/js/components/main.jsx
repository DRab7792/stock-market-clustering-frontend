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
		return (<div id="main">
			<Header router={this.props.router}/>

			<Footer/>
		</div>);
	}
});

module.exports = Main;