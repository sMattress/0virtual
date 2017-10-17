/**
 * 主页的方法
 */
window.HOME = (function(){
	var deviceList = null;
	
	/**
	 * 填充设备
	 */
	var _showDevice = function(){
		if(DEBUG) console.log('=====_showDevice');
//		var deviceListChange = COM.getStorage(STORAGE.deviceListChange);
//		if(DEBUG) console.log('=deviceListChange===='+deviceListChange);
//		if(deviceListChange !== '1'){
//			return;
//		}
//		COM.setStorage(STORAGE.deviceListChange,'0');
		if(DEBUG) console.log('=床垫数据：'+COM.getStorage(STORAGE.deviceList) )
		deviceList = JSON.parse(COM.getStorage(STORAGE.deviceList) || '[]');
		if(DEBUG) console.log('=deviceList====' + deviceList);
		
		var html = '';
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
				COM.openWindow("device_add_ios",undefined,true);
			}
			html = '<li>暂无设备,点击<a class="elem-click" index="'+tmpIndex+'">配置新设备</a>前往添加</li>';
		}
		mui('#home_device ul')[0].innerHTML = html;
	}
	
	/**
	 * 绑定点击事件
	 */
	var _bind = function(){
		mui('#home_device').on('tap','.elem-click',function(){
			var index = this.getAttribute('index');
			if(DEBUG)console.log('=index===='+index);
			var i = parseInt(index);
			if(isNaN(i)){
				COM.openWindow(index,undefined,true);
			}else{
				DEVICE.goDeviceHtml(deviceList[i]);
			}
		});
		DEVICE.bindAddClick();
	}
	
	/**
	 * 开始函数
	 */
	var _start = function(){
		COM.addHN(false, '乐享智家', CONST_MENU.self);
		COM.back();
		COM.addReload(function(){
			DEVICE.getDeviceList(_showDevice);
		});
		DEVICE.getDeviceList(_showDevice);
		_bind();
	}
	
	return {
		start:_start
	}
})();


/**
 * 开始函数
 */
HOME.start1 = function() {
	mui('#psy_explan').on('tap', 'li', function() {
		var src = '../../../gs/audio/' + this.getAttribute('title');
		console.log(src);
		document.getElementById('psy_explan_mp3').innerHTML = '<audio src="' + src + '" controls="controls"></audio>';
	});
}
