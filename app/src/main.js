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
		'titleBarStyle': 'hidden',
		'node-integration': false,
		'frame': false,
		'icon': 'file://'+__dirname+'../..icons/gulp-electron.ico'
	});

	var baseURL = 'file://'+__dirname;

	mainWindow.loadURL(baseURL+'/index.html');

	

	if (process.env.NODE_ENV == 'dev') mainWindow.openDevTools();

	mainWindow.on('closed', function(){
		mainWindow = null;
	});

});