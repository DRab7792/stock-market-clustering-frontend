var React = require('react'),
	_ = require('underscore'),
	config = require('../config'),
	ReactBackbone = require('react.backbone');

var Header = React.createBackboneClass({
	getInitialState: function() {
	    return {
			selected: '',
			pages: {},
	    	nav: []
	    };
	},
	getPages: function(){
		var self = this;

		this.props.actionHandler({
	    	controller: "pages",
	    	method: "pages",
	    	isVar: true,
	    }, {}, function(err, res){
			if (err){
				return console.log("Error getting options", err);
			}

			var adjPages = {};

			//Transform Backbone collection data
			_.each(res.models, function(cur){
				if (cur.attributes && cur.attributes.wpid){
					adjPages[cur.attributes.wpid] = cur.attributes;
				}
			});

			self.setState({
				pages: adjPages
			});
		});
	},
	getOptions: function(){
		var self = this;

		this.props.actionHandler({
	    	controller: "pages",
	    	method: "wpOptions",
	    	isVar: true,
	    }, {}, function(err, res){
			if (err){
				return console.log("Error getting options", err);
			}

			self.setState({
				nav: res.nav
			});
		});
	},
	componentDidMount: function() {
		var curRoute = this.props.curRoute,
			self = this;

		self.getOptions();
	    self.getPages();
		self.setState({
			selected: curRoute
		});
	},
	handleNavClick: function(e){
		var el = $(e.currentTarget);
		var route = el.data("route");

		this.props.router.navigate(route, {trigger: true});
	},
	render: function(){
		var self = this;
		if (!Object.keys(this.state.pages).length) return null;

		var links = _.map(this.state.nav, function(cur){
			var pageId = 0;

			if (!cur['object_id']){ 
				return;
			}else{
				pageId = cur['object_id'];
			}

			if (!self.state.pages[pageId]){
				console.log("Could not find page for nav item", cur);
				return;
			}

			var page = self.state.pages[pageId];

			return <li className="c-header__link" key={page.slug}>
				<span onClick={self.handleNavClick} data-route={page.slug}>{page.title}</span>
			</li>;
		});

		var assetsUrl = config.app.assetsUrl;


		return (<header className="c-header">
			<a href="" className="c-header__logo">
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