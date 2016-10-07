var Backbone = require('backbone'),
    Bibtex = require('./bibtex'),
    _ = require("underscore"),
    moment = require("moment");

var Latex = Backbone.Model.extend({
	defaults: {
		title: '',
		authors: [],
		sections: {},
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

    getSlug: function(sectionTitle){
        return sectionTitle.toLowerCase().replaceAll(" ", "-");
    },

    parseLine: function(line, conditions, data){
        var self = this;
        var titleRegex = /\\title\{(.*)\}/i,
            authorRegex = /\\author\{/i,
            emailRegex = /\\email\{(.*)\}/i,
            authTitleRegex = /\\affaddr\{(.*)\}/i,
            dateRegex = /\\date\{(.*)\}/i,
            startAbstractRegex = /\\begin\{abstract\}/i,
            endAbstractRegex = /\\end\{abstract\}/i;

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
            authors.push(data);
            self.set("authors", authors);
            data = {};
            conditions.author = false;
        }else if (dateRegex.test(line)){
            var res = dateRegex.exec(line);
            self.set("date", moment(res[1]));
        }else if (startAbstractRegex.test(line)){
            conditions.abstract = true;
        }else if (endAbstractRegex.test(line)){
            conditions.abstract = false;
        }else if (conditions.abstract){
            var abstract = self.get("abstract");
            abstract += line + "\n";
            self.set("abstract", abstract);
        }
        //TODO: sections and subsections
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

        console.log(lines);

        //Now iterate through and parse lines into info
        var conditions = {
            author: false,
            abstract: false,
            section: false,
            subsection: false
        };
        var data = {};
        _.each(lines, function(cur){
            self.parseLine(cur, conditions, data);
        });

        console.log(self);
    	return self;
    }
});

module.exports = Latex;