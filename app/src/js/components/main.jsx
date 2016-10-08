var React = require('react'),
	ReactBackbone = require('react.backbone'),
	Header = require('./header.jsx'),
	Footer = require('./footer.jsx'),
	Home = require('./home.jsx');

var Main = React.createBackboneClass({
	getInitialState: function() {
	    return {

	    };
	},
	render: function(){
		var home = (this.props.curRoute != "home") ? null : 
		<Home 
			actionHandler={this.props.app.actionHandler.bind(this.props.app)}
		/>;

		return (<div>
			<Header
				page={this.props.curRoute}
				router={this.props.app.router}
				actionHandler={this.props.app.actionHandler.bind(this.props.app)}
			/>
			<div className="p-wrapper">
				{home}
				<Footer/>
			</div>
		</div>);
	}
});

module.exports = Main;