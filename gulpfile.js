'use strict';

var gulp = require('gulp'),
	electron = require('gulp-electron'),
	concat = require('gulp-concat'),
	packageJson = require('./app/package.json'),
	cleanCSS = require('gulp-clean-css'),
	sass = require('gulp-sass');


//Compile sass into a single minified css file
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


//Package the final product into an app for Windows, Linux and Mac
gulp.task('package', function() {

    gulp.src("")
    .pipe(electron({
        src: 'app',
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
// gulp.task('compile', ['sass', 'scripts']);
// gulp.task('watch', ['watchScripts', 'watchHtml', 'watchImages']);
// gulp.task('dev', ['compile', 'assets']);
gulp.task('prod', ['package']);