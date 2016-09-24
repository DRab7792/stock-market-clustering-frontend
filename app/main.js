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
		'min-width': 1024
	});

	mainWindow.loadURL('file://'+__dirname+'/index.html');
	mainWindow.openDevTools();

	mainWindow.on('closed', function(){
		mainWindow = null;
	});

});