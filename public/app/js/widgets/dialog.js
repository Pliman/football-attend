/**
 * common dialog
 * 
 * @author <a href="mailto:sunbin235@163.com">Pliman</a>
 *
 * @param {Object}
 *            conf configuration object,sample:
 * 
 * <pre>
 * {
 * 	title : 'example',
 * 	width : 250,
 * 	bodyHTML : '&lt;a href=\'#\'&gt;aa&lt;/a&gt;',
 * 	cancelText : 'cancel',
 * 	cancelCb : function() {
 * 	},
 * 	okText : 'ok',
 * 	okCb : function() {
 * 	}
 * }
 * </pre>
 * 
 * usage:
 * 
 * <pre>
 * $.append(new Dialog({
 * 	title : 'example',
 * 	width : 250,
 * 	bodyHTML : '&lt;a href=&quot;#&quot;&gt;aa&lt;/a&gt;',
 * 	cancelText : 'cancel',
 * 	cancelCb : function() {
 * 	},
 * 	okText : 'ok',
 * 	okCb : function() {
 * 	}
 * }).show());
 * </pre>
 */

define(['bootstrap'], function(){
	var Dialog = function(conf) {
		this._dom = null;
		this._conf = conf;
		this._cancelCb = conf.cancelCb;
		this._okCb = conf._okCb;
		this._width = conf.width;

		this._createDom(conf);
	};

// create jquery dom object
	Dialog.prototype._createDom = function(conf) {
		var dialogStart = "<div id=\"modal" + new Date().getTime() + "\"/>";
		var dom = this._dom = $(dialogStart).addClass("modal hide");

		conf.width && dom.width(conf.width);

		var header = $("<div />").addClass("modal-header").append(
				$("<button type=\"button\" data-dismiss=\"modal\"/>").addClass("close").text("x")).append(
				$("<h4 id=\"dTitle\"/>").text(conf.title));
		dom.append(header);

		var body = $("<div id=\"dBody\"/>").addClass("modal-body").html(conf.bodyHTML);
		dom.append(body);

		var footer = $("<div />").addClass("modal-footer");
		conf.cancelText
		&& footer.append($("<a id=\"dCancel\" href=\"javascript:void(0)\" data-dismiss=\"modal\"/>")
			.addClass("btn").text(conf.cancelText).bind("click", conf.cancelCb));
		conf.okText
		&& footer.append($("<a id=\"dOk\" href=\"javascript:void(0)\" data-dismiss=\"modal\"/>").addClass(
			"btn btn-primary").text(conf.okText).bind("click", conf.okCb));
		dom.append(footer);

		$(document).append(dom);
	};

	/**
	 * show dialog horizontal center
	 */
	Dialog.prototype.show = function() {
		var clientWidth = $(document).width();
		var left = (clientWidth - (this._width ? this._width : 560)) / 2 + 280;
		this._dom.css("left", left);

		this._dom.modal({
			show : true,
			backdrop : "static"
		});
	};

	/**
	 * hide dialog
	 */
	Dialog.prototype.hide = function() {
		this._dom.modal("hide");
	};

	/**
	 * get or set dialog title
	 *
	 * @param {String}
	 *            title dialog title
	 */
	Dialog.prototype.title = function(title) {
		if (title) {
			$("#dTitle", this._dom).text(title);
		} else {
			return $("#dTitle", this._dom).text();
		}

	};

	/**
	 * get or set dialog body
	 *
	 * @param {String}
	 *            body dialog body
	 */
	Dialog.prototype.body = function(body) {
		if (body) {
			$("#dBody", this._dom).html(body);
		} else {
			return $("#dBody", this._dom).html();
		}
	};

	/**
	 * set dialog body using jquery dom object
	 *
	 * @param {Object}
	 *            body jquery dom object
	 */
	Dialog.prototype.appendBody = function(body) {
		body && $("#dBody", this._dom).append(body);
	};

	/**
	 * get dialog body
	 *
	 * @param {Object}
	 *            body jquery dom object
	 */
	Dialog.prototype.getBody = function() {
		return $("#dBody", this._dom);
	};

	/**
	 * get or set dialog cancel btn text
	 *
	 * @param {String}
	 *            text cancel btn text
	 */
	Dialog.prototype.cancelText = function(text) {
		if (this._conf.cancelText) {
			if (text) {
				$("#dCancel", this._dom).text(text);
			} else {
				return $("#dCancel", this._dom).text(text);
			}
		}
	};

	/**
	 * set cancel callback function
	 *
	 * @param {Function}
	 *            cb callback function
	 */
	Dialog.prototype.cancelCb = function(cb) {
		if (this._conf.cancelText) {
			if (cb) {
				$("#dCancel", this._dom).unbind("click", this._cancelCb);
				$("#dCancel", this._dom).bind("click", cb);
			}
		}
	};

	/**
	 * get or set dialog ok btn text
	 *
	 * @param {String}
	 *            text ok btn text
	 */
	Dialog.prototype.okText = function(text) {
		if (this._conf.okText) {
			if (text) {
				$("#dOk", this._dom).text(text);
			} else {
				return $("#dOk", this._dom).text(text);
			}
		}
	};

	/**
	 * set ok callback function
	 *
	 * @param {Function}
	 *            cb callback function
	 */
	Dialog.prototype.okCb = function(cb) {
		if (this._conf.okText) {
			if (cb) {
				$("#dOk", this._dom).unbind("click", this._okCb);
				$("#dOk", this._dom).bind("click", cb);
			}
		}
	};

	/**
	 * get/set dialog width
	 *
	 * @param {Number}
	 *            width dialog width
	 */
	Dialog.prototype.width = function(width) {
		this._dom.width(width);
	};

	/**
	 * destroy dialog
	 */
	Dialog.prototype.destroy = function() {
		this._dom.remove();
	};

	return Dialog;
});
