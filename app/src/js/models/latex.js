var Backbone = require('backbone'),
    Bibtex = require('./bibtex'),
    _ = require("underscore"),
    moment = require("moment");

var Latex = Backbone.Model.extend({
	defaults: {
		title: '',
		authors: [],
		sections: [],
        date: null,
        abstract: "",
	},
    bibtex: null,
    url: null,

	initialize: function(options){
        this.options = options || {};

        if (this.options.bibtex){
            this.bibtex = this.options.bibtex;
        }else{
            this.bibtex = new Bibtex();
        }

        if (this.options.url){
            this.url = this.options.url;
        }
    },

    parseLine: function(line, conditions, data){
        var self = this;
        var titleRegex = /\\title\{(.*)\}/i,
            authorRegex = /\\author\{/i,
            emailRegex = /\\email\{(.*)\}/i,
            authTitleRegex = /\\affaddr\{(.*)\}/i,
            dateRegex = /\\date\{(.*)\}/i,
            startAbstractRegex = /\\begin\{abstract\}/i,
            endAbstractRegex = /\\end\{abstract\}/i,
            sectionRegex = /\\section\{(.*)\}/i,
            subsectionRegex = /\\subsection\{(.*)\}/i,
            endRegex = /\\end\{document\}/i,
            startFigureRegex = /\\begin\{figure\}/i,
            endFigureRegex = /\\end\{figure\}/i;

        if (conditions.author) line = line.replace("\\\\", "");

        if (titleRegex.test(line)){
            var res = titleRegex.exec(line);
            self.set("title",res[1]);
        }else if (authorRegex.test(line)){
            conditions.author = true;
        }else if (conditions.author && line[0] != "\\" && line != "}"){
            data.name = line;
        }else if (conditions.author && emailRegex.test(line)){
            var res = emailRegex.exec(line);
            data.email = res[1];
        }else if (conditions.author && authTitleRegex.test(line)){
            var res = authTitleRegex.exec(line);
            data.title = res[1];
        }else if (conditions.author && line == "}"){
            var authors = self.get("authors");
            authors.push(deepCopy(data));
            self.set("authors", authors);
            clearData(data);
            conditions.author = false;
        }else if (dateRegex.test(line)){
            var res = dateRegex.exec(line);
            self.set("date", moment(res[1]));
        }else if (startFigureRegex.test(line)){
            conditions.figure = true;
        }else if (endFigureRegex.test(line)){
            conditions.figure = false;
        }else if (conditions.figure){
            //Do nothing for an image, those are indpendant of the app
        }else if (startAbstractRegex.test(line)){
            conditions.abstract = true;
        }else if (endAbstractRegex.test(line)){
            conditions.abstract = false;
        }else if (conditions.abstract){
            var abstract = self.get("abstract");
            abstract += line + "\n";
            self.set("abstract", abstract);
        }else if (sectionRegex.test(line)){
            //If there is an existing section, save it and reset
            if (conditions.section){
                var sections = self.get("sections");
                sections.push(deepCopy(data));
                self.set("sections", sections);
                clearData(data);
            }
            //Save the title
            var res = sectionRegex.exec(line);
            data["title"] = res[1];
            data["slug"] = getSlug(res[1]);
            data["content"] = "";
            data["subsections"] = [];
            conditions.section = true;
            conditions.subsection = false;
        }else if (conditions.section){
            if (endRegex.test(line)){
                var sections = self.get("sections");
                sections.push(deepCopy(data));
                self.set("sections", sections);
            }else if (line.indexOf("\\") === 0 && !subsectionRegex.test(line)){
                //Do nothing. ie) bibliography tags at the end of the document
                
            }else if (!conditions.subsection && !subsectionRegex.test(line)){
                data["content"] += line + "\n";
            }else if (subsectionRegex.test(line)){
                //Save the title
                var res = subsectionRegex.exec(line);
                data["subsections"].push({
                    title: res[1],
                    slug: getSlug(res[1]),
                    content: ""
                });
                conditions.subsection = true;
            }else if (conditions.subsection){
                data["subsections"][(data["subsections"].length - 1)].content += line + "\n";
            }

        }
    },

    parse: function(data){
    	var self = this,
    		props = {};

        //Nothing returned
        if (!data.length) return self;

        //First remove all comments and blank lines
        var doc = "";
        doc = data.split("\n");
        var lines = [];
        _.each(doc, function(cur){
            cur = cur.trim();
            if (cur[0] !== '%' && cur != ""){
                lines.push(cur);
            }
        });

        //Now iterate through and parse lines into info
        var conditions = {
            author: false,
            abstract: false,
            section: false,
            subsection: false
        };
        var data = {};
        _.each(lines, function(cur){
            // console.log("parse", cur);
            self.parseLine(cur, conditions, data);
        });

        
    	return self;
    }
});

module.exports = Latex;