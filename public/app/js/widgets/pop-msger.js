/**
 * @param {String}
 *            alertText text that will display in alert
 * @param {String}
 *            alertType alert type, this will decide alert bar color,currently
 *            support: success -- a green bar, info -- a blue bar, error -- a
 *            red bar
 * @param {Number}
 *            lastTime designate how long will the bar displays in millisecond,
 *            0 for display forever
 */
define(['jQuery', 'bootstrap'], function ($) {
	var PopMsger = function (alertText, alertType, lastTime) {
		this.isPoping = false;
		this.alertType = alertType;
		this.lastTime = lastTime;
		this._dom = this._createDom(alertText, alertType);

		lastTime && lastTime != 0 && (this._intervalId = window.setInterval(this.close.bind(this), lastTime));
		this.isPoping = true;
	};

	// create dom structure
	PopMsger.prototype._createDom = function (alertText, alertType) {
		var alertDom = this.alertDom = $("<div/>").addClass("alert alert-" + alertType + " fade in clearfix");
		alertDom.html("<div style=\"float:left;width:87%\">" + alertText + "</div>");

		var btn = $("<button/>").addClass('close');
		btn.text('x');
		btn.attr("data-dismiss", "alert");
		btn.bind("click", this.clear.bind(this));

		alertDom.append(btn);

		return alertDom;
	};

	// close pop alert
	PopMsger.prototype.close = function () {
		this._intervalId && window.clearInterval(this._intervalId);
		this.isPoping = false;
		this._dom.alert('close');
	};

	//clear timer pop alert
	PopMsger.prototype.clear = function () {
		this._intervalId && window.clearInterval(this._intervalId);
		this.isPoping = false;
	};

	/**
	 * re alert: quickly flash if dom is not disappeared
	 */
	PopMsger.prototype.reMsg = function () {
		// if is realerting, return immediately.
		if (this._flashInteval) {
			return;
		}

		var alertColor = {
			success: [ '#DFF0D8', '#F6F6F6' ],
			info: [ '#D9EDF7', '#F6F6F6' ],
			error: [ '#F2DEDE', '#F6F6F6' ]
		};
		var times = 6;

		var orgColor = alertColor[this.alertType][0];
		var alterColor = alertColor[this.alertType][1];
		var currentColor = orgColor;

		this.resetInterval();
		this._flashInteval = window.setInterval(function () {
			if (times > 0 && this.alertDom) {
				if (currentColor == orgColor) {
					this.alertDom.css("background", alterColor);
					currentColor = alterColor;
				} else {
					this.alertDom.css("background", orgColor);
					currentColor = orgColor;
				}
				times--;
			} else {
				window.clearInterval(this._flashInteval);
				this._flashInteval = null;
			}
		}.bind(this), 100)
	};

	// reset pop alert interval. Currently used to extend display time after
	// reMsged.
	PopMsger.prototype.resetInterval = function () {
		this._intervalId && window.clearInterval(this._intervalId);

		this._intervalId = window.setInterval(this.close.bind(this), this.lastTime)
	};

	/**
	 * pop alert helper
	 *
	 * @param {PopMsger}
	 *            popMsger popMsger object
	 * @param {Object}
	 *            container container that contains pop alert
	 * @param {String}identifier
	 *            identifier for this pop alert
	 */
	var POP_MSGER_NS = {};
	PopMsger.setupPopMsger = function (popMsger, container, identifier) {
		if (POP_MSGER_NS[identifier] && POP_MSGER_NS[identifier].isPoping) {
			POP_MSGER_NS[identifier].reMsg();
		} else {
			delete (POP_MSGER_NS[identifier]);

			POP_MSGER_NS[identifier] = popMsger;
			container.append(POP_MSGER_NS[identifier]._dom);
			// In IE8, to fix append bug, we need to add extra div to refresh dom
			// immediately
			container.append($("<div style=\"display:none\"/>"));
		}
	};

	return PopMsger;
});
