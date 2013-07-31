var routes = require('./etc/routes.js');
var _ = require('underscore');

var preProcessors = [], postProcessors = [];

/**
 * register request processor
 */
exports.dispatch = function (app) {
	// init url despatch
	var reqCfg = routes;
	var route, cfg;
	for (var i = 0; i < reqCfg.length; i++) {
		cfg = reqCfg[i];
		route = require(cfg.path);
		// use configed method
		if (_.isArray(cfg.url)) {
			cfg.url.forEach(function (url) {
				app[cfg.method](url, processReq(cfg, route[cfg.objName]));
			});
		} else {
			app[cfg.method](cfg.url, processReq(cfg, route[cfg.objName]));
		}
	}
}

// process request with extension processor
// ALERT: preProcessors and postProcessors are only functional with processors
// configured in nelo2-routes.json
var processReq = function (routeCfg, processor) {
	return function (req, res, next) {
		for (var i = 0, length = preProcessors.length; i < length; i++) {
			preProcessors[i](req, res, next, routeCfg);
		}

		processor(req, res, next);

		for (var i = 0, length = postProcessors.length; i < length; i++) {
			postProcessors[i](req, res, next, routeCfg);
		}
	};
};

/**
 * add pre processor
 *
 * @param {Function}
 *            processor request processor can deal with req,res,next
 */
exports.setupPreProcessor = function (processor) {
	preProcessors.push(processor);
};

/**
 * add post processor
 *
 * @param {Function}
 *            processor request processor can deal with req,res,next
 *
 */
exports.setupPostProcessor = function (processor) {
	postProcessors.push(processor);
};
