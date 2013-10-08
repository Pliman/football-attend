/**
 * Module dependencies.
 */

var express = require('express')
	, http = require('http')
	, path = require('path');
var logger = require("./lib/log").getLogger('app');

var app = express();

var port = process.env.PORT || 51998;
// all environments
app.set('port', port);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
//app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({
	secret : "sdfhoisduahf9832hrnf9832hnroinsdfj89ajfdosajf990",
	// set session timeout
	cookie : {
		path : '/',
		httpOnly : true,
		maxAge : 3600000
	}
}));
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

// schedule job to clear data
var scheduledJob;
function setupScheduledJob(code, signal) {
	if (scheduledJob) {
		logger.info('Scheduled process ' + scheduledJob.pid + ' is dead with signal: ' + signal);
		logger.info('try to restart scheduled process');
	}

	scheduledJob = require('child_process').fork(__dirname + '/lib/data-rebuild-schedule/data-rebuild-schedule.js');
	logger.info('Scheduled process started successfully.');
	scheduledJob.on('exit', setupScheduledJob);
}
setupScheduledJob();

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

// dispatch routes
var dispatcher = require("./dispatcher");
dispatcher.dispatch(app);

http.createServer(app).listen(port, function() {
	console.log("attendee listening on port %d in %s mode", port, app.settings.env);
});
