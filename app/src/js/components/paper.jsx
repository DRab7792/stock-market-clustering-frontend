var React = require('react'),
	config = require('../config'),
	_  = require('underscore'),
	async = require('async'),
	SectionList = require('./sectionList.jsx'),
	Source = require('./source.jsx'),
	Spinner = require('./spinner.jsx'),
	ReactDOM = require('react-dom'),
	ReactBackbone = require('react.backbone');

var contentKey = 0,
	curSection = "",
	curParagraph = 1;

var PaperBase = {
	getInitialState: function() {
	    return { 
	    	latex: null,
	    	visuals: null,
	    	visualControllers: [],
	    	overCitation: false,
	    	overTooltip: false,
	    	tooltipEntry: null,
	    	tooltipLoc: null,
	    	loading: true,
	    	viewableVisuals: [],
	    	initialScroll: true,
	    	pdfUrl: null
	    };
	},
	getLatex: function(callback){
		var self = this;
		var callbackIn = (callback) ? callback : function(){};

		this.props.actionHandler({
	    	controller: "pages",
	    	method: this.props.source,
	    	isVar: true,
	    }, {}, function(err, res){
			if (err){
				return console.log("Error getting options", err);
			}

			self.setState({
				latex: res,
			}, callbackIn);
		});
	},
	scrollToSection: function(){
		var self = this;

		var section = this.props.section,
			scroll = 0;

		//Find offset of section in relation to top of p wrapper
		$(".p-paper__section").each(function(){
			if ($(this).data("anchor") === section){
				scroll = $(this).position().top;
				scroll += $(".p-wrapper").scrollTop();
				scroll -= 10; //Padding
				return;
			}
		});
		
		
		//Scroll to section
		$(".p-wrapper").animate({
			scrollTop: scroll
		}, 300, function(){
			if (self.state.initialScroll) self.setState({ initialScroll: false });
		});
	},
	outCitation: function(){
		this.setState({ overCitation: false });
	},
	showCitation: function(entry, key){
		var loc = null;
		$(".p-paper__content-citation").each(function(){
			if ($(this).data("citationkey") === key){
				loc = $(this).offset();
			}
		});
		//Add for scroll position and subtract for header
		loc.top += $(".p-wrapper").scrollTop();
		loc.top -= $(".c-header").height();
		if (!loc) return;

		this.setState({
			overCitation: true,
			tooltipLoc: loc,
			tooltipEntry: entry
		});
	},
	formatContent: function(str){
		if (
			!this.state.latex || 
			!this.state.latex.bibtex
		){
			console.log("Missing bibtex");
			return;
		}

		var regex = /\\cite\{([A-Za-z]*)\}/g,
			citation = regex.exec(str),
			begin = 0,
			newContent = [],
			self = this;

		while (citation){
			var start = citation.index,
				length = citation[0].length,
				end = (start + length),
				key = citation[1],
				num = 0,
				entry = {};

			//Get the number of the citation
			var i = 1;
			_.each(self.state.latex.bibtex.get("references"), function(cur){
				if (key === cur.entrykey){
					num = i;
					entry = cur;
					return false;
				}
				i++;
			});
			//Append to new string
			newContent.push(
				<span className="p-paper__content" onMouseOver={self.outCitation} key={contentKey}>{self.removeEscapeCharacters(str.slice(begin, start))}</span>
			);
			contentKey++;
			if (num > 0){
				newContent.push(
					<span className="p-paper__content-citation" onMouseOver={self.showCitation.bind(self, entry, contentKey)} data-citationkey={contentKey}  key={contentKey}>{self.removeEscapeCharacters(" [" + num + "]")}</span>
				);
				contentKey++;
			}

			begin = end;
			citation = regex.exec(str);
		}
		newContent.push(
			<span className="p-paper__content" onMouseOver={self.outCitation} key={contentKey}>{self.removeEscapeCharacters(str.slice(begin))}</span>
		);
		// console.log();

		return newContent;
	},
	removeEscapeCharacters: function(str){
		var adjStr = "";
		for (var i = 0; i < str.length; i++) {
			if (
				str[i] != "\\"
			){
				adjStr += str[i];
			}else if (
				str[i] == "\\" && 
				i != (str.length - 1) && 
				str[(i+1)] == "\\"
			){
				adjStr += "\\";
				i++;
			}
		}
		return adjStr;
	},
	getPDFUrl: function(){
		var self = this;

		this.props.actionHandler({
	    	controller: "pages",
	    	method: "wpOptions",
	    	isVar: true,
	    }, {}, function(err, res){
			if (err){
				return console.log("Error getting options", err);
			}

			var source = self.props.source;

			if (!res.theme[source + '-pdf']){
				return console.log("Error getting pdf", err);
			}

			self.setState({
				pdfUrl: res.theme[source + '-pdf']
			});
		});
	},
	getVisuals: function(callback){
		var self = this;
		var callbackIn = (callback) ? callback : function(){};

		this.props.actionHandler({
	    	controller: "pages",
	    	method: "getVisuals",
	    }, {}, function(err, res){
			if (err){
				return console.log("Error getting options", err);
			}

			//Sort visuals by order
			res.models = _.sortBy(res.models, function(cur){
				return parseInt(cur.get("meta").loc.order);
			});

			self.setState({
				visuals: res,
			}, callbackIn);
		});
	},
	loadData: function(){
		var self = this;

		self.props.actionHandler({
	    	controller: "data",
	    	method: "initialLoad",
	    }, {}, function(err, data){
	    	if (err){
	    		return console.log("Error loading initial data", err);
	    	}

	    	self.setState({
	    		loading: false
	    	}, function(){
	    		self.dataDidLoad();
	    	});
	    });
	},	
	componentDidMount: function(){
		var self = this;

		self.getPDFUrl();

		window.setTimeout(self.loadData, 200);
	},
	dataDidLoad: function() {
		var self = this;

		
		self.getLatex();
		self.getVisuals(function(){
			var controllers = [];

			//Initiate the visuals
			_.each(self.state.visuals.models, function(cur){
				var loc = cur.get("meta").loc;
				if (loc.page === self.props.source){
					var type = cur.get("meta").data.type,
						id = cur.get("wpid");
					
					var visualController = deepCopy(self.visuals[type]);

					visualController.initiate({
						props: cur,
						actionHandler: self.props.actionHandler
					});

					controllers.push(visualController);
				}
			});

			//Save the controllers
			self.setState({
				visualControllers: controllers
			});
		});

		//Scroll to section after DOM is fully loaded
		window.setTimeout(function(){
			self.scrollToSection();
		}, 600);

		$(".p-wrapper").scroll(function(){
			if (self.state.initialScroll) return;

			var top = $(this).scrollTop(),
				bottom = top + $(this).height();

			var visibleVisuals = self.state.viewableVisuals;
			$(".c-visual").each(function(){
				var curTop = $(this).position().top + top,
					curBottom = curTop + $(this).height();

				// console.log("Tops: " + top + ", " + curTop);
				// console.log("Bottoms: " + bottom + ", " + curBottom);
				if (top < curTop && bottom > curBottom){
					visibleVisuals.push(parseInt($(this).attr("id")));
				}
			});
			visibleVisuals = _.uniq(visibleVisuals);

			self.setState({
				viewableVisuals: visibleVisuals
			});
		});
		
	},
	componentDidUpdate: function(prevProps, prevState) {
		var self = this;
		if (this.props.section !== prevProps.section){
			self.scrollToSection();
		}
	},
	createContent: function(content){
		var self = this;
		var paragraphs = content.split("\n");

		var res = _.map(paragraphs, function(curContent){
			curContent = self.formatContent(curContent);
			var visuals = [];

			//Should any visualizations be inserted?
			if (
				self.state.visuals && 
				self.state.visuals.models
			){
				_.each(self.state.visuals.models, function(cur){
					var loc = cur.get("meta").loc, 
						size = cur.get("meta").size,
						id = cur.get("wpid"),
						figure = cur.get("meta").misc.figure,
						caption = cur.get("meta").misc.caption;
					if (loc.page === self.props.source && curSection === loc.section && curParagraph === parseInt(loc.paragraph)){
						var containerStyle = {
							width: size.width + "%"
						};
						var svgStyle = {
							height: size.height + "px"
						};

						var visualClasses = "c-visual__graphic ";

						if (_.contains(self.state.viewableVisuals, id)){
							visualClasses += " c-visual__graphic__show";
						}

						visuals.push(<div className="c-visual" id={id} style={containerStyle}>
							<svg className={visualClasses} style={svgStyle}></svg>
							<div className="c-visual__caption">
								<span className="c-visual__caption-figure">{"Figure " + figure + ". "}</span>
								<span className="c-visual__caption-text">{caption}</span>
							</div>
						</div>);
					}
				});
			}

			curParagraph++;
			return <div>
				{visuals}
				<p className="p-paper__paragraph">
					{curContent}
				</p>
			</div>;
		});
		return res;
	},
	createSubsections: function(subsections, sectionNum){
		var self = this,
			num = 0;

		// console.log(subsections);
		var subsections = _.map(subsections, function(curSubsection){
			num++;
			var content = self.createContent(curSubsection.content);

			return <div className="p-paper__subsection" key={curSubsection.slug} data-anchor={curSubsection.slug}>
				<h4 className="p-paper__subheading" onMouseOver={self.outCitation}>{sectionNum + "." + num + "  " + curSubsection.title}</h4>
				{content}
			</div>;
		});

		return subsections;
	},
	outTooltip: function(){
		this.setState({ overTooltip: false });
	},
	hoverTooltip: function(){
		this.setState({ overTooltip: true });
	},
	formTooltip: function(){
		if (
			!(this.state.overCitation || this.state.overTooltip) ||
			!this.state.tooltipEntry ||
			!this.state.tooltipLoc
		){
			return;
		}
		// console.log("Over tooltip", this.state.overTooltip);
		// console.log("Over citation", this.state.overCitation);

		return <div className="p-paper__tooltip" onMouseOver={this.hoverTooltip} onMouseLeave={this.outTooltip} style={this.state.tooltipLoc}>
			<Source entry={this.state.tooltipEntry} />
		</div>;
	},
	formSections: function(){
		var self = this,
			sections = null;
		if (!self.state.latex) return sections;

		var section = 0;
		sections = _.map(self.state.latex.get("sections"), function(cur){
			section++;
			curParagraph = 1;
			curSection = cur.slug;

			var paragraphs = self.createContent(cur.content);
			var subsections = self.createSubsections(cur.subsections, section);

			return <div className="p-paper__section" key={cur.slug} data-anchor={cur.slug}>
				<h3 className="p-paper__heading" onMouseOver={self.outCitation}>{section + ".  " + cur.title}</h3>
				{paragraphs}
				{subsections}
			</div>;
		});

		return sections;
	},
	render: function(){
		var self = this;
		if (self.state.loading){
			return <Spinner />;
		}
		if (!self.state.latex) return null;

		var toc = <div className="p-paper__toc">
			<h4 className="p-paper__toc-title">Table Of Contents</h4>
			<SectionList 
				source={self.props.source}
				router={self.props.router}
				sections={self.state.latex.get("sections")}
				extraClasses="p-paper__toc-list" />
		</div>;

		var tooltip = self.formTooltip();

		var sections = self.formSections();

		var pdfLink = null;

		if (self.state.pdfUrl){
			pdfLink = <a href={self.state.pdfUrl} className="p-paper__download" target="_blank">
				<i className="fa fa-file-pdf-o"></i>
			</a>;
		}
		
		return (<div className="p-paper">
			{tooltip}
			<h2 className="p-paper__title">
				{this.props.source.toTitleCase()}
				{pdfLink}
			</h2>
			{toc}
			{sections}
		</div>);
	}
};


require('./visuals')(PaperBase);
var Paper = React.createBackboneClass(PaperBase);


module.exports = Paper;