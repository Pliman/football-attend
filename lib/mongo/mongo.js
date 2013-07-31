var db = module.exports = {};

var mongodb = require('mongodb');
var ObjectID = db.ObjectID = require('mongodb').ObjectID;

var mongoDBConf = require('../../etc').mongoDB;
var generic_pool = require('generic-pool');
var node_uuid = require('node-uuid');
var logger = require("../log").getLogger('mongoDB'), poolLogger = require("../log").getLogger('mongoDB POOL');

var pool = generic_pool.Pool({
	name: 'cubrid-node-pool',
	max: mongoDBConf.max_connection || 10,
	create: function (callback) {
		try {
			new mongodb.Db(mongoDBConf.dbName, new mongodb.Server(mongoDBConf.host, mongoDBConf.port, {}), {
				w: 1
			}).open(function (err, client) {
					if (err) {
						logger.error("mongoDB connect error:%s", err.toString());
					} else {
						logger.info("mongoDB connected successfully.");
					}

					callback(err, client);
				});
		} catch (e) {
			console && console.log("[create] create mongoDB connection failed:%s.", e.toString());
			logger.error("[create] create mongoDB connection failed:%s.", e.toString());
		}
	},
	destroy: function (client) {
		try {
			client.close();
		} catch (e) {
			console && console.log("[destroy] destroy mongoDB connection failed:%s.", e.toString());
			logger.error("[destroy] destroy mongoDB connection failed:%s.", e.toString());
		}
	},
	idleTimeoutMillis: 30000,
	priorityRange: 3,
	log: function (info, level) {
		if (mongoDBConf.mode === "development") {
			poolLogger.verbose = function (msg) {
				console && console.log(msg);
				poolLogger.info(msg);
			};
		} else {
			poolLogger.verbose = function () {
			};
		}
		poolLogger[level]("[database pool info] " + info);
	}
});

// print pool information
var _printPoolInfo = function () {
	if (mongoDBConf.mode === "development") {
		if (console) {
			console.log("pool name: %s", pool.getName());
			console.log("pool size: %s", pool.getPoolSize());
			console.log("pool available objects count: %s", pool.availableObjectsCount());
			console.log("pool waiting clients count: %s", pool.waitingClientsCount());
		}

		logger.info("[_printPoolInfo] pool name: %s", pool.getName());
		logger.info("[_printPoolInfo] pool size: %s", pool.getPoolSize());
		logger.info("[_printPoolInfo] pool available objects count: %s", pool.availableObjectsCount());
		logger.info("[_printPoolInfo] pool waiting clients count: %s", pool.waitingClientsCount());
	}
};

/**
 * save entity
 * @param {String} collection collection want save to
 * @param {Object}/{Array} entity entity need to be saved, if save array, only the first record was returned
 * @param {Object} cb callback function
 */
// TODO Pliman Level2 处理选项
db.save = function (collection, entity, cb) {
	_printPoolInfo();

	try {
		pool.acquire(function (err, client) {
			if (err) {
				logger.error("[save] error acquiring connection from pool:%s, when saving collection:%s,entity is %s", err.toString(), collection, JSON.stringify(entity));

				cb(err);
				return;
			}

			var uuid = node_uuid.v4();
			logger.info("[save] start save %s, collection is:%s, entity is %s", uuid, collection, JSON.stringify(entity));
			new mongodb.Collection(client, collection).save(entity, function (err, r) {
				if (err) {
					logger.error("[save] save %s failed,err is %s", uuid, err);
				} else {
					logger.info("[save] save %s successfully", uuid);
				}

				pool.release(client);
				cb(err, r);
			});
		});
	} catch (e) {
		console && console.log("[save] acquire mongoDB connection failed:%s. when saving collection:%s, entity is %s", e.toString(), collection, JSON.stringify(entity));
		logger.error("[save] acquire mongoDB connection failed:%s. when saving collection:%s, entity is %s", e.toString(), collection, JSON.stringify(entity));
		cb(e.toString());
	}
};

/**
 * find entity
 * @param {String} collection collection want find
 * @param {Object} entity entity need to be find
 * @param {Object} projections projections to limit the query
 * @param {Number} skip skip record count
 * @param {Number} limit limit record count
 * @param {Object} cb callback function
 */
// TODO Pliman Level2 处理选项
db.find = function (collection, entity, projections, skip, limit, cb) {
	if (!cb) {
		cb = skip;
		skip = 0;
		limit = limit || 100;
	}

	_printPoolInfo();

	try {
		pool.acquire(function (err, client) {
			if (err) {
				logger.error("[find] error acquiring connection from pool:%s, when finding collection:%s,entity is %s", err.toString(), collection, JSON.stringify(entity));

				cb(err);
				return;
			}

			var uuid = node_uuid.v4();
			logger.info("[find] start find %s, collection is:%s, entity is %s", uuid, collection, JSON.stringify(entity));
			new mongodb.Collection(client, collection).find(entity, projections).skip(skip).limit(limit, function (err, r) {
				if (err) {
					logger.error("[find] find %s failed,err is %s", uuid, err);

					pool.release(client);
					cb(err);
				} else {
					logger.info("[find] find %s successfully", uuid);

					logger.info("[find] find %s toArray start", uuid);
					r.toArray(function (err, r) {
						if (err) {
							logger.error("[find] find %s toArray failed,err is %s", uuid, err);
						} else {
							logger.info("[find] find %s toArray successfully", uuid);
						}

						pool.release(client);
						cb(err, r);
					});
				}
			});
		});
	} catch (e) {
		console && console.log("[find] acquire mongoDB connection failed:%s. when finding collection:%s, entity is %s", e.toString(), collection, JSON.stringify(entity));
		logger.error("[find] acquire mongoDB connection failed:%s. when finding collection:%s, entity is %s", e.toString(), collection, JSON.stringify(entity));
		cb(e.toString());
	}
};

/**
 * find one entity
 * @param {String} collection collection want find
 * @param {Object} entity entity need to be find
 * @param {Object} projections projections to limit the query
 * @param {Object} cb callback function
 */
// TODO Pliman Level2 处理选项
db.findOne = function (collection, entity, projections, cb) {
	_printPoolInfo();

	try {
		pool.acquire(function (err, client) {
			if (err) {
				logger.error("[findOne] error acquiring connection from pool:%s, when finding one collection:%s,entity is %s", err.toString(), collection, JSON.stringify(entity));

				cb(err);
				return;
			}

			var uuid = node_uuid.v4();
			logger.info("[findOne] start find one %s, collection is:%s, entity is %s", uuid, collection, JSON.stringify(entity));
			new mongodb.Collection(client, collection).findOne(entity, projections, function (err, r) {
				if (err) {
					logger.error("[findOne] find one %s failed,err is %s", uuid, err);

					pool.release(client);
					cb(err);
				} else {
					logger.info("[findOne] find one %s successfully", uuid);

					pool.release(client);
					cb(null, r);
				}
			});
		});
	} catch (e) {
		console && console.log("[findOne] acquire mongoDB connection failed:%s. when finding one collection:%s, entity is %s", e.toString(), collection, JSON.stringify(entity));
		logger.error("[findOne] acquire mongoDB connection failed:%s. when finding one collection:%s, entity is %s", e.toString(), collection, JSON.stringify(entity));
		cb(e.toString());
	}
};

/**
 * update entity
 * @param {String} collection collection want update
 * @param {Object} entity entity need to be update
 * @param {Object} cb callback function
 */
// TODO Pliman Level2 将update选项分离出来
db.update = function (collection, criteria, entity, cb) {
	_printPoolInfo();

	try {
		pool.acquire(function (err, client) {
			if (err) {
				logger.error("[update] error acquiring connection from pool:%s, when updatding collection:%s,entity is %s", err.toString(), collection, JSON.stringify(entity));

				cb(err);
				return;
			}

			var uuid = node_uuid.v4();
			logger.info("[update] start update %s, collection is:%s, entity is %s", uuid, collection, JSON.stringify(entity));
			new mongodb.Collection(client, collection).update(criteria, {'$set': entity}, {
				safe: true,
				upsert: true
			}, function (err, r) {
				if (err) {
					logger.error("[update] update %s failed,err is %s", uuid, err);
				} else {
					logger.info("[update] update %s successfully", uuid);
				}

				pool.release(client);
				cb(err, r);
			});
		});
	} catch (e) {
		console && console.log("[update] acquire mongoDB connection failed:%s. when updatding collection:%s, entity is %s", e.toString(), collection, JSON.stringify(entity));
		logger.error("[update] acquire mongoDB connection failed:%s. when updatding collection:%s, entity is %s", e.toString(), collection, JSON.stringify(entity));
		cb(e.toString());
	}
};

/**
 * remove entitys
 * @param {String} collection collection want remove
 * @param {Object} entity entity need to be removed
 * @param {Object} cb callback function
 */
db.remove = function (collection, entity, cb) {
	_printPoolInfo();

	try {
		pool.acquire(function (err, client) {
			if (err) {
				logger.error("[remove] error acquiring connection from pool:%s, when removing collection:%s,entity is %s", err.toString(), collection, JSON.stringify(entity));

				cb(err);
				return;
			}

			var uuid = node_uuid.v4();
			logger.info("[remove] start remove %s, collection is:%s, entity is %s", uuid, collection, JSON.stringify(entity));
			new mongodb.Collection(client, collection).remove(entity, function (err, r) {
				if (err) {
					logger.error("[remove] remove %s failed,err is %s", uuid, err);
				} else {
					logger.info("[remove] remove %s successfully", uuid);
				}

				pool.release(client);
				cb(err, r);
			});
		});
	} catch (e) {
		console && console.log("[save] acquire mongoDB connection failed:%s. when removing collection:%s, entity is %s", e.toString(), collection, JSON.stringify(entity));
		logger.error("[save] acquire mongoDB connection failed:%s. when removing collection:%s, entity is %s", e.toString(), collection, JSON.stringify(entity));
		cb(e.toString());
	}
};

//db.save('user', [{
//	id : 1,
//	name : "White"
//}, {
//	id : 2,
//	name : "Black"
//}], {}, function(err, r) {
//	console.log(r);
//});

// db.find('user', {
// _id : new ObjectID('51598558c1dd0e2017000001')
// }, {}, function(err, r) {
// console.log(r);
// });

// db.find('user', {}, {}, 1,2, function(err, r) {
// console.log(r);
// });

// db.update('user', {
// id : 3
// },{id:1,name:"Sue"}, function(err, r) {
// console.log(err);
// console.log(r);
// });

// db.remove('user', {
// id : 2
// }, function(err, r) {
// console.log(err);
// console.log(r);
// });
