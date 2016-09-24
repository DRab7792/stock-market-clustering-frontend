var app = require('electron').app,
	BrowserWindow = require('electron')['BrowserWindow'];

var mainWindow = null;

app.on('window-all-closed', function(){
	app.quit();
});	

app.on('ready', function(){
	mainWindow = new BrowserWindow({
		'width': 1024,
		'height': 768,
		'minWidth': 1024,
		'minHeight': 530,
		'icon': 'file://'+__dirname+'../..icons/gulp-electron.ico'
	});

	mainWindow.loadURL('file://'+__dirname+'/index.html');
	mainWindow.openDevTools();

	mainWindow.on('closed', function(){
		mainWindow = null;
	});

});