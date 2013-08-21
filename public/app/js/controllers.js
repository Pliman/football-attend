'use strict';

/* Controllers */
define(['jQuery', 'underscore', 'angular', 'popMsger', 'angularUiRouter', './services'], function ($, _, angular, popMsger) {
	return angular.module('attendee.controllers', ['attendee.services'])
		.controller('users', ['$scope', '$state', 'users', '$rootScope', "session", function ($scope, $state, users, $rootScope, session) {
			users.get(function (users) {
				$scope.users = users;
			});

			$scope.loginWithUser = function (userName, nickName) {
				var user = { "name": userName, "nickName": nickName};

				session.save({"user": user}, function (rtn) {
					if (rtn.result === "SUCCESS") {
						$rootScope.currentUser = user;
						$state.transitionTo('vote');
					}
				});
			};
		}])
		.controller('vote', ['$rootScope', '$scope', '$state', '$stateParams', 'weekdays', "weekdaysStatistic", 'userDays', "session",
			function ($rootScope, $scope, $state, $stateParams, weekdays, weekdaysStatistic, userDays, session) {
				var currentUserName = null;

				var absentDay = function (day) {
					delete($scope.currentUserAttend[day]);
					$scope.currentUserDay.available = _.without($scope.currentUserDay.available, day);
					$scope.weekdaysStatistic[day].attendees = _.without($scope.weekdaysStatistic[day].attendees, currentUserName);

					notDriveCar(day);
				};

				var attendDay = function (day) {
					$scope.currentUserAttend[day] = day;
					$scope.weekdaysStatistic[day].attendees.push(currentUserName);

					$scope.currentUserDay.available.push(day);
				};

				var saveUserDay = function (userDay, type, callback) {
					userDay.version += 1;
					userDays.save({"userDays": userDay}, function (rtn) {
						if (rtn.result === 'SUCCESS') {
							popMsger.setupPopMsger(new popMsger(rtn.msg, "success", 5000), $('#msger'),
								type + "Succ");
							callback && callback(null, rtn);
						} else {
							popMsger.setupPopMsger(new popMsger(rtn.msg, "error", 20000), $('#msger'),
								type + "Fail");
							callback && callback(rtn);
						}
					});
				};

				var driveCar = function (day) {
					addCar(day);
					var car = {"day": day, "passengers": []};
					$scope.currentUserDay.cars.push(car);
					$scope.currentUserCar[day] = car;
				};

				var addCar = function (day) {
					var dom = $("<div/>").addClass("tagsinput getInCar row-fluid").attr("id", day + "Car" + currentUserName);
					var html = [];
					html.push("<div class=\"span4 operater\">");
					html.push("<span class=\"tag\">" + currentUserName + "</span>");
					html.push("<a class=\"btn btn-success\" ng-click=\"getOnCar(weekday.name, car.driver)\">搭车</a>");
					html.push("<a class=\"btn btn-info\" ng-click=\"getOffCar(weekday.name, car.driver)\">下车</a>");
					html.push("</div><div class=\"span8 passenger\"></div></div>");

					dom.html(html.join(""));
					$('#' + day + "AttendeesAndCars").append(dom);
				};

				var notDriveCar = function (day) {
					$scope.currentUserDay.cars = _.without($scope.currentUserDay.cars, $scope.currentUserCar[day]);
					delete($scope.currentUserCar[day]);

					$("#" + day + "GotCar")[0].checked = false;
					$("#" + day + "Car" + currentUserName).remove();
				};

				var addPassenger = function (day, driver) {
					var doSave = false;
					$scope.userDays.forEach(function (userDay) {
						if (userDay.name === driver) {
							userDay.cars.forEach(function (car) {
								if (car.day === day) {
									if (car.passengers.length >= 4) {
										alert("这辆车人满了，另外蹭一辆吧...");
									} else {
										doSave = true;
										car.passengers.push(currentUserName);
										setTimeout(function(){
											$('#' + day + driver + currentUserName)[0] || addToCar(day, driver);
										},0);
									}
								}
							});

							doSave && saveUserDay(userDay, "TakeCar");
						}
					});

					$scope.currentUserTakeCar[day] = driver;
				};

				var addToCar = function (day, driver) {
					var dom = $('<span/>').addClass("tag ng-scope ng-binding").attr("id", day + driver + currentUserName).attr("ng-repeat", "passenger in car.passengers");
					dom.text(currentUserName);
					$('#' + day + driver).append(dom);
				};

				var removePassenger = function (day, driver) {
					$scope.userDays.forEach(function (userDay) {
						if (userDay.name === driver) {
							userDay.cars.forEach(function (car) {
								if (car.day === day) {
									car.passengers = _.without(car.passengers, currentUserName);
								}
							});

							saveUserDay(userDay, "getOffCar");
						}
					});

					$('#' + day + driver + currentUserName).remove();
				};

				var loadUserPlan = function () {
					currentUserName = $rootScope.currentUser.name
					$scope.nickName = $rootScope.currentUser.nickName;
					$scope.currentUserDay = {};

					$scope.currentUserAttend = {};
					$scope.currentUserCar = {};
					$scope.currentUserTakeCar = {};

					$scope.weekdays = weekdays;
					$scope.weekdaysStatistic = $.extend(true, {}, weekdaysStatistic);

					userDays.get(function (userDays) {
						if (!userDays) {
							return;
						}
						$scope.userDays = userDays;

						userDays.forEach(function (userDay) {
							if (userDay.name === currentUserName) {
								$scope.currentUserDay = userDay;
							}

							userDay.available.forEach(function (available) {
								$scope.weekdaysStatistic[available].attendees.push(userDay.name);

								if (userDay.name === currentUserName) {
									$scope.currentUserAttend[available] = available;
								}
							});

							userDay.cars.forEach(function (car) {
								$scope.weekdaysStatistic[car.day].cars.push($.extend({}, car, {"driver": userDay.name}));

								car.passengers.forEach(function (passenger){
									if (passenger === currentUserName) {
										$scope.currentUserTakeCar[car.day] = userDay.name;
									}
								});

								if (userDay.name === currentUserName) {
									$scope.currentUserCar[car.day] = car;
								}
							});
						});
					});

					$scope.checkGo = function (weekday) {
						// 1. 是否选中
						// 2. 是否开车
						// 3. 车里面是否有乘客
						// 4. 是否乘坐别人的车
						// 5. 今天去的总人数
						var go = $('#' + weekday + 'Go')[0].checked;
						var drive = $("#" + weekday + "GotCar")[0].checked;
						var havePassenger = $scope.currentUserCar[weekday] && $scope.currentUserCar[weekday].passengers.length;
						var takeCar = !$.isEmptyObject($scope.currentUserTakeCar);

						if (go) {
							attendDay(weekday);

							saveUserDay($scope.currentUserDay, "addDay");
						} else {
							if (drive && havePassenger) {
								if (!confirm("已经有同事选择做您的车了，您不切，取消的车位情况无法恢复，确定要临阵脱逃？")) {
									$("#" + weekday + "Go")[0].checked = !$("#" + weekday + "Go")[0].checked;
									return;
								}
							}

							absentDay(weekday);
							saveUserDay($scope.currentUserDay, "removeDay");
						}

						if ($scope.currentUserTakeCar[weekday]) {
							removePassenger(weekday, $scope.currentUserTakeCar[weekday]);

							delete($scope.currentUserTakeCar[weekday]);
						}

					};

					$scope.gotCar = function (weekday) {
						// 1. 是否选中
						// 2. 是否开车
						// 3. 车里面是否有乘客
						var go = $('#' + weekday + 'Go')[0].checked;
						var drive = $("#" + weekday + "GotCar")[0].checked;
						var havePassenger = $scope.currentUserCar[weekday] && $scope.currentUserCar[weekday].passengers.length;

						if (!go) {
							$('#' + weekday + 'Go')[0].checked = true;
							$scope.checkGo(weekday);
						}

						if (drive) {
							driveCar(weekday);
							saveUserDay($scope.currentUserDay, "addCar");

							if ($scope.currentUserTakeCar[weekday]) {
								removePassenger(weekday, $scope.currentUserTakeCar[weekday]);

								delete($scope.currentUserTakeCar[weekday]);
							}
						} else {
							if (!drive && havePassenger) {
								if (!confirm("已经有同事选择做您的车了，您不开车，取消的车位情况无法恢复，确定不开车了？")) {
									$("#" + weekday + "GotCar")[0].checked = !$("#" + weekday + "GotCar")[0].checked;

									return true;
								}
							}

							notDriveCar(weekday);
							saveUserDay($scope.currentUserDay, "removeCar");
						}
					};

					$scope.getOnCar = function (day, driver) {
						// 1. 添加人员
						// 2. 添加数据
						if ($('#' + day + driver + currentUserName)[0]) {
							alert ("已经上车啦，上上下下很爽么。");
							return;
						}

						if (driver === currentUserName) {
							alert("您是司机师傅，您要开车，不用搭车的。");
							return;
						}

						if (!$('#' + day + 'Go')[0].checked) {
							$('#' + day + 'Go')[0].checked = true;
							$scope.checkGo(day);
						}

						if ($("#" + day + "GotCar")[0].checked) {
							$("#" + day + "GotCar")[0].checked = false;
							if ($scope.gotCar(day)){
								return;
							}
						}

						addPassenger(day, driver);
					};

					$scope.getOffCar = function (day, driver) {
						// 1. 删除人员
						// 2. 删除数据
						removePassenger(day, driver);
					};
				};

				if (!$rootScope.currentUser) {
					session.get(function (rtn) {
						if (rtn.result === "SUCCESS") {
							$rootScope.currentUser = rtn.data;

							loadUserPlan();
						} else {
							window.location.href = "/";
						}
					});
				} else {
					loadUserPlan();
				}
			}])
});
