/**
 * 主页的方法
 */

/**
 * 开始函数
 */
HOME.start = function() {
	COM.addHN(false, '乐享智家', CONST_MENU.self);
	COM.back();
	HOME.showDevice();
	HOME.bindEvent();
}
HOME.deviceList = null; //存储获取到的设备列表

/**
 * 首页绑定事件响应
 */
HOME.bindEvent = function() {
	//轮播事件
	var slider = mui("#slider");
	document.getElementById("switch").addEventListener('toggle', function(e) {
		if(e.detail.isActive) {
			slider.slider({
				interval: 5000
			});
		} else {
			slider.slider({
				interval: 0
			});
		}
	});
	mui('#home_device').on('tap', 'li', function() {
		var index = this.getAttribute('title');
		if(index === '-1') { //-1 跳转设备管理界面 
			COM.openWindow('device');
		} else { //跳转具体的设备界面
			DEVICE.goDeviceHtml(HOME.deviceList[index]);
		}
	});
}

/**
 * 显示设备
 */
HOME.showDevice = function() {
	var homeDeviceDoc = mui('#home_device')[0];
	homeDeviceDoc.innerHTML = '';
	var deviceList = HOME.deviceList = JSON.parse(COM.getStorage(STORAGE.deviceList) || '[]');
	if(DEBUG) console.log('deviceList ===>' + JSON.stringify(deviceList));

	for(var i = 0; i < deviceList.length; i++) {
		var obj = deviceList[i];
		if(obj.online === 'true') { //在线  则展示出来
			var liDoc = COM.createElem('li', {
				'title': i,
				'class': 'mui-table-view-cell mui-media mui-col-xs-4 mui-col-sm-3'
			}, homeDeviceDoc);
			liDoc.innerHTML = '<a href="#"><span class="mui-icon mui-icon-gear"></span><div class="mui-media-body">' + obj.alias + '</div></a>';
		} else {
			console.log('发现不在线的设备...' + i);
		}
	}
	var liDoc = COM.createElem('li', {
		'title': '-1',
		'class': 'mui-table-view-cell mui-media mui-col-xs-4 mui-col-sm-3'
	}, homeDeviceDoc);
	liDoc.innerHTML = '<a href="#"><span class="mui-icon mui-icon-plus"></span><div class="mui-media-body">设备管理</div></a>';
}