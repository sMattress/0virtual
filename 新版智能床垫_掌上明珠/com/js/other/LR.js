/**
 * 注册和登录 方法
 */
LR = (function() {
	var nowId = null; //记录当前是 登录还是 注册
	var phoneNub = null; //注册手机号
	var passNub = null; //登录密码
	var phoneFlag = false; //手机号格式
	var isAjax = false; //是否正在请求数据 
	var t1 = null;
	var t2 = null;
	/**
	 * 显示登录
	 */
	var _showLogin = function() {
		this.style.opacity = 1;
		this.next().style.opacity = 0.3;
		mui("#login_go")[0].style.display = "block";
		mui("#register_go")[0].style.display = "none";
	}
	/**
	 * 显示注册
	 */
	var _showRegister = function() {
		this.style.opacity = 1;
		this.prev().style.opacity = 0.3;
		mui("#login_go")[0].style.display = "none";
		mui("#register_go")[0].style.display = "block";
	}

	/**
	 * 校验登录和注册的信息 返回true代表校验成功
	 */
	var _checkInfo = function() {
		var accountElem = mui("#account")[0];
		accountElem.blur();
		phoneNub = accountElem.value;
		if(!/\d{11}/.test(phoneNub)) {
			return {
				text: '手机号格式不正确',
				elem: accountElem
			}
		}
		var pwdElem = mui("#password")[0];
		pwdElem.blur();
		passNub = pwdElem.value;
		if(passNub.length === 0) {
			return {
				text: '密码不能为空',
				elem: pwdElem
			};
		}
		if(passNub.length < 8) {
			return {
				text: '密码长度不小于8',
				elem: pwdElem
			};
		}
		return true;
	}

	/**
	 * 登录和注册之前的校验
	 */
	var _LRBefore = function(type) {
		var check = _checkInfo();
		if(check === true) {
//			if(isAjax) {
//				return;
//			}
			COM.createLoading('正在登录...');
			isAjax = true;
			if(type === 'L') { //登录
				_doLogin();
			} else { //注册
				_register();
			}
		} else {
			mui.toast(check.text);
			_inputFocus.call(check.elem);
		}
	}
	/**
	 * 清除以前的view 
	 * 用户点击退出登录时 以前的view未清除，再登录会出现bug
	 */
	var _clearView = function() {
		var views = plus.webview.all();
		var nowView = plus.webview.currentWebview();
		for(var i = 0; i < views.length; i++) {
			if(nowView !== views[i]) {
				plus.webview.close(views[i]);
			}
		}
	}

	/**
	 * 登录操作
	 */
	var _doLogin = function() {
		var obj = {
			url: URL.loginCode,
			data: {
				account: phoneNub
			},
			type: "get",
			sign: false,
			success: _pwdLogin,
			errorText: "进入登录失败"
		}
		if(DEBUG) console.log("_doLogin 开始请求数据..");
		COM.ajax(obj);
	}
	/**
	 * 密码登录
	 */
	var _pwdLogin = function(data) {
		if(data && data.flag) {
			console.log('_doLogin data:' + JSON.stringify(data));
			var securePassword = CryptoJS.MD5(passNub + data.params[0].code);
			var url = URL.login + "?account=" + phoneNub + "&password=" + securePassword;
			var obj = {
				url: url,
				data: {},
				type: "GET",
				sign: false,
				success: function(data) {
					if(data && data.flag) {
						console.log('_pwdLogin data:' + JSON.stringify(data));
						if(data.err_code == 0) {
							console.log('已进入');
							
							COM.setStorage(STORAGE.account, phoneNub);
							COM.setStorage(STORAGE.token, data.params[0].token);
							DEVICE.getDeviceList(function() {
								isAjax = false;
								COM.closeLoading();
								COM.openWindow('liliao_device_list', '../../../liliao/html/device/liliao_device_list.html');
							});
						} else {
							console.log('已进入');
							COM.closeLoading();
						}
					}
				},
				errorText: "登录失败"
			}
			if(DEBUG) console.log("_pwdLogin 开始请求数据..");
			COM.ajax(obj);
		} else {
			isAjax = false;
			COM.closeLoading();
		}
	}
	/**
	 * 用户注册
	 */
	var _register = function() {
		var obj = {
			url: URL.register,
			data: {
				account: phoneNub,
				password: passNub
			},
			sign: false,
			success: function(data) {
				console.log('data===>' + JSON.stringify(data));
				if(data && data.flag) {
					_doLogin();
				}else{
					COM.closeLoading();
				}
			},
			errorText: "注册失败"
		}
		if(DEBUG) console.log("_register 开始请求数据..");
		COM.ajax(obj);
	}

	/**
	 * 绑定点击事件
	 */
	var _bindClick = function() {
		mui("#com_LR").on("tap", ".elem-click", function() {
			var id = this.getAttribute("id");
//			console.log('tap已触发==id'+id+";nowId===>"+nowId);
			if(nowId === id) {
				return;
			}
			switch(id) {
				case "login_change":
					nowId = id;
					_showLogin.call(this);
					break;
				case "register_change":
					nowId = id;
					_showRegister.call(this);
					break;
				case "login_go":
					_LRBefore('L');
					break;
				case "register_go":
					_LRBefore('R');
					break;
				case "forgetPassword":
					//COM.openWindow("reset_pwd");
					break;
			}
		});
		mui("#account")[0].onkeyup = function(e) {
			if(e.keyCode == 13) {
				_inputFocus.call(mui('#password')[0]);
			}
		};
		mui('#password')[0].onkeyup = function(e) {
			if(e.keyCode == 13) {
				if(nowId === 'login_change') {
					_LRBefore('L');
				} else {
					_LRBefore('R');
				}
			}
		}
	}

	/**
	 * 触发focus事件
	 * @param {Object} elem 将触发的元素
	 */
	var _inputFocus = function(elem) {
		elem = elem || this;
		var pos = elem.value.length;
		if(elem.setSelectionRange) {
			elem.focus();
			elem.setSelectionRange(pos, pos);
		} else if(elem.createTextRange) {
			var range = elem.createTextRange();
			range.collapse(true);
			range.moveEnd('character', pos);
			range.moveStart('character', pos);
			range.select();
		}
	}
	/**
	 * 开始函数
	 */
	var _start = function() {
		if(DEBUG) console.log("LR.start => 函数已执行");
		COM.back();
		//		COM.addReload(function(){
		//			_clearView();
		//		});
		//		_clearView();
		nowId = "login_change";
		_bindClick();
	}

	return {
		start: _start
	}
})();