var React = require('react'),
	_ = require('underscore'),
	config = require('../config'),
	async = require('async'),
	SectionList = require('./sectionList.jsx'),
	ReactBackbone = require('react.backbone');

var Header = React.createBackboneClass({
	getInitialState: function() {
	    return {
			selected: '',
			pages: {},
	    	nav: [],
	    	papers: {},
	    	activeDropdown: null,
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
				adjPages[cur.get("wpid")] = cur.attributes;
			});

			self.setState({
				pages: adjPages
			});
		});
	},
	getPapers: function(){
		var self = this,
			paper = null,
			proposal = null;

		async.series([
			function(done){
				self.props.actionHandler({
			    	controller: "pages",
			    	method: "paper",
			    	isVar: true,
			    }, {}, function(err, res){
					if (err){
						return done(err);
					}

					paper = res;

					return done();
				});
			},
			function(done){
				self.props.actionHandler({
			    	controller: "pages",
			    	method: "proposal",
			    	isVar: true,
			    }, {}, function(err, res){
					if (err){
						return done(err);
					}

					proposal = res;

					return done();
				});
			}
		], function(err){
			if (err){
				return console.log("Error getting papers", err);
			}

			self.setState({
				papers: {
					paper: paper,
					proposal: proposal
				}
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
		self.getPapers();
	    self.getPages();

	    // document.addEventListener("")

		self.setState({
			selected: curRoute
		});
	},
	handleNavClick: function(e){
		var el = $(e.currentTarget);
		var route = el.data("route");

		this.props.router.navigate(route, {trigger: true});
	},
	openDropdown: function(e){
		var el = $(e.currentTarget);
		var dropdown = el.data("slug");

		this.setState({
			activeDropdown: dropdown
		});
	},
	closeDropdown: function(e){
		var el = $(e.currentTarget);
		var dropdown = el.data("slug");

		this.setState({
			activeDropdown: dropdown
		});
	},
	closeDropdowns: function(){
		this.setState({
			activeDropdown: null
		});
	},
	render: function(){
		var self = this;
		if (
			!Object.keys(this.state.pages).length ||
			!self.state.papers.paper
		) return null;

		var links = _.map(this.state.nav, function(cur){
			//Get the data
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

			//Don't allow proposal in the header if there is no paper for it
			if (page.slug === "proposal" && !self.state.papers.proposal){
				return;
			}

			//Form dropdowns
			var dropdown = null;
			if (page.slug === "paper"){

				var visibleClass = (self.state.activeDropdown === "paper") ? "c-header__dropdown__visible" : "";

				dropdown = <SectionList
					source={page.slug}
					router={self.props.router}
					extraClasses={"c-header__dropdown "+visibleClass}
					sections={self.state.papers.paper.get("sections")}
				/>;
			}else if (page.slug === "proposal"){

				var visibleClass = (self.state.activeDropdown === "proposal") ? "c-header__dropdown__visible" : "";

				dropdown = <SectionList
					source={page.slug}
					router={self.props.router}
					extraClasses={"c-header__dropdown "+visibleClass}
					sections={self.state.papers.proposal.get("sections")}
				/>;
			}

			//Render link
			return <li className="c-header__link" data-slug={page.slug} key={page.slug}>
				<span className="c-header__link__parent" onClick={self.handleNavClick} data-route={page.slug}>{page.title}</span>
				{dropdown}
			</li>;
		});

		var assetsUrl = config.app.assetsUrl;

		//TODO: FIX DROPDOWN HOVER BUG
		return (<header className="c-header">
			<a href="" className="c-header__logo">
				<img className="c-header__logo-icon" src={assetsUrl+"logo-no-text.svg"} />
				<img className="c-header__logo-text" src={assetsUrl+"logo-text.svg"} />
			</a>
			<nav className="c-header__nav l-grid8" >
				<ul className="c-header__navLinks">
					{links}
				</ul>
			</nav>
		</header>);
	}
});

module.exports = Header;