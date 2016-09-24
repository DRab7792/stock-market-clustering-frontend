'use strict';

var gulp = require('gulp'),
	electron = require('gulp-electron'),
	concat = require('gulp-concat'),
	imagemin = require('gulp-imagemin'),
	browserify = require('browserify'),
	source = require('vinyl-source-stream'),
	reactify = require('reactify'),
	run = require('gulp-run'),
	watchify = require('watchify'),
	livereload = require('gulp-livereload'),
	watch = require('gulp-watch'),
	packageJson = require('./app/package.json'),
	cleanCSS = require('gulp-clean-css'),
	sass = require('gulp-sass');

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
	var script = 'app/src/js/app.jsx';
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
        platforms: ['win32-ia32', 'darwin-x64', 'linux-x64'],
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
gulp.task('compile', ['sass', 'js', 'assets', 'root']);
gulp.task('watch', ['watchJs', 'watchSass', 'watchAssets']);
gulp.task('dev', ['compile', 'run']);
gulp.task('prod', ['package']);