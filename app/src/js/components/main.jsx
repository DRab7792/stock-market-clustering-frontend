var React = require('react'),
	ReactBackbone = require('react.backbone'),
	Header = require('./header.jsx'),
	Footer = require('./footer.jsx'),
	Home = require('./home.jsx'),
	Bib = require('./bib.jsx'),
	Stack = require('./stack.jsx');

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

		var stack = (this.props.curRoute != "stack") ? null : 
		<Stack 
			actionHandler={this.props.app.actionHandler.bind(this.props.app)}
		/>;
		
		var bib = (this.props.curRoute != "sources") ? null : 
		<Bib 
			actionHandler={this.props.app.actionHandler.bind(this.props.app)}
		/>;

		return (<div>
			<Header
				page={this.props.curRoute}
				router={this.props.app.router}
				actionHandler={this.props.app.actionHandler.bind(this.props.app)}
			/>
			<div className="p-wrapper">
				<div className="p-content">
					{home}
					{stack}
					{bib}
				</div>
				<Footer/>
			</div>
		</div>);
	}
});

module.exports = Main;