var React = require('react'),
	_ = require('underscore'),
	ReactBackbone = require('react.backbone');

var Header = React.createBackboneClass({
	getInitialState: function() {
	    return {
			selected: '',
			nav: []
	    };
	},
	componentDidMount: function() {
		console.log(this.props);
		var curRoute = this.props.router.getRoute(),
			self = this;

		this.props.wpApi.getOptions(function(err, data){
			if (err){
				return console.log("Error getting options", err);
			}

			self.setState({
				nav: data.nav,
				selected: curRoute
			});
		});
		
	},
	handleNavClick: function(el){
		// this.props.router.navigate($());
	},
	render: function(){
		// var routes = this.props.router.routes;

		var links = _.map(this.state.nav, function(cur){
			var url = "/#" + cur.title;

			return <li className="c-header__link" key={cur.title}>
				<a href={url}>{cur.title}</a>
			</li>;
		});

		var assetsUrl =  "assets/";


		return (<header className="c-header">
			<a href="/" className="c-header__logo">
				<img className="c-header__logo-icon" src={assetsUrl+"logo-no-text.svg"} />
				<img className="c-header__logo-text" src={assetsUrl+"logo-text.svg"} />
			</a>
			<nav className="c-header__nav l-grid8">
				<ul className="c-header__navLinks">
					{links}
				</ul>
			</nav>
		</header>);
	}
});

module.exports = Header;