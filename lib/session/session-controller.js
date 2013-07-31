var SessionController = module.exports = {};

SessionController.getSession = function (req, res, next) {
	var user = req.session.user;

	if (user) {
		res.send({"result": "SUCCESS", "data": user, "msg": "Got session successfully."});
	} else {
		res.send({"result": "FAIL", "data": "", "msg": "get session Failed."});
	}
}

SessionController.setSession = function (req, res, next) {
	var user = req.param("user");

	if (user) {
		req.session.user = user;
		res.send({"result": "SUCCESS", "data": "", "msg": "Session set successfully."});
	} else {
		res.send({"result": "FAIL", "data": "", "msg": "Set session Failed."});
	}
}
