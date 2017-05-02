var express = require('express');
var config = require('./config/admin');

var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var agent = require('./app/agent');
agent.init(io);

//--------------------configure app----------------------
var pub = __dirname + '/public';
var view = __dirname + '/views';

app.configure(function() {
	app.set('view engine', 'html');
	app.set('views', view);
	app.engine('.html', require('ejs').__express);

	app.use(express.methodOverride());
	app.use(express.bodyParser());
	app.set('basepath', __dirname);
});

app.configure('development', function() {
	app.use(express.static(pub));
	app.use(express.errorHandler({
		dumpExceptions: true,
		showStack: true
	}));
});

app.configure('production', function() {
	var oneYear = 31557600000;
	app.use(express.static(pub, {
		maxAge: oneYear
	}));
	app.use(express.errorHandler());
});

app.on('error', function(err) {
	console.error('app on error:' + err.stack);
});

app.get('/', function(req, resp) {
	console.log('get /');
	resp.render('index', config);
});

app.get('/module/:mname', function(req, resp) {
    console.log('get /module/:mname');
	resp.render(req.params.mname);
});

server.listen(7001);
console.log('[AdminConsoleStart] visit http://0.0.0.0:7001');