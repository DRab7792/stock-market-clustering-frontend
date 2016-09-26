var React = require('react'),
	_ = require('underscore'),
	ReactBackbone = require('react.backbone');

var Header = React.createBackboneClass({
	getInitialState: function() {
	    return {
			selected: ''
	    };
	},
	componentDidMount: function() {
		var curRoute = this.props.router.getRoute();
		this.setState({
			selected: this.props.selected
		});
	},
	handleNavClick: function(el){
		// this.props.router.navigate($());
	},
	render: function(){
		var routes = this.props.router.routes;

		var links = _.map(Object.keys(routes), function(cur){
			var url = "/#" + cur;

			return <li key={cur}>
				<a href={url}>{cur}</a>
			</li>;
		})

		return (<header>
			<nav>
				<ul className="c-header-navLinks">
					{links}
				</ul>
			</nav>
		</header>);
	}
});

module.exports = Header;