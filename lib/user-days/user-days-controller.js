var UserDaysController = module.exports = {};

var mongo = require('../mongo');

UserDaysController.getUserDays = function (req, res, next) {
	mongo.find('user-days', {}, {}, function (err, r) {
		res.send(r);
	});
}

UserDaysController.saveUserDays = function (req, res, next) {
	var userDays = req.param("userDays");
	mongo.find('user-days', {"name": userDays.name}, {}, function (err, r) {
		if (err) {
			logger.error("save userDays: %s failed error: %s", JSON.stringify(userDays), err);
			res.send({"result": "FAIL", "data": "", "msg": "保存失败，我好像出故障了，帮我喊下管理员嘛."});
		} else {
			if (userDays.version > r[0].version){
				delete(userDays._id);

				mongo.update('user-days', {"name": userDays.name}, req.param("userDays"), function (err, r) {
					if (!err) {
						res.send({"result": "SUCCESS", "data": "", "msg": "恭喜恭喜，保存成功."});
					} else {
						res.send({"result": "FAIL", "data": "", "msg": "保存失败，我好像出故障了，帮我喊下管理员嘛."});
					}
				});
			} else {
				res.send({"result": "FAIL", "data": "", "msg": "保存失败，某童鞋已经修改了计划，请刷页面同步数据"});
			}
		}
	});
};
