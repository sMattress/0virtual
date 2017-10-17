/**
 * 设备管理方法
 */
DEVICE.start = function() {
	console.log('DEVICE.start 已执行');
	COM.addHN(true, "设备管理", CONST_MENU.home);
	mui.init({
		beforeback: function() {
			COM.openWindow('home', undefined, true);
			//返回true，继续页面关闭逻辑
			return true;
		}
	});
	COM.addReload(function(){
		DEVICE.getDeviceList(DEVICE.createList);
	});
	DEVICE.getDeviceList(DEVICE.createList);
	DEVICE.bindListClick();
	DEVICE.bindAddClick();
	mui('#com_body').pullToRefresh({
		down: {
			callback: function() {
				setTimeout(function() {
					location.href = location.href;
				}, 500);
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
	boxDoc = boxDoc || mui("#device_show_box")[0];
	var html = "";
	if(deviceList.length){
		for(var i = 0; i < deviceList.length; i++) {
			var obj = deviceList[i];
			html += '<li index="'+i+'" class="mui-table-view-cell elem-click"><img class="home-logo" '
			+'src="../../img/other/logo-'+obj.type+'.png" /><em class="home-device-name">'
			+ obj.alias +'</em><i class="right-arrow"></i></li>';
		}
	}else{
		var tmpIndex = 'device_add_android';
		if(mui.os.ios){//ios版
			tmpIndex = "device_add_ios";
		}
		html = '<li>暂无设备,点击<a class="elem-click" index="'+tmpIndex+'">配置新设备</a>前往添加</li>';
	}
	
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
//	if(obj.online === 'false'){
//		mui.toast('不在线的设备无法进入设备查看,请开启相应设备');
//		return;
//	}
	if(obj.type === '1') { //理疗类型的设备 跳转理疗
		var id = 'liliao_device';
		var url = '../../../liliao/html/device/liliao_device.html';
	} else if(obj.type === '2') {//青少年床垫
		var id = 'young_monitor';
		var url = '../../../young/html/monitor/young_monitor.html';
	} else {
		id = 'home';
		console.log('发现未匹配的设备类型');
	}
	COM.openWindow(id, url, true);
	//如果缓存设备名与当前设备名不一致 因为青少年跳过去饼图显示不了 所以刷新一下
//	if(oldDevice.device_name !== obj.device_name || obj.type === '2') {
//		COM.openWindow(id, url, true);
//	} else {
//		COM.openWindow(id, url); 
//	}
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
		if(DEBUG) console.log('=====正在执行_createQrcode');
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
	mui("#device_show_box").on("tap", ".elem-click", function(e) {
		var tmpObj = TRANSFER.device = {}; //中转数据存储
		var index = tmpObj.index = this.getAttribute("index");
		if(DEBUG) console.log('=index===='+index);
		var i = parseInt(index);
		
		if(isNaN(i)){
			COM.openWindow(index,undefined,true);
		}else{
			var obj = DEVICE.deviceList[i];
			tmpObj.name = obj.alias;
			tmpObj.code = obj.device_name;
			var p = COM.countPosition(this, "fixed");
			var popList = DEVICE.popList;
			var offset = {
				top: (p.top + 50) + 'px',
				height: (43 * popList.length + 14) + 'px',
				width: '280px',
				left: '10px'
			}
			var arrow = {
				left: '30px'
			}
			mui("#com_device_qrcode")[0].style.display = 'none';
			if(DEBUG) console.log('==========正在调用COM.createPopover')
			COM.createPopover(popList, offset, arrow);
		}
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
			if(mui.os.ios){//ios版
				COM.openWindow("device_add_ios",undefined,true);
			}else{
				COM.openWindow("device_add_android",undefined,true);
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
DEVICE.getDeviceList = function(success,error) {
	if(DEBUG) console.log('=====执行 DEVICE.getDeviceList');
	var obj = {
		url: URL.getDeivceList,
		type: "GET",
		success: function(data) {
			if(data && data.flag) {
				COM.setStorage(STORAGE.deviceListChange,'1');
				if(data.params && data.params.length != 0) {
					if(DEBUG) console.log('=获取设备列表;====' + JSON.stringify(data.params));
					COM.setStorage(STORAGE.deviceList, JSON.stringify(data.params));
				} else {
					COM.setStorage(STORAGE.deviceList, '');
					if(DEBUG) console.log('=获取设备列表为空');
				}
				success && success();
			}
		},
		error:error,
		errorText: "获取设备列表失败,请稍后再尝试。"
	}
	if(DEBUG) console.log('==========调用 COM.ajax');
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