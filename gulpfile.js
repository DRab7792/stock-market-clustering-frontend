'use strict';

var gulp = require('gulp'),
	electron = require('gulp-electron'),
	concat = require('gulp-concat'),
	imagemin = require('gulp-imagemin'),
	browserify = require('browserify'),
	ejs = require('gulp-ejs'),
	fs = require('fs'),
	_ = require('underscore'),
	jsonSass = require('gulp-json-sass'),
	clean = require('gulp-clean'),
	config = require('./app/src/js/config.js'),
	source = require('vinyl-source-stream'),
	reactify = require('reactify'),
	run = require('gulp-run'),
	watchify = require('watchify'),
	livereload = require('gulp-livereload'),
	watch = require('gulp-watch'),
	packageJson = require('./app/src/package.json'),
	cleanCSS = require('gulp-clean-css'),
	sass = require('gulp-sass'),
	icon = require('icon-gen'),
	request = require('request');

const options = {
			report: true,
			names:{
				ico: 'ico-logo',
				icns: 'icns-logo'
			}
		};

gulp.task('icons', function(){
	icon('./app/src/assets/logo-no-text.svg', './icons', options)
		.then((results) => {
			console.log(results);
		})
		.catch((err) => {
			console.log(err);
		});
});

gulp.task('importSassVars', function(){
	var url = config.app.optionsUrl;
	request(url, function(err, res){

		//Handle error
		if (err){
			console.log("Error getting options", err);
			return process.exit();
		}

		//Parse results
		var options = JSON.parse(res.body);

		//Form color variables
		var str = "";
		_.each(options.theme.colors, function(cur){
			str += "$color-" + cur.name + ": " + cur.color + ";\n";
		});

		//Form font variables
		str += "\n";
		_.each(options.theme.font, function(cur){
			str += "@import '" + cur.url + "';\n";
			str += "$" + cur.type + "-font: " + cur.family + ";\n\n";
		});

		//Write json file
		fs.writeFileSync('app/src/sass/compiled/_options.scss', str);
		
	});
});

//Compile sass into a single minified css file and move to build
gulp.task('sass', function(){
	return gulp.src("app/src/sass/index.scss")
		.pipe(sass().on('error', sass.logError))
		.pipe(concat("style.css"))
		.pipe(cleanCSS({
			keepSpecialComments: 0,
			processImport: false
    	}).on('error', sass.logError))
    	.pipe(gulp.dest("app/build/css"))
});

//Accompanying watch task for sass
gulp.task('watchSass', function(){
	return watch(['app/src/sass/index.scss', 'app/src/sass/**/*.scss'], function(){
		return gulp.src("app/src/sass/index.scss")
			.pipe(sass().on('error', sass.logError))
			.pipe(concat("style.css"))
			.pipe(cleanCSS({
				keepSpecialComments: 0,
				processImport: false
	    	}).on('error', sass.logError))
	    	.pipe(gulp.dest("app/build/css"))
	    	.pipe(livereload());
	    }
	);
});

//Compile assets and move into build
gulp.task('assets', function(){
	return gulp.src('app/src/assets/**/*')
		.pipe(imagemin({
			progressive: true,
			interlaced: true
		}))
		.pipe(gulp.dest('app/build/assets'));
});

//Accompanying watch task for assets
gulp.task('watchAssets', function(){
	return watch(['app/src/assets/*', 'app/src/assets/**/*'], function(){
		return gulp.src('app/src/assets/**/*')
			.pipe(imagemin({
				progressive: true,
				interlaced: true
			}))
			.pipe(gulp.dest('app/build/assets'))
			.pipe(livereload());
	});
});

//Move index file and main js into build
gulp.task('root', function(){
	gulp.src("app/src/index.ejs")
		.pipe(ejs(config, {ext: '.html'}))
		.pipe(gulp.dest("app/build/"));

	return gulp.src("app/src/*.*")
		.pipe(gulp.dest("app/build"));
});

//Compile js and move into build
gulp.task('js', function(){
	return js(false);
});

gulp.task('watchJs', function(){
	return js(true);
});

var js = function(watch){
	//First bring over the config file
	gulp.src("app/src/js/config.js")
		.pipe(gulp.dest("app/build/js"))

	//Now compile all the js
	var script = 'app/src/js/index.js';
	var bundler;

	if (watch){
		bundler = browserify([script], {
            cache: {},
            packageCache: {},
            plugin: [watchify],
            debug: true
        });
	}else{
		bundler = browserify(script);
	}

	bundler.transform(reactify);

	var rebundle = function(){
		gulp.start("sass");
		return bundler.bundle()
			.on('error', function(err){
				console.log("browserify error", err);
			})
			.pipe(source('bundle.js'))
			.pipe(gulp.dest("app/build/js"))
			.pipe(livereload());
	};

	bundler.on('update', rebundle);

	return rebundle();
};

//Run electron app from build
gulp.task('run', function(){
	process.env.NODE_ENV = 'dev';
	livereload.listen();
	return run('electron app/build/main.js').exec();
});

//Package the final product into an app for Windows, Linux and Mac
gulp.task('package', function() {

    gulp.src("")
	    .pipe(electron({
	        src: 'app/build',
	        packageJson: packageJson,
	        release: 'release',
	        cache: 'cache',
	        version: 'v1.4.1',
	        rebuild: false,
	        packaging: true,
	        // asar: true,
	        platforms: ['darwin-x64'],
	        platformResources: {
	            darwin: {
	                CFBundleDisplayName: packageJson.name,
	                CFBundleIdentifier: packageJson.name,
	                CFBundleName: packageJson.name,
	                CFBundleVersion: packageJson.version,
	                icon: 'icons/gulp-electron.icns'
	            },
	            win: {
	                "version-string": packageJson.version,
	                "file-version": packageJson.version,
	                "product-version": packageJson.version,
	                icon: 'icons/gulp-electron.ico'
	            }
	        }
	    }))
	    .pipe(gulp.dest(""));
});


//Define all the tasks
gulp.task('default', ['dev', 'watch']);
gulp.task('compile', ['importSassVars', 'sass', 'js', 'assets', 'root']);
gulp.task('watch', ['importSassVars', 'watchJs', 'watchSass', 'watchAssets']);
gulp.task('dev', ['compile', 'run']);
gulp.task('prod', function(){
	gulp.start("icons");
	gulp.start("compile");

	gulp.src('release', {read: false})
        .pipe(clean());

	setTimeout(function(){
		gulp.start("package");
	}, 3000);
});