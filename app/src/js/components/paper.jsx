var React = require('react'),
	config = require('../config'),
	_  = require('underscore'),
	async = require('async'),
	SectionList = require('./sectionList.jsx'),
	ReactDOM = require('react-dom'),
	ReactBackbone = require('react.backbone');

var Paper = React.createBackboneClass({
	getInitialState: function() {
	    return { latex: null };
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

		$(".p-paper__section").each(function(){

		});
		
		$("body").animate({
			scrollTop: scroll
		}, 300);
	},
	insertCitations: function(str){

		var regex = /\\cite\{([A-Za-z]*)\}/g,
			citation = regex.exec(str),
			begin = 0,
			newStr = "";

		while (citation){
			var start = citation.index,
				length = citation[0].length,
				end = (start + length),
				key = citation[1];

			//TODO: Find the citation in the bibtex model using the key
			newStr += str.slice(begin, start) + " [1]";

			begin = end;
			citation = regex.exec(str);
		}
		newStr += str.slice(begin);

		return newStr;
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
	componentDidMount: function() {
		var self = this;

		self.getLatex();

		self.scrollToSection();
	},
	createContent: function(content){
		var self = this;
		var paragraphs = content.split("\n");

		var res = _.map(paragraphs, function(curContent){
			curContent = self.insertCitations(curContent);
			curContent = self.removeEscapeCharacters(curContent);
			return <p className="p-paper__paragraph">
				{curContent}
			</p>;
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
				<h4 className="p-paper__subheading">{sectionNum + "." + num + "  " + curSubsection.title}</h4>
				{content}
			</div>;
		});

		return subsections;
	},
	formSections: function(){
		var self = this,
			sections = null;
		if (!self.state.latex) return sections;

		var section = 0;
		sections = _.map(self.state.latex.get("sections"), function(cur){
			section++;
			// console.log(cur);

			var paragraphs = self.createContent(cur.content);
			var subsections = self.createSubsections(cur.subsections, section);

			return <div className="p-paper__section" key={cur.slug} data-anchor={cur.slug}>
				<h3 className="p-paper__heading">{section + ".  " + cur.title}</h3>
				{paragraphs}
				{subsections}
			</div>;
		});

		return sections;
	},
	render: function(){
		var self = this;
		if (!self.state.latex) return null;

		var toc = <div className="p-paper__toc">
			<h4 className="p-paper__toc-title">Table Of Contents</h4>
			<SectionList 
				source={self.props.source}
				router={self.props.router}
				sections={self.state.latex.get("sections")}
				extraClasses="p-paper__toc-list" />
		</div>;

		var sections = self.formSections();
		
		return (<div className="p-paper">
			<h2 className="p-paper__title">{this.props.source.toTitleCase()}</h2>
			{toc}
			{sections}
		</div>);
	}
});

module.exports = Paper;