var UserController = module.exports = {};

var mongo = require('../mongo');

UserController.getUsers = function (req, res, next) {
	mongo.find('users', {}, {}, function (err, r) {
		res.send(r);
	});
}
