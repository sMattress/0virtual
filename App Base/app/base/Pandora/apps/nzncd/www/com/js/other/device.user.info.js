window.DEVICE_USER_INFO = (function() {

	var _deviceId = null;
	var _userInfo = {};
	/**
	 * 开始函数
	 */
	var _start = function() {
		if(DEBUG) console.log('=====执行 DEVICE_USER_INFO _start');
		_init();
		_bind();
	}

	/**
	 * 初始化
	 */
	var _init = function() {
		if(DEBUG) console.log('=====执行 DEVICE_USER_INFO _init');
		COM.addHN(false, "设备使用者信息", false, false);
		COM.back();
		COM.addReload(function() {
			mui('#name>.si_span')[0].innerHTML = '';
			mui('#sex>.si_span')[0].innerHTML = '';
			mui('#birth>.si_span')[0].innerHTML = '';
		})
		_deviceId = COM.getStorage(STORAGE.deviceUserInfoId);
		if(DEBUG) console.log('=_deviceId===='+_deviceId);
		_getUserInfo();
//		_deviceId = 'd8b04cb5929c';
//		DEVICE.bindDevice(_deviceId, function(data) {
//			
//		});
	}
	/**
	 * 绑定点击事件
	 */
	var _bind = function() {
		if(DEBUG) console.log('=====正在执行DEVICE_USER_INFO _bind');
		var _cancelFuc = function() {
			console.log("取消点击函数已执行 可不传入");
		}
		var _sureFuc = function(obj) {
			var tmp = obj[0];
			var elem = mui('#' + tmp.id + '>.si_span');
			if(tmp.type === 'radio') {
				elem[0].innerHTML = tmp.text;
				_userInfo[tmp.id] = tmp.text;
			} else {
				elem[0].innerHTML = tmp.value;
				_userInfo[tmp.id] = tmp.value;
			}
			COM.closeMark();
		}

		mui("#self_info").on("tap", "a", function() {
			TRANSFER.selfInfo = {};
			var id = TRANSFER.selfInfo.id = this.getAttribute('id');
			var title = TRANSFER.selfInfo.type = this.getAttribute('title');
			var value = TRANSFER.selfInfo.value = this.getElementsByClassName('si_span')[0].innerText;
			if(title === "input") { //输入框类型
				TRANSFER.selfInfo.text = '姓名';
				COM.createMarkBody([TRANSFER.selfInfo], _sureFuc, _cancelFuc);
			} else if(title === "radio") { //下拉框类型
				var v = COM.getStorage(STORAGE[id + "_v"]);
				TRANSFER.selfInfo.value = value == '女' ? 0 : 1;
				TRANSFER.selfInfo.child = [{
					text: "男",
					value: 1
				}, {
					text: "女",
					value: 0
				}];
				COM.createMarkBody([TRANSFER.selfInfo], _sureFuc, _cancelFuc);
			} else if(title === "date") {
				var self = this;
				var t = new Date(value).format('yyyy-MM-dd');
				var picker = new mui.DtPicker({
					"type": "date",
					"beginYear": 1980,
					"endYear": new Date().getFullYear(),
					"value": t
				});

				picker.show(function(rs) {
					TRANSFER.selfInfo.value = rs.text.replaceAll('-', '/');
					_sureFuc([TRANSFER.selfInfo]);
					picker.dispose();
				});
			} else {
				console.log("发现未匹配的title =>" + title);
			}
		});

		mui('#self_info').on('tap', 'button', _saveUserInfo);
	}

	/**
	 * 保存用户信息
	 */
	var _saveUserInfo = function() {
		if(DEBUG) console.log('=====正在执行DEVICE_USER_INFO _saveUserInfo');
		if(!_userInfo.name) {
			mui.toast('请输入床垫使用者的姓名!');
			return;
		}
		if(!_userInfo.sex) {
			mui.toast('请输入床垫使用者的性别!');
			return;
		}
		if(!_userInfo.birth) {
			mui.toast('请输入床垫使用者的出生日期!');
			return;
		}
		_userInfo.device_id = _deviceId;
		var ajaxObj = {
			url: URL.deviceBindUser,
			data: _userInfo,
			success: function(rs) {
				COM.openWindow('device', undefined, true);
			},
			error: function() {
				mui.alert('保存出错了，稍会儿再试吧');
			}
		}
		if(DEBUG) console.log('==========正在执行COM.ajax');
		COM.ajax(ajaxObj);
		//		ajaxObj.success();
	}
	/**
	 * 获取床垫的使用者信息
	 */
	var _getUserInfo = function() {
		if(DEBUG) console.log('=====正在执行DEVICE_USER_INFO _getUserInfo');
		var ajaxObj = {
			url: URL.deviceGetUser,
			data: {
				device_id: _deviceId
			},
			success: function(data) {
				if(DEBUG) console.log('==========COM.ajax回调函数');
				if(data && data.flag) {
					var obj = _userInfo = data.params[0] || {};
					mui('#name>.si_span')[0].innerHTML = obj.name || '';
					mui('#sex>.si_span')[0].innerHTML = obj.sex || '';
					mui('#birth>.si_span')[0].innerHTML = obj.birth || '';
				} else {
					mui.toast('获取不到数据啦，下拉刷新试试');
				}
			}
		};
		if(DEBUG) console.log('==========调用 COM.ajax');
		COM.ajax(ajaxObj);
	}
	return {
		start: _start
	}
})();