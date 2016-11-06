var app = require('electron').app,
	open = require('open'),
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
		'titleBarStyle': 'hidden',
		'node-integration': true,
		'frame': false,
		'icon': 'file://'+__dirname+'../..icons/gulp-electron.ico'
	});

	var baseURL = 'file://'+__dirname;

	mainWindow.loadURL(baseURL+'/index.html');

	mainWindow.webContents.on('new-window', function(e, url) {
		e.preventDefault();
		if (url.indexOf("file://") === -1){
			open(url);
		}
	});

	if (process.env.NODE_ENV == 'dev') mainWindow.openDevTools();

	mainWindow.on('closed', function(){
		mainWindow = null;
	});

});