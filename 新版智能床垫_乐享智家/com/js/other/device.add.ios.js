window.DEVICE_ADD_IOS = (function() {
	var ssid = 'test1'; //硬件的wifi名
	var pwd = 'lxzj2017'; //硬件的wifi密码
	var wifiSet = null; //iframe id="wifiSet"
	var wifistatus = null; //iframe id="wifistatus"
	var deviceCode = null; //设备标识
	/**
	 * 第二步 显示操作
	 */
	var _secondShow = function() {
		COM.createLoading('正在校验wifi是否正确...');
		setTimeout(function() {
			if(_checkWifi()) { //连接的是正确的wifi
				COM.closeLoading();
				mui('#device_add_order')[0].innerHTML = '配网中：';
				mui('#device_add_tips')[0].innerHTML =
					'<li >请在下方配置床垫的wifi；</li>' +
					'<li>点击<a title="search">这里</a>进行wifi搜索；</li>' +
					'<li>选中wifi后,点击<a title="sure">这里</a>进行设置；</li>' +
					'<li>最后,点击<a title="save">这里</a>使设置生效；</li>';
				mui('#device_add_iframe')[0].innerHTML = '<iframe id="wifiSet" height="190" src="http://10.10.11.234/wifi_set_cn.html"></iframe>' +
					'<iframe id="wifistatus" style="display: none;" src="http://10.10.11.234/status_cn.html"></iframe>';
				var t = setInterval(function() {
					wifiSet = document.getElementById('wifiSet').contentWindow;
					if(wifiSet) {
						clearInterval(t);
						wifistatus = document.getElementById('wifistatus').contentWindow;
						_thirdBefore();
					}
				}, 100);
			} else {
				COM.closeLoading();
				mui.alert('无法连接到床垫,请确认wifi是否连接正确', '提示');
			}
		}, 1000);
	}

	/**
	 * 校验用户设置的wifi是否正确
	 */
	var _checkWifi = function() {
		try {
			mui.ajax({
				url: 'http://10.10.11.234',
				contentType: 'application/json',
				dataType: 'json',
				username: 'admin',
				password: 'admin',
				async: false,
				type: 'GET',
				timeout: 1000,
				success: function(data) {
					console.log('已返回');
				}
			});
		} catch(e) {
			return false;
		}
		return true;
	}
	/**
	 * 触发iframe中的搜索按钮
	 */
	var _searchWifi = function() {
		var btn = wifiSet && wifiSet.document.getElementById('step1');
		btn && btn.click();
	}
	/**
	 * 触发iframe中的保存按钮
	 */
	var _sureClick = function() {
		var btn = wifiSet && wifiSet.document.getElementById('step2');
		btn && btn.click();
	}
	/**
	 * 触发iframe中的保存按钮 
	 */
	var _saveClick = function() {
		var btn = wifiSet && wifiSet.document.getElementById('save_btn');
		btn && btn.click();
	}

	/**
	 * 第三步 绑定之前 获取数据
	 */
	var _thirdBefore = function() {
		var t = setInterval(function() {
			var reloadBtn = wifiSet.document.getElementById('reload_btn');
			console.log('setInterval');
			if(reloadBtn) {
				deviceCode = wifistatus.document.getElementById('sys_wifi_MAC').innerHTML;
				clearInterval(t);
				reloadBtn.click();
				_thirdShow();
			}
		}, 200);
	}

	/**
	 * 绑定设备
	 */
	var _bindDevice = function() {
		COM.createLoading('正在绑定');
		DEVICE.bindDevice(deviceCode, function() {
			COM.closeLoading();
			COM.openWindow('liliao_device_list', '../../../liliao/html/device/liliao_device_list.html', true);
		}, function() {
			COM.closeLoading();
			mui.alert('无法绑定设备,请确认是否已经切换到可用网络', '提示');
		});
	}

	/**
	 * 第三步  显示绑定
	 */
	var _thirdShow = function() {
		mui('#device_add_order')[0].innerHTML = '绑定设备：';
		mui('#device_add_tips')[0].innerHTML =
			'<li>请切换到可用的wifi,点击<a title="wifi">这里</a>跳转wifi设置界面；</li>' +
			'<li>切换成功后,点击<a title="bind">这里</a>进行绑定设备；</li>';
		mui('#device_add_iframe')[0].innerHTML = '';
	}

	/**
	 * 跳转wifi设置界面
	 */
	var _goWifi = function() {
		plus.runtime.openURL("App-Prefs:root=WIFI");
	}

	/**
	 * 第一步显示
	 */
	var _firstReset = function() {
		mui('#device_add_order')[0].innerHTML = '配网前：';
		mui('#device_add_tips')[0].innerHTML =
			'<li>请确认床垫<span>电源已打开</span>,wifi指示灯在闪烁；</li>' +
			'<li>连接wifi,账号:<span>' + ssid + '</span>,密码:<span>' + pwd + '</span>,' +
			'点击<a title="wifi">这里</a>跳转wifi设置界面；</li>' +
			'<li>wifi连接后,点击<a title="second">这里</a>开始配网；</li>';
		mui('#device_add_iframe')[0].innerHTML = '';
	}

	var _start = function() {
		ssid = CONSTANT.ssid;
		pwd = CONSTANT.pwd;
		_firstReset();
		COM.addHN(true, "添加新设备", CONST_MENU.home);
		COM.addReload(function() {
			_firstReset();
		});
		mui('#device_add_tips').on('tap', 'a', function() {
			var fuc = this.getAttribute('title');
			DEVICE_ADD_IOS[fuc] && DEVICE_ADD_IOS[fuc]();
		});
	}

	return {
		start: _start,
		wifi: _goWifi,
		second: _secondShow,
		search: _searchWifi,
		sure: _sureClick,
		save: _saveClick,
		bind: _bindDevice
	}
})();