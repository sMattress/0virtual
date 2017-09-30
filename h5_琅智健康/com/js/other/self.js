SELF.start = function() {
	COM.addReload(function() {
		if(mui("#user_name")[0]) {
			mui("#user_name")[0].innerHTML = COM.getStorage(STORAGE.name)
		}
		SELF.getUserInfo(SELF.getUserInfoSuccess);
	});
	document.getElementById('showCode').innerHTML = '当前版本:'+VERSION.showCode;
	COM.addHN(true, '我', CONST_MENU.home);
	SELF.getUserInfo(SELF.getUserInfoSuccess);
	SELF.bindClick();
}

/**
 * SELF.getUserInfo的回调函数
 * @param {Object} data 返回的数据
 */
SELF.getUserInfoSuccess = function(data) {
	if(data && data.flag) {
		if(DEBUG) console.log('==获取用户基本信息成功 ====' + JSON.stringify(data));
		var params = data.params;
		var imgUrl = "../../img/other/LR_logo.png"; //头像url,,暂时没有

		if(mui("#user_img>.imageup")[0]) {
			mui("#user_img>.imageup")[0].innerHTML = '<img src="' + imgUrl + '" alt=""  class="log_img" id="imgId"/>';
		}
		if(imgUrl) {
			COM.setStorage(STORAGE.imgId, imgUrl);
		}
		var userGender = "未选择";
		if(params[0].sex == 0) {
			userGender = "女";
		} else if(params[0].sex == 1) {
			userGender = "男"
		} else {
			userGender = "待选择";
		}
		//缓存基本信息并赋值给详情页
		COM.setStorage(STORAGE.name, params[0].name || "智能床垫用户");
		COM.setStorage(STORAGE.sex_v, params[0].sex + "");
		COM.setStorage(STORAGE.sex, userGender);
		COM.setStorage(STORAGE.birthday, params[0].birthday);
		if(mui("#user_name")[0]) {
			mui("#user_name")[0].innerHTML = COM.getStorage(STORAGE.name)
		}
	}
}

/**
 * 获取用户基本信息
 * @param {Object} success 成功回调函数
 */
SELF.getUserInfo = function(success,error) {
	var obj = {
		url: URL.userBaseInfo,
		type: "GET",
		success: success,
		error:error,
		errorText: "获取信息失败,请稍后再尝试。"
	}
	if(DEBUG) console.log('==========调用 COM.ajax');
	COM.ajax(obj);
}

/**
 * 绑定点击事件
 */
SELF.bindClick = function() {
	mui("#self_box").on("tap", "li", function() {
		var id = this.getAttribute("id");
		if(id === "login_out") {
			mui.confirm('确认退出登录吗？', '提示', CONSTANT.confirmBtn, function(e) {
				if(e.index == CONSTANT.confirmSure) { //确定
					COM.clearStorage();
					COM.openWindow("LR", undefined, true);
				}
			});
		} else if(id === "check_update") {
			var obj = {
				url: URL.appUpdate,
				type: "GET",
				sign: false,
				data: {
					"version_code": VERSION.value,
					"version_name": VERSION.name,
					"device_type": VERSION.device_type,
					"appid": plus.runtime.appid,
					"version": plus.runtime.version,
					"imei": plus.device.imei
				},
				success: function(data) {
					if(DEBUG) console.log("" + JSON.stringify(data));
					if(data && data.flag) {
						var obj = data.params[0];
						var latest = obj.latest;
						if(latest.version_code > VERSION.value) {
							mui.confirm(latest.version_name, '版本更新', CONSTANT.confirmBtn, function(e) {
								if(e.index == CONSTANT.confirmSure) {
									plus.runtime.openURL(obj.download);
								}
							});
						} else {
							mui.toast('已是最新版本~');
						}
					} else {
						mui.toast('已是最新版本~');
					}
				},
				errorText: "获取更新信息失败"
			}
			COM.ajax(obj);
		} else {
			COM.openWindow(id);
		}
	});
}

/**
 * 个人信息开始页面
 */
SELF.selfInfoStart = function() {
	COM.addHN(true, "个人信息", CONST_MENU.home);
	mui("#name>.si_span")[0].innerHTML = COM.getStorage(STORAGE.name);
	mui("#sex>.si_span")[0].innerHTML = COM.getStorage(STORAGE.sex);
	mui("#birthday>.si_span")[0].innerHTML = COM.getStorage(STORAGE.birthday);
	mui.init({
		beforeback: function() {
			COM.openWindow('self', undefined, true);
			//返回true，继续页面关闭逻辑
			return true;
		}
	});

	var _cancelFuc = function() {
		console.log("取消点击函数已执行 可不传入");
	}
	var _sureFuc = function(obj) {
		var tmp = obj[0];
		console.log('返回数据：' + JSON.stringify(obj));
		if(tmp.value != COM.getStorage(STORAGE[tmp.id])) {
			var o = {};
			o[tmp.id] = tmp.value;
			SELF.selfInfoUpdate(o, tmp);
		} else {
			COM.closeMark();
		}
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
			TRANSFER.selfInfo.value = v;
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
			var picker = new mui.DtPicker({
				"type": "date",
				"beginYear": 1980,
				"endYear": new Date().getFullYear(),
				"value": value
			});

			picker.show(function(rs) {
				TRANSFER.selfInfo.value = rs.text;
				_sureFuc([TRANSFER.selfInfo]);
				picker.dispose();
			});
		} else {
			console.log("发现未匹配的title =>" + title);
		}
	});
}

/**
 * 用户信息更新
 * @param {Object} o 需要更新的内容
 */
SELF.selfInfoUpdate = function(o, tmp) {
	var obj = {
		url: URL.userUpdate,
		data: o,
		success: function(data) {
			if(data && data.flag) {
				COM.setStorage(STORAGE[tmp.id], tmp.value);
				if(o.type === "radio") {
					COM.setStorage(STORAGE[tmp.id + '_v'], tmp.text);
				}
				mui('#' + tmp.id + '>.si_span')[0].innerHTML = tmp.text || tmp.value;
			}
			COM.closeMark();
		},
		error: function() {
			mui.toast('用户信息更新失败,请稍后再尝试。');
		}
	}
	console.log("SELF.selfInfoUpdate 开始请求数据..");
	COM.ajax(obj);
}