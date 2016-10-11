var Backbone = require('backbone'),
    _ = require('underscore'),
    parser = require('bib2json');

var Bibtex = Backbone.Model.extend({
	defaults:{
		references: {}
	},
    url: null,

	initialize: function(options){
        this.options = options || {};

        if (this.options.url){
            this.url = this.options.url;
        }
    },

    /**
     * Sort a bibtex collection using a given field
     * @param  {Object}  collection           bibtex collection
     * @param  {string}  sortField            Field used for sorting
     * @param  {Boolean} [reverseOrder=false] specifies reverse order
     * @return {Object}                       Sorted bibtex collection
     */
    sortBibCollection: function(collection, sortField, reverseOrder) {
        'use strict';
        const bibkeys = Object.keys(collection);
        var bibarray = bibkeys.map(function(citekey) {
            console.log(collection[citekey]);
            return {
                'citekey': citekey,
                'sortkey': (sortField in collection[citekey]) ? collection[citekey][sortField].toLowerCase() : null
            };
        }).sort(function(a, b) {
            return +(a.sortkey > b.sortkey) || +(a.sortkey === b.sortkey) - 1;
        });
        if (reverseOrder) {
            bibarray.reverse();
        }
        bibarray = bibarray.map(function(elt) {
            return elt.citekey;
        });
        var newbib = {};
        bibarray.forEach(function(citekey) {
            newbib[citekey] = collection[citekey];
        });
        return newbib;
    },

    /**
     * Group a bibtex collection using unique values from a given field
     * @param  {Object}  collection           bibtex collection
     * @param  {string}  groupField           Field used for grouping
     * @param  {Boolean} [reverseOrder=false] specifies reverse order
     * @return {Array[Object]}                       Grouped bibtex collection
     */
    groupBibCollection: function(collection, groupField, reverseOrder) {
        'use strict';
        const bibkeys = Object.keys(collection);
        var groups = Array.from(new Set(bibkeys
            .map(function(citekey) {
                return (groupField in collection[citekey]) ? collection[citekey][groupField].toLowerCase() : null;
            })))
            .sort();
        if (reverseOrder) {
            groups.reverse();
        }
        var groupedBib = [];
        var undefColl = {};
        groups.forEach(groupVal => {
            let coll = {};
            bibkeys.forEach(citekey => {
                if (groupField in collection[citekey]) {
                    if (collection[citekey][groupField] == groupVal) {
                        coll[citekey] = collection[citekey];
                    }
                } else {
                    undefColl[citekey] = collection[citekey];
                }
            });
            groupedBib.push({
                group: groupVal,
                entries: coll
            });
        });
        if (Object.keys(undefColl).length > 0) {
            groupedBib.push({
                group: 'undefined',
                entries: undefColl
            });
        }
        return groupedBib;
    },

    /**
     * Render a bibtex entry as HTML
     *
     * @param {Object} entry - bibtex entry object
     * @param {string} style - Latex style to used for rendering
     * @return {string}
     */
    bibtexRenderHtml: function(entry, style) {
        if (style === 'default') {
            return this.bibtexRenderHtmlDefault(entry);
        } else if (style === 'ieeetr') {
            return this.bibtexRenderHtmlIeeetr(entry);
        } else {
            throw new Error('metalsmith-bibtex Error: Style not implemented');
        }
    },

    /**
     * Render a bibtex entry as HTML using default style
     *
     * @param {Object} entry - bibtex entry object
     * @return {string} string - string containing html-formatted citation
     */
    bibtexRenderHtmlDefault: function(entry) {
        console.log();
        // See http://tug.ctan.org/tex-archive/macros/latex/contrib/IEEEtran/bibtex/IEEEtran_bst_HOWTO.pdf

        function extractAuthorListDefault(authors_string) {
            var authors = authors_string.split(' and ').map(function(author) {
                var namespl = author.split(', ');
                if (namespl.length == 2) {
                    var lastName = author.split(', ')[0];
                    var firstName = author.split(', ')[1];
                    return firstName + ' ' + lastName;
                } else {
                    return author;
                }
            });
            if (authors.length > 1) {
                authors = authors.slice(0, -1)
                    .reduceRight(function(previousValue, currentValue) {
                        return currentValue + ', ' + previousValue;
                    }, 'and ' + authors.slice(-1));
            } else {
                authors = authors[0];
            }
            return authors;
        }

        var authors = ('author' in entry) ?
            extractAuthorListDefault(entry['author']) :
            '';

        return this.bibtexRenderHtmlIeeetr_internal(entry, authors);
    },

    /**
     * Render a bibtex entry as HTML using ieeetr style
     *
     * @param {Object} entry - bibtex entry object
     * @return {string} string - string containing html-formatted citation
     */
    bibtexRenderHtmlIeeetr: function(entry) {
        // See http://tug.ctan.org/tex-archive/macros/latex/contrib/IEEEtran/bibtex/IEEEtran_bst_HOWTO.pdf

        function extractAuthorListIeeetr(authors_string) {
            var authors = authors_string.split(' and ').map(function(author) {
                var namespl = author.split(', ');
                var lastName, firstName;
                if (namespl.length == 2) {
                    lastName = author.split(', ')[0];
                    firstName = author.split(', ')[1];
                    return firstName[0] + '. ' + lastName;
                } else if (namespl.length == 1) {
                    var namespldot = author.split('.');
                    if (namespldot.length > 1) {
                        firstName = namespldot.slice(0, -1).join('.') + '.';
                        firstName = firstName.split(' ').map(function(elt) {
                            return elt[0] + '.';
                        }).join(' ');
                        lastName = namespldot.slice(-1)[0];
                        return firstName + lastName;
                    } else {
                        firstName = author.split(' ').slice(0, -1).map(function(elt) {
                            return elt[0] + '.';
                        }).join(' ');
                        lastName = author.split(' ').slice(-1)[0];
                        return firstName + lastName;
                    }
                } else {
                    return author;
                }
            });
            if (authors.length > 1) {
                authors = authors.slice(0, -1)
                    .reduceRight(function(previousValue, currentValue) {
                        return currentValue + ', ' + previousValue;
                    }, 'and ' + authors.slice(-1));
            } else {
                authors = authors[0];
            }
            return authors;
        }

        var authors = ('author' in entry) ?
            extractAuthorListIeeetr(entry['author']) :
            '';

        return this.bibtexRenderHtmlIeeetr_internal(entry, authors);
    },

    /**
     * Format bibtex entry as HTML string using ieeetr style given the formatted
     * authors string.
     *
     * @param  {Object} entry   - Object representing a bibtex entry
     * @param  {string} authors - Formatted string representing the author list.
     * @return {string}         - string containing html-formatted citation
     */
    bibtexRenderHtmlIeeetr_internal: function(entry, authors) {
        var html_str = '<span class="bibtex author">';
        html_str += (authors === '') ? '</span>' : authors + '</span>, ';

        if (entry['entrytype'] === 'article') {
            if ('title' in entry) {
                html_str += '<span class="bibtex title">&ldquo;' + entry.title + ',&rdquo;</span> ';
            }
            if ('journal' in entry) {
                html_str += '<i class="bibtex journal">' + entry.journal + '</i>, ';
            }
            if ('volume' in entry) {
                html_str += '<span class="bibtex volume">vol. ' + entry.volume;
                if ('number' in entry) {
                    html_str += ', no. ' + entry.number;
                }
                html_str += '</span>, ';
            }
        } else if (entry['entrytype'] === 'inproceedings') {
            if ('title' in entry) {
                html_str += '<span class="bibtex title">&ldquo;' + entry.title + ',&rdquo;</span> ';
            }
            if ('booktitle' in entry) {
                html_str += 'in <i class="bibtex booktitle">' + entry.booktitle;
                if ('series' in entry) {
                    html_str += ' <span class="bibtex series">(' + entry.series + ')</span>';
                }
                html_str += '</i>, ';
            }
            if ('volume' in entry) {
                html_str += '<span class="bibtex volume">vol. ' + entry.volume;
                if ('number' in entry) {
                    html_str += ', no. ' + entry.number;
                }
                html_str += '</span>, ';
            }
            if ('address' in entry) {
                html_str += '<span class="bibtex address">' + entry.address + '</span>, ';
            }
            if ('publisher' in entry) {
                html_str += '<span class="bibtex publisher">' + entry.publisher + '</span>, ';
            }
        } else if (entry['entrytype'] === 'book') {
            if ('title' in entry) {
                html_str += '<i class="bibtex title">' + entry.title + '</i>. ';
            }
            if ('address' in entry) {
                html_str += '<span class="bibtex address">' + entry.address + '</span>';
            }
            if ('publisher' in entry) {
                html_str += ': <span class="bibtex publisher">' + entry.publisher + '</span>.';
            }
        } else if (entry['entrytype'] === 'phdthesis') {
            if ('title' in entry) {
                html_str += '<span class="bibtex title">&ldquo;' + entry.title + ',&rdquo;</span> ';
            }
            html_str += '<span class="bibtex type">PhD Dissertation</span>, ';
            if ('school' in entry) {
                html_str += '<span class="bibtex school">' + entry.school + '</span>';
            }
            if ('address' in entry) {
                html_str += ', <span class="bibtex address">' + entry.address + '</span>';
            }
            if ('publisher' in entry) {
                html_str += ': <span class="bibtex publisher">' + entry.publisher + '</span>';
            }
            html_str += '. ';
        } else if (entry['entrytype'] === 'mastersthesis') {
            if ('title' in entry) {
                html_str += '<span class="bibtex title">&ldquo;' + entry.title + ',&rdquo;</span> ';
            }
            html_str += '<span class="bibtex type">Master\'s Thesis</span>, ';
            if ('school' in entry) {
                html_str += '<span class="bibtex school">' + entry.school + '</span>';
            }
            if ('address' in entry) {
                html_str += ', <span class="bibtex address">' + entry.address + '</span>, ';
            }
            if ('publisher' in entry) {
                html_str += ': <span class="bibtex publisher">' + entry.publisher + '</span>';
            }
            html_str += '. ';
        } else if (entry['entrytype'] === 'inbook' || entry['entrytype'] === 'incollection') {
            if ('title' in entry) {
                html_str += '<span class="bibtex title">&ldquo;' + entry.title + ',&rdquo;</span> ';
            }
            if ('booktitle' in entry) {
                html_str += 'in <i class="bibtex booktitle">' + entry.booktitle;
                if ('series' in entry) {
                    html_str += ' <span class="bibtex series">(' + entry.series + ')</span>';
                }
                html_str += '</i>, ';
            }
            if ('editor' in entry) {
                html_str += '<span class="bibtex editor">' + entry.editor + ', Ed</span>';
            }
            html_str += '.';
            if ('address' in entry) {
                html_str += '<span class="bibtex address">' + entry.address + '</span>';
            }
            if ('publisher' in entry) {
                html_str += ': <span class="bibtex publisher">' + entry.publisher + '</span>, ';
            }
        } else if (entry['entrytype'] === 'booklet') {
            if ('title' in entry) {
                html_str += '<i class="bibtex title">' + entry.title + '</i>. ';
            }
            if ('address' in entry) {
                html_str += '<span class="bibtex address">' + entry.address + '</span>, ';
            }
            if ('editor' in entry) {
                html_str += '<span class="bibtex editor">' + entry.editor + ', Ed</span>';
            }
            if ('publisher' in entry) {
                html_str += ': <span class="bibtex publisher">' + entry.publisher + '</span>.';
            }
        } else if (entry['entrytype'] === 'manual') {
            if ('title' in entry) {
                html_str += '<i class="bibtex title">' + entry.title + '</i>. ';
            }
            if ('edition' in entry) {
                html_str += '<span class="bibtex edition">' + entry.edition + '</span>, ';
            }
            if ('organization' in entry) {
                html_str += '<span class="bibtex organization">' + entry.organization + '</span>, ';
            }
            if ('address' in entry) {
                html_str += '<span class="bibtex address">' + entry.address + '</span>, ';
            }
        } else if (entry['entrytype'] === 'proceedings') {
            if ('editor' in entry) {
                html_str += '<span class="bibtex editor">' + entry.editor + '</span>, ';
            }
            if ('title' in entry) {
                html_str += '<i class="bibtex title">' + entry.title + '</i>. ';
            }
            if ('volume' in entry) {
                html_str += '<span class="bibtex volume">vol. ' + entry.volume;
                if ('number' in entry) {
                    html_str += ', no. ' + entry.number;
                }
                html_str += '</span>, ';
            }
            if ('organization' in entry) {
                html_str += '<span class="bibtex organization">' + entry.organization + '</span>, ';
            }
            if ('address' in entry) {
                html_str += '<span class="bibtex address">' + entry.address + '</span>, ';
            }
            if ('publisher' in entry) {
                html_str += '<span class="bibtex publisher">' + entry.publisher + '</span>, ';
            }
        } else if (entry['entrytype'] === 'techreport') {
            if ('title' in entry) {
                html_str += '<span class="bibtex title">&ldquo;' + entry.title + ',&rdquo;</span> ';
            }
            if ('institution' in entry) {
                html_str += '<span class="bibtex institution">' + entry.institution + '</span>, ';
            }
            if ('address' in entry) {
                html_str += '<span class="bibtex address">' + entry.address + '</span>, ';
            }
            if ('type' in entry) {
                html_str += '<span class="bibtex type">' + entry.type + '</span>, ';
            }
            if ('number' in entry) {
                html_str += '<span class="bibtex number">' + entry.number + '</span>, ';
            }
        } else if (entry['entrytype'] === 'unpublished') {
            if ('title' in entry) {
                html_str += '<span class="bibtex title">&ldquo;' + entry.title + ',&rdquo;</span> ';
            }
            if ('note' in entry) {
                html_str += '<span class="bibtex note">' + entry.note + '</span>, ';
            }
        } else if (entry['entrytype'] === 'electronic') {
            if ('title' in entry) {
                html_str += '<span class="bibtex title">&ldquo;' + entry.title + ',&rdquo;</span> ';
            }
            if ('organization' in entry) {
                html_str += '<span class="bibtex organization">' + entry.organization + '</span>, ';
            }
            if ('address' in entry) {
                html_str += '<span class="bibtex address">' + entry.address + '</span>. ';
            }
            if ('note' in entry) {
                html_str += '<span class="bibtex note">' + entry.note + '</span>. ';
            }
        } else if (entry['entrytype'] === 'patent') {
            if ('title' in entry) {
                html_str += '<span class="bibtex title">&ldquo;' + entry.title + ',&rdquo;</span> ';
            }
            if ('nationality' in entry) {
                html_str += '<span class="bibtex nationality">' + entry.nationality + '</span> ';
            }
            if ('number' in entry) {
                html_str += '<span class="bibtex patent">Patent ' + entry.number + '</span>, ';
            }
            if ('address' in entry) {
                html_str += '<span class="bibtex address">' + entry.address + '</span>. ';
            }
            if ('note' in entry) {
                html_str += '<span class="bibtex note">' + entry.note + '</span>. ';
            }
        } else if (entry['entrytype'] === 'periodical') {
            if ('editor' in entry) {
                html_str += '<span class="bibtex editor">' + entry.editor + '</span>, ';
            }
            if ('title' in entry) {
                html_str += '<i class="bibtex title">' + entry.title + '</i>. ';
            }
            if ('series' in entry) {
                html_str += ' <span class="bibtex series">(' + entry.series + ')</span>, ';
            }
            if ('volume' in entry) {
                html_str += '<span class="bibtex volume">vol. ' + entry.volume;
                if ('number' in entry) {
                    html_str += ', no. ' + entry.number;
                }
                html_str += '</span>, ';
            }
            if ('organization' in entry) {
                html_str += '<span class="bibtex organization">' + entry.organization + '</span>. ';
            }
            if ('note' in entry) {
                html_str += '<span class="bibtex note">' + entry.note + '</span>. ';
            }
        } else if (entry['entrytype'] === 'standard') {
            if ('title' in entry) {
                html_str += '<i class="bibtex title">' + entry.title + '</i>. ';
            }
            if ('type' in entry) {
                html_str += '<span class="bibtex type">' + entry.type + '</span>, ';
            }
            if ('number' in entry) {
                html_str += '<span class="bibtex number">' + entry.number + '</span>, ';
            }
            if ('organization' in entry) {
                html_str += '<span class="bibtex organization">' + entry.organization + '</span>. ';
            } else if ('institution' in entry) {
                html_str += '<span class="bibtex institution">' + entry.institution + '</span>. ';
            }
            if ('note' in entry) {
                html_str += '<span class="bibtex note">' + entry.note + '</span>. ';
            }
        } else if (entry['entrytype'] === 'misc') {
            if ('title' in entry) {
                html_str += '<span class="bibtex title">&ldquo;' + entry.title + ',&rdquo;</span> ';
            }
            if ('organization' in entry) {
                html_str += '<span class="bibtex organization">' + entry.organization + '</span>. ';
            } else if ('institution' in entry) {
                html_str += '<span class="bibtex institution">' + entry.institution + '</span>. ';
            }
            if ('address' in entry) {
                html_str += '<span class="bibtex address">' + entry.address + '</span>. ';
            }
            if ('note' in entry) {
                html_str += '<span class="bibtex note">' + entry.note + '</span>. ';
            }
        } else {
            html_str += '<b style="color: red;">Entry Type Not Implemented: ' + entry['entrytype'] + '</b>';
        }

        html_str += ('month' in entry) ? entry.month + ' ' : '';
        html_str += ('year' in entry) ? entry.year : '';
        if ('chapter' in entry && (entry['entrytype'] === 'inbook' || entry['entrytype'] === 'incollection')) {
            html_str += ', <span class="bibtex chapter">ch. ' + entry['chapter'] + '</span>';
        }
        if ('pages' in entry) {
            html_str += ', <span class="bibtex pages">pp. ' + entry['pages'] + '</span>';
        }
        if ('language' in entry) {
            html_str += '(in ' + entry['language'] + ')';
        }
        html_str += '.';

        if ('doi' in entry) {
            html_str += ' <span class="bibtex doi">DOI: <a href="http://dx.doi.org/' + entry.doi + '">' + entry.doi + '</a>.</span> ';
        }
        if ('url' in entry) {
            html_str += ' <span class="bibtex link"><a href="' + entry.url + '">' + entry.url + '</a>.</span> ';
        }

        return html_str;
    },

    parse: function(data){
    	var self = this,
    		props = {};

        //Remove jabref comment
        data = data.replace(/\@Comment\{(.*)\}/i,"");

        var bibdata = parser(data);

        var adjData = _.map(bibdata.entries, function(cur){
            for (var prop in cur) {
                cur[prop.toLowerCase()] = cur[prop];
            }
            for (var prop in cur.fields) {
                cur[prop.toLowerCase()] = cur.fields[prop];
            }
            return cur;
        });
        console.log(adjData[0]);

        console.log(self.bibtexRenderHtml(adjData[0], 'default'));

    	return self;
    }
});


module.exports = Bibtex;