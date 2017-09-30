window.YOUNG_USER_INFO = (function() {
	var _deviceId = null; //当前设备编号
	var _userInfo = {};
	/**
	 * 开始函数
	 */
	var _start = function() {
		if(DEBUG) console.log('=====执行  YOUNG_USER_INFO _start');
		_init();
		_bind();
		_getUserInfo();
	}

	/**
	 * 初始化
	 */
	var _init = function() {
		if(DEBUG) console.log('=====执行  YOUNG_USER_INFO _init');
		var deviceObj = JSON.parse(COM.getStorage(STORAGE.device) || '{"alias":"我的"}');
		COM.addHN(false, '“' + deviceObj.alias + '”的使用者信息', CONST_MENU.home, true);
		COM.back();
		COM.addReload(function() {
			location.href = location.href;
		});
		_deviceId = deviceObj.device_name;
	}
	/**
	 * 绑定点击事件
	 */
	var _bind = function() {
		if(DEBUG) console.log('=====执行  YOUNG_USER_INFO _bind');
		mui('#com_body').pullToRefresh({
			down: {
				callback: function() {
					setTimeout(function() {
						location.href = location.href;
					}, 1000);
				}
			}
		});
		var _cancelFuc = function() {
			console.log("取消点击函数已执行 可不传入");
		}
		var _sureFuc = function(obj) {
			var tmp = obj[0];
			var elem = mui('#' + tmp.id + '>.si_span');
			if(tmp.type === 'radio') {
				if(_userInfo[tmp.id] != tmp.text) {
					_updateUserInfo(tmp.id, tmp.text, elem);
				}
			} else {
				if(tmp.value && _userInfo[tmp.id] != tmp.value) {
					_updateUserInfo(tmp.id, tmp.value, elem);
				}
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
	}

	/**
	 * 更新用户信息
	 */
	var _updateUserInfo = function(key, value,elem) {
		var t = {};
		t[key] = value;
		t.device_id = _deviceId;
		var ajaxObj = {
			url: URL.deviceUpdateUser,
			data: t,
			success: function() {
				elem[0].innerHTML = value;
//				mui.toast('更新成功');
			},
			error:function(){
				mui.toast('更新失败啦，请稍后再试');
			}
		}
		if(DEBUG) console.log('==========调用 COM.ajax');
		COM.ajax(ajaxObj);
	}

	/**
	 * 获取床垫的使用者信息
	 */
	var _getUserInfo = function() {
		var ajaxObj = {
			url: URL.deviceGetUser,
			data: {
				device_id: _deviceId
			},
			success: function(data) {
				if(DEBUG) console.log('==========COM.ajax回调函数');
				if(data && data.flag) {
					var obj = _userInfo = data.params[0] || {};
					mui('#name>.si_span')[0].innerHTML = obj.name || '未录入';
					mui('#sex>.si_span')[0].innerHTML = obj.sex || '未录入';
					mui('#birth>.si_span')[0].innerHTML = obj.birth || '未录入';
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