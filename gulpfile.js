'use strict';

var gulp = require('gulp'),
	electron = require('gulp-electron'),
	packageJson = require('./app/package.json');





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
// gulp.task('compile', ['sass', 'scripts']);
// gulp.task('watch', ['watchScripts', 'watchHtml', 'watchImages']);
// gulp.task('dev', ['compile', 'assets']);
gulp.task('prod', ['package']);