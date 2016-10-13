var React = require('react'),
	config = require('../config'),
	_  = require('underscore'),
	ReactDOM = require('react-dom'),
	ReactBackbone = require('react.backbone');

var Source = React.createBackboneClass({
	getInitialState: function() {
	    return {};
	},
	getTitle: function(data){
		var title = null;
		if ('title' in data) {
            title = <span className="c-source__title">{'"' + data.title + '," '}</span>;
        }
        return title;
	},
	getTitleForBook: function(data){
		var title = null;
		if ('title' in data) {
            title = <i className="c-source__title">{data.title + '. '}</i>;
        }
        return title;
	},
	getJournal: function(data){
		var journal = null;
		if ('journal' in data) {
            journal = <span className="c-source__journal"><i>{'"' + data.journal + ',"'} </i></span>;
        }
        return journal;
	},
	getVolume: function(data){
		var volume = null;
		if ('volume' in data) {
        	var vol = 'vol. ' + data.volume;

        	if ('number' in data) {
                vol += ', no. ' + data.number;
            }

            volume = <span>
                <span className="c-source__volume">
                	{vol}
                </span>, 
            </span>;
        }
        return volume;
	},
	getBooktitle: function(data){
		var booktitle = null;
		if ('booktitle' in data) {
        	var series = null;

        	if ('series' in data) {
                series = <span className="c-source__series">{" (" + data.series + ")"}</span>;
            }

            booktitle = <span className="c-source__booktitle">in <i>{data.booktitle + series}</i></span>;
        }
        return booktitle;
	},
	getEdition: function(data, prefix, suffix){
		prefix = (!prefix) ? null : prefix;
		suffix = (!suffix) ? null : suffix;
		var edition = null;
		if ('edition' in data) {
            edition = <span>{prefix}<span className="c-source__edition">{data.edition}</span>{suffix}</span>;
        }
        return edition;
	},
	getOrganization: function(data, prefix, suffix){
		prefix = (!prefix) ? null : prefix;
		suffix = (!suffix) ? null : suffix;
		var organization = null;
		if ('organization' in data) {
            organization = <span>{prefix}<span className="c-source__organization">{data.organization}</span>{suffix}</span>;
        }
        return organization;
	},
	getAddress: function(data, prefix, suffix){
		prefix = (!prefix) ? null : prefix;
		suffix = (!suffix) ? null : suffix;
		var address = null;
		if ('address' in data) {
            address = <span>{prefix}<span className="c-source__address">{data.address}</span>{suffix}</span>;
        }
        return address;
	},
	getPublisher: function(data, prefix, suffix){
		prefix = (!prefix) ? null : prefix;
		suffix = (!suffix) ? null : suffix;
		var publisher = null;
		if ('publisher' in data) {
            publisher = <span>{prefix}<span className="c-source__publisher">{data.publisher}</span>{suffix}</span>;
        }
        return publisher;
	},
	getSchool: function(data){
		var school = null;
		if ('school' in data) {
            school = <span className="c-source__school">{data.school}</span>;
        }
        return school;
	},
	getEditor: function(data, prefix, suffix){
		prefix = (!prefix) ? null : prefix;
		suffix = (!suffix) ? null : suffix;
		var editor = null;
		if ('editor' in data) {
            editor = <span>{prefix}<span className="c-source__editor">{data.editor + ', Ed'}</span>{suffix}</span>;
        }
        return editor;
	},
	getInstitution: function(data, prefix, suffix){
		prefix = (!prefix) ? null : prefix;
		suffix = (!suffix) ? null : suffix;
		var institution = null;
		if ('institution' in data) {
            institution = <span>{prefix}<span className="c-source__institution">{data.institution}</span>{suffix}</span>;
        }
        return institution;
	},
	getType: function(data, prefix, suffix){
		prefix = (!prefix) ? null : prefix;
		suffix = (!suffix) ? null : suffix;
		var type = null;
		if ('type' in data) {
            type = <span>{prefix}<span className="c-source__type">{data.type}</span>{suffix}</span>;
        }
        return type;
	},
	getNumber: function(data, prefix, suffix){
		prefix = (!prefix) ? null : prefix;
		suffix = (!suffix) ? null : suffix;
		var number = null;
		if ('number' in data) {
            number = <span>{prefix}<span className="c-source__number">{data.number}</span>{suffix}</span>;
        }
        return number;
	},
	getNote: function(data, prefix, suffix){
		prefix = (!prefix) ? null : prefix;
		suffix = (!suffix) ? null : suffix;
		var note = null;
		if ('note' in data) {
            note = <span>{prefix}<span className="c-source__note">{data.note}</span>{suffix}</span>;
        }
        return note;
	},
	getNationality: function(data, prefix, suffix){
		prefix = (!prefix) ? null : prefix;
		suffix = (!suffix) ? null : suffix;
		var nationality = null;
		if ('nationality' in data) {
            nationality = <span>{prefix}<span className="c-source__nationality">{data.nationality}</span>{suffix}</span>;
        }
        return nationality;
	},
	getSeries: function(data, prefix, suffix){
		prefix = (!prefix) ? null : prefix;
		suffix = (!suffix) ? null : suffix;
		var series = null;
		if ('series' in data) {
            series = <span>{prefix}<span className="c-source__series">{data.series}</span>{suffix}</span>;
        }
        return series;
	},
	render: function(){
		var data = this.props.entry.fields,
			self = this;


		var start = null;
		var author = (data.author) ? <span className="c-source__author">{data.author+". "}</span> : null;

        if (data.type === 'article') {
        	var title = self.getTitle(data), 
        		journal = self.getJournal(data), 
        		volume = self.getVolume(data);

            start = (<span>
            	{author}
            	{title}
            	{journal}
            	{volume}
            </span>);
        } else if (data.type === 'inproceedings') {
            var title = self.getTitle(data), 
            	booktitle = self.getBooktitle(data), 
            	volume = self.getVolume(data), 
            	address = self.getAddress(data, null, ", "), 
            	publisher = self.getPublisher(data, null, ", ");

            start = (<span>
            	{author}
            	{title}
            	{booktitle}
            	{volume}
            	{address}
            	{publisher}
            </span>);
        } else if (data.type === 'book') {
            var title = self.getTitleForBook(data), 
            	address = self.getAddress(data), 
                prefix = (!address) ? null: ": ",
            	publisher = self.getPublisher(data, prefix, ". ");

            start = (<span>
            	{author}
            	{title}
            	{address}
            	{publisher}
            </span>);
        } else if (data.type === 'phdthesis') {
            var title = self.getTitle(data), 
            	school = self.getSchool(data),
            	address = self.getAddress(data, ", "), 
            	publisher = self.getPublisher(data, ": ");

            start = (<span>
            	{author}
            	{title}
            	<span className="c-source__type">PhD Dissertation</span>
            	{school}
            	{address}
            	{publisher}
            	.
            </span>);
        } else if (data.type === 'mastersthesis') {
            var title = self.getTitle(data), 
          		school = self.getSchool(data),
        		address = self.getAddress(data, ", ", ", "), 
       			publisher = self.getPublisher(data, ": ");

            start = (<span>
            	{author}
            	{title}
            	<span className="c-source__type">{"Master's Dissertation"}</span>
            	{school}
            	{address}
            	{publisher}
            	.
            </span>);
        } else if (data.type === 'inbook' || data.type === 'incollection') {
            var title = self.getTitleForBook(data), 
            	booktitle = self.getBooktitle(data),
            	editor = self.getEditor(data), 
            	address = self.getAddress(data), 
            	publisher = self.getPublisher(data, ": ", ", ");

            start = (<span>
            	{author}
            	{title}
            	{booktitle}
            	{editor}
            	.
            	{address}
            	{publisher}
            </span>);
        } else if (data.type === 'booklet') {
            var title = self.getTitleForBook(data), 
            	address = self.getAddress(data), 
            	editor = self.getEditor(data), 
            	publisher = self.getPublisher(data, ": ", ".");

            start = (<span>
            	{author}
            	{title}
            	{address}
            	{editor}
            	{publisher}
            </span>);
        } else if (data.type === 'manual') {
            var title = self.getTitleForBook(data), 
            	edition = self.getAddress(data, null, ", "), 
            	organization = self.getOrganization(data, null, ", "), 
            	address = self.getAddress(data, null, ", ");

            start = (<span>
            	{author}
            	{title}
            	{edition}
            	{organization}
            	{address}
            </span>);
        } else if (data.type === 'proceedings') {
            var title = self.getTitleForBook(data), 
            	editor = self.getEditor(data, null, ", "),
            	volume = self.getVolume(data), 
            	organization = self.getOrganization(data, null, ", "), 
            	address = self.getAddress(data, null, ", "),
            	publisher = self.getPublisher(data, null, ", ");

            start = (<span>
            	{author}
            	{editor}
            	{title}
            	{volume}
            	{organization}
            	{address}
            	{publisher}
            </span>);
        } else if (data.type === 'techreport') {
            var title = self.getTitle(data), 
            	institution = self.getInstitution(data, null, ", "),
            	address = self.getAddress(data, null, ", "),
            	type = self.getType(data, null, ", "),
            	number = self.getNumber(data, null, ", ");

            start = (<span>
            	{author}
            	{title}
            	{institution}
            	{address}
            	{type}
            	{number}
            </span>);
        } else if (data.type === 'unpublished') {
            var title = self.getTitle(data), 
            	note = self.getNote(data, null, ", ");

            start = (<span>
            	{author}
            	{title}
            	{note}
            </span>);
        } else if (data.type === 'electronic') {
            var title = self.getTitle(data), 
            	note = self.getNote(data, null, ", "),
            	organization = self.getOrganization(data, null, ", "), 
            	address = self.getAddress(data, null, ", ");

            start = (<span>
            	{author}
            	{title}
            	{organization}
            	{address}
            	{note}
            </span>);
        } else if (data.type === 'patent') {
            var title = self.getTitle(data), 
            	note = self.getNote(data, null, ". "),
            	nationality = self.getNationality(data, null, " "), 
            	number = self.getNumber(data, null, ", "),
            	address = self.getAddress(data, null, ". ");

            start = (<span>
            	{author}
            	{title}
            	{nationality}
            	{number}
            	{address}
            	{note}
            </span>);
        } else if (data.type === 'periodical') {
            var title = self.getTitleForBook(data), 
            	editor = self.getEditor(data, null, ", "),
            	series = self.getSeries(data, " ", ", "), 
            	volume = self.getVolume(data),
            	organization = self.getOrganization(data, null, ". "),
            	note = self.getNote(data, null, ". ");

            start = (<span>
            	{author}
            	{editor}
            	{title}
            	{series}
            	{volume}
            	{organization}
            	{note}
            </span>);
        } else if (data.type === 'standard') {
            var title = self.getTitleForBook(data), 
            	type = self.getType(data, null, ", "),
            	number = self.getNumber(data, null, ", "), 
            	conditional = null,
            	note = self.getNote(data, null, ". ");

            if ('organization' in entry) {
                conditional = self.getOrganization(data, null, ". ");
            } else if ('institution' in entry) {
                conditional = self.getInstitution(data, null, ". ");
            }

            start = (<span>
            	{author}
            	{title}
            	{type}
            	{number}
            	{conditional}
            	{note}
            </span>);
        } else if (data.type === 'misc') {
            var title = self.getTitle(data), 
            	conditional = null,
            	address = self.getAddress(data, null, ". "),
            	note = self.getNote(data, null, ". ");

            if ('organization' in entry) {
                conditional = self.getOrganization(data, null, ". ");
            } else if ('institution' in entry) {
                conditional = self.getInstitution(data, null, ". ");
            }

            start = (<span>
            	{author}
            	{title}
            	{conditional}
            	{address}
            	{note}
            </span>);
        } else {
            start = <b style={{color: 'red'}}>{"data Type Not Implemented: " + data.type}</b>;
        }

        var year = null, 
        	month = null, 
        	chapter = null, 
        	pages = null, 
        	language = null, 
        	doi = null, 
        	url = null,
            space = false;

        
        if ('chapter' in data && (data.type === 'inbook' || data.type === 'incollection')) {
            chapter = <span>, <span className="c-source__chapter">{'ch. ' + data['chapter']}</span></span>;
            space = true;
        }
        if ('pages' in data) {
            pages = <span>, <span className="c-source__pages">{'pp. ' + data['pages']}</span></span>;
            space = true;
        }
        if ('language' in data) {
            language = <span className="c-source__language">{'(in ' + data['language'] + ')'}</span>;
            space = true;
        }

        if ('month' in data){
            month = <span>{data.month + " "}</span>;
        }
        if ('year' in data && space){
            year = <span>{data.year + " "}</span>;
        }else if ('year' in data){
            year = <span>{data.year}</span>;
        }

        if ('doi' in data) {
            doi = <span className="c-source__doi"> DOI: <a target="_blank" href={"http://dx.doi.org/" + data.doi}>{data.doi}</a>. </span>;
        }
        if ('url' in data) {
            url = <span className="c-source__link"> <a target="_blank" href={data.url}>{data.url}</a>. </span>;
        }


        return <span className="c-source" data-key={this.props.entry.entrykey}>
        	{start}
        	{month}
        	{year}
        	{chapter}
        	{pages}
        	{language}
        	{". "}
        	{doi}
        	{url}
        </span>;

	}
});

module.exports = Source;