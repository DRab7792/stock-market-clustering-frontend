var app = require('electron').app,
	electronEjs = require('electron-ejs'),
	config = require('./js/config.js'),
	BrowserWindow = require('electron')['BrowserWindow'];

var mainWindow = null;

app.on('window-all-closed', function(){
	app.quit();
});	

var ejs = new electronEjs(config, 'index.ejs');

app.on('ready', function(){
	mainWindow = new BrowserWindow({
		'width': 1024,
		'height': 768,
		'min-width': 1024
	});

	mainWindow.loadURL('file://'+__dirname+'/index.ejs');
	mainWindow.openDevTools();

	mainWindow.on('closed', function(){
		mainWindow = null;
	});

});