/**
 * 设备管理方法
 */
DEVICE.start = function() {
	console.log('DEVICE.start 已执行');
	COM.addHN(false, "设备管理", CONST_MENU.home, true);
	COM.back();
	COM.addReload(function() {
		DEVICE.getDeviceList(DEVICE.createList);
	});
	DEVICE.getDeviceList(DEVICE.createList);
	DEVICE.bindListClick();
	DEVICE.bindAddClick();
	mui('#' + CONSTANT.bodyId).pullToRefresh({
		down: {
			callback: function() {
				var downSelf = this;
				DEVICE.getDeviceList(function() {
					DEVICE.createList();
					downSelf.endPullDownToRefresh();
				});
			}
		}
	});
}

DEVICE.deviceList = null; //设备列表

/**
 * 创建设备显示列表
 * @param {Object} boxDoc 将设备显示列表放置的位置 可不传
 */
DEVICE.createList = function(boxDoc) {
	var deviceList = DEVICE.deviceList = JSON.parse(COM.getStorage(STORAGE.deviceList) || '[]');
	boxDoc = boxDoc || mui("#com_list ul")[0];
	var html = "";
	for(var i = 0; i < deviceList.length; i++) {
		if(DEBUG) console.log('=i===='+i);
		var obj = deviceList[i];
		if(obj.type === '1') {
			html += '<li class="mui-table-view-cell" title="' + i + '">'
			html += '<div class="mui-slider-handle">';
			html += '<a class="mui-navigate-right">';
			html += '<em class="device-name">' + obj.alias + '</em>';
			html += '<span class="device_code">' + obj.device_name + '</span>';
//			if(obj.online === 'false') {
//				html += '<span class="device_online">不在线</span>';
//			} else {
//				html += '<span class="device_online">在线</span>';
//			}
			html += '</a></div></li>';
		}else{
			console.log('=存在不是智能床垫的设备====');
		}
	}
	mui("#com_device_qrcode")[0].style.display = 'none';
	boxDoc.innerHTML = html;
}

/**
 * 跳转具体的设备显示界面
 * @param {Object} obj 设备的参数
 */
DEVICE.goDeviceHtml = function(obj) {
	//取出旧的设备名 如果与新的不等 那么跳转之前就需要刷新页面
	var oldDevice = JSON.parse(COM.getStorage(STORAGE.device) || '{}');
	COM.setStorage(STORAGE.device, JSON.stringify(obj));
	//	if(obj.online === 'false') {
	//		mui.toast('不在线的设备无法进入设备查看,请开启相应设备');
	//		return;
	//	}
	var id = 'liliao_device';
	var url = 'liliao_device.html';
	var flag = false;
	COM.openWindow(id, url, true);
}
/**
 * 创建弹出菜单的列表参数
 */
DEVICE.popList = (function() {
	//设备控制 点击响应函数
	var _deviceCtrl = function() {
		DEVICE.goDeviceHtml(DEVICE.deviceList[TRANSFER.device.index]);
		COM.closeMark();
	}
	//生成二维码 点击响应函数
	var _createQrcode = function() {
		var qr = mui("#com_device_qrcode")[0];
		qr.innerHTML = "";
		qr.style.display = 'block';
		var qrcode = new QRCode(qr, {
			width: 150, //设置宽高
			height: 150
		});
		qrcode.makeCode(TRANSFER.device.code);
		COM.closeMark();
	}
	//重命名 点击响应函数
	var _remame = function() {
		COM.closeMark();
		var objInput = {
			id: "name",
			text: "名称",
			type: "input",
			value: TRANSFER.device.name
		};
		var _cancelFuc = function() {
			console.log("取消点击函数已执行 可不传入");
		}
		var _sureFuc = function(obj) {
			var value = obj[0].value.trim();
			if(value && value !== TRANSFER.device.name) {
				DEVICE.updateDeviceName(TRANSFER.device.code, value, function() {
					DEVICE.getDeviceList(DEVICE.createList);
					COM.closeMark();
				});
			} else {
				mui.alert("请输入新的设备名称", "提示");
			}
		}
		COM.createMarkBody([objInput], _sureFuc, _cancelFuc);
	}
	//取消绑定
	var _unbind = function() {
		mui.confirm('确认解除该设备吗？', '提示', CONSTANT.confirmBtn, function(e) {
			if(e.index == CONSTANT.confirmSure) {
				DEVICE.unbindDevice(TRANSFER.device.code, function() {
					DEVICE.getDeviceList(DEVICE.createList);
					COM.closeMark();
				});
			}
		});
	}
	//弹出菜单列表
	return [{
		id: "device_p_ctrl",
		text: "设备查看",
		onclick: _deviceCtrl
	}, {
		id: "device_p_qrcode",
		text: "生成二维码",
		onclick: _createQrcode
	}, {
		id: "device_p_rename",
		text: "重命名",
		onclick: _remame
	}, {
		id: "device_p_unbind",
		text: "解除绑定",
		onclick: _unbind
	}];
})();

/**
 * 绑定设备列表点击事件
 */
DEVICE.bindListClick = function() {
	//设备列表点击事件
	mui("#com_list").on("tap", "li", function(e) {
		var tmpObj = TRANSFER.device = {}; //中转数据存储
		var index = tmpObj.index = this.getAttribute("title");
		var obj = DEVICE.deviceList[index];
		tmpObj.name = obj.alias;
		tmpObj.code = obj.device_name;
		var p = COM.countPosition(this, "fixed");
		var popList = DEVICE.popList;
		console.log('p.top ' + (p.top - 12 - document.body.scrollTop));
		console.log('p.scrollTop ' + document.body.scrollTop);
		var offset = {
			top: (p.top - 12 - document.body.scrollTop) + 'px',
			height: (43 * popList.length + 14) + 'px',
			width: '280px',
			left: '10px'
		}
		var arrow = {
			left: '30px'
		}
		COM.createPopover(popList, offset, arrow);
	});
}

/**
 * 绑定设备添加点击事件
 */
DEVICE.bindAddClick = function() {
	mui("#com_device_mana").on("tap", "a", function() {
		var t = this.getAttribute("title");
		console.log("deviceMana ==> a 已点击");
		if(t === "new") {
			if(mui.os.ios) { //ios版
				COM.openWindow("device_add_ios", '../../../com/html/other/device_add_ios.html', true);
			} else {
				COM.openWindow("device_add_android", '../../../com/html/other/device_add_android.html', true);
			}
		} else {
			//添加设备函数
			var _bindDevice = function(type, deviceCode, file) {
				DEVICE.bindDevice(deviceCode, function() {
					DEVICE.getDeviceList(DEVICE.createList);
					COM.closeMark();
				});
			}
			COM.createQrcode(_bindDevice);
		}
	});
}

/**
 * 新的设备绑定
 * @param {Object} code 即将绑定的编号
 * @param {Object} success 绑定成功的回调函数
 * @param {Object} error 绑定失败的回调函数
 */
DEVICE.bindDevice = function(code, success, error) {
	var obj = {
		url: URL.bindDevice,
		data: {
			'device_name': code
		},
		success: success,
		error: error
	};
	console.log("DEVICE.addDevice 开始请求数据..");
	COM.ajax(obj);
}
/**
 * 获取设备列表
 * @param {Object} success 成功的回调函数
 */
DEVICE.getDeviceList = function(success, error) {
	console.log('DEVICE.getDeviceList 已执行');
	var obj = {
		url: URL.getDeivceList,
		type: "GET",
		success: function(data) {
			if(data && data.flag) {
				COM.setStorage(STORAGE.deviceList, JSON.stringify(data.params || '[]'));
				success && success();
			}
		},
		error: error,
		errorText: "获取设备列表失败,请稍后再尝试。"
	}
	console.log("DEVICE.getDeviceList 开始请求数据..");
	COM.ajax(obj);

}
/**
 * 设备重命名
 * @param {Object} code 设备标识
 * @param {Object} name 设备显示名称
 * @param {Object} success 成功回调函数
 * @param {Object} error 错误回调函数
 */
DEVICE.updateDeviceName = function(code, name, success, error) {
	var obj = {
		url: URL.updateDevice,
		data: {
			'device_name': code,
			'alias': name
		},
		success: success,
		error: error,
		errorText: '重命名失败,请稍后再试。'
	}
	console.log("DEVICE.updateDeviceName 开始请求数据..");
	COM.ajax(obj);
}
/**
 * 取消设备绑定
 * @param {Object} code 设备编号
 * @param {Object} success 成功回调函数
 * @param {Object} error 错误回调函数
 */
DEVICE.unbindDevice = function(code, success, error) {
	var obj = {
		url: URL.unbindDevice,
		data: {
			'device_name': code
		},
		success: success,
		error: error,
		errorText: "解除绑定失败,请稍后再试。"
	}
	console.log("DEVICE.unbindDevice 开始请求数据..");
	COM.ajax(obj);
}