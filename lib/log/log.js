// recommended log format: {MethodName} [uuid] {Enter/Callback} [service]->[method] - [parameters]
var log4js = module.exports = require('log4js');
var logConfig = require('../../etc').logging.log4js;

// configure log
log4js.configure(logConfig); 
