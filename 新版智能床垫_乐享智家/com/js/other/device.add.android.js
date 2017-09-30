/**
 * 新设备添加管理事件 android
 * 采用闭包进行处理
 */
window.DEVICE_ADD_ANDROID = (function() {
	var wifi = null; //new WIFI();
	var ssid = CONSTANT.ssid; //硬件的wifi名 此值通过CONSTANT.ssid设置
	var pwd = CONSTANT.pwd; //硬件的wifi密码 此值通过CONSTANT.pwd设置
	var wifiSet = null;
	var wifistatus = null;
	var wifiFlag = 0; //wifi标识 0代表可以自动连接处理 1代表可以半自动进入wifi设备 2代表手动进入wifi
	var deviceCode = null; //记录设备标识符

	/*********** wifiFlag = 0 start ********************/
	/**
	 * wifiFlag = 0   自动判断wifi是否打开 
	 */
	var _f0Start = function() {
		console.log('_first函数已运行...');
		if(!wifi.isWifiEnabled()) {
			COM.createLoading('正在打开WIFI设备...');
			COM.setStorage(STORAGE.net_work_id, '-2'); //代表wifi是未打开
			wifi.open(); //打开wifi 
			var t = setInterval(function() {
				if(wifi.isWifiEnabled()) { //wifi设备已打开
					clearInterval(t);
					setTimeout(function() {
						_f0Check();
					}, 1000);
				}
			}, 1000);
		} else {
			var now = wifi.getNow();
			var nowSsid = now.getSSID();
			if(nowSsid == ssid || nowSsid == '"' + ssid + '"') {
				console.log('当前连接的ssid是test1');
				COM.setStorage(STORAGE.net_work_id, '-1');
			} else {
				COM.setStorage(STORAGE.net_work_id, now.getNetworkId() + '');
			}
			console.log('_firstStart>getNetworkId === >>' + COM.getStorage(STORAGE.net_work_id));
			_f0Check();
		}
	}

	/**
	 * wifiFlag = 0  自动校验wifi是否打开
	 */
	var _f0Check = function() {
		COM.createLoading('正在初始化环境...');
		wifi.removeExsits(ssid); //移除掉已配置了的wifi 然后进行新的配置
		var t = setInterval(function() {
			var list = wifi.getAllList();
			if(list) {
				clearInterval(t);
				var have = wifi.checkSsid(ssid); //获取周边ssid的个数 如果超过1个，则提示
				console.log('have===>' + have);
				if(have === 1) { //如果只有一个 则连接硬件
					_f0Connect();
				} else if(have === 0) { //没有硬件设备
					mui.alert('未发现设备,请确定床垫电源是否打开并且wifi指示灯亮起或闪烁。', '提示');
					_endBack(true);
				} else { //开启的设备有多个
					mui.alert('您开启了多个设备,请只开启需要配置的设备,关闭其他设备。如果您只开启了一个设备,请重新点击开始。', '提示');
					_endBack(true);
				}
			}
		}, 500);
	}

	/**
	 * wifiFlag = 0 自动连接硬件wifi
	 */
	var _f0Connect = function() {
		wifi.connectNew(ssid, pwd); //连接硬件的wifi
		COM.createLoading('正在连接硬件...');
		var tmpSsid = '"' + ssid + '"';
		var t = setInterval(function() {
			var now = wifi.getNow();
			if(now.getSSID() == tmpSsid) {
				clearInterval(t);
				setTimeout(_secondStart, 2000);
			}
		}, 1000);
	}

	/*********** wifiFlag = 0 end ********************/

	/*********** wifiFlag = 1 end ********************/
	/**
	 * wifiFlag = 1 开始
	 */
	var _f1Start = function() {
		console.log('_f1Start 已运行');
		_secondStart();
	}

	/*********** wifiFlag = 0 end ********************/

	/**
	 * 发送请求
	 */
	var _secondBefore = function() {
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
				},
				error: function() {
					//					console.log('error函数已执行。。。');
				}
			});
		} catch(e) {
			//			console.log('catch已执行');
			return false;
		}
		return true;
	}
	/**
	 * 第二步 获取硬件中的信息
	 */
	var _secondStart = function() {
		console.log('_secondStart 已执行');
		var connectTrue = _secondBefore();
		if(!connectTrue) {
			var i = 0;
			COM.createLoading('正在获取信息，获取时间较长，请耐心等待...');
			var t = setInterval(function() {
				if(i++ < 40) {
					_secondBefore() && _secondShow(t);
				} else {
					mui.alert('无法获取到信息，请检查设备的WIFI指示灯是否亮起','提示');
					clearInterval(t);
					_endBack(true);
				}
			}, 3000);
		} else {
			COM.createLoading('正在获取信息...');
			_secondShow();
		}
	}
	/**
	 * 第二步 显示硬件中的信息
	 */
	var _secondShow = function(t) {
		t && clearInterval(t);
		if(wifiFlag !== 0) {
			mui('#device_add_order')[0].innerHTML = '配网中：';
		}
		mui('#device_add_tips')[0].innerHTML = '<li >请在下方配置WIFI；</li>' +
			'<li>点击<a title="search">这里</a>进行WIFI搜索；</li>' +
			'<li>选择WIFI后，点击<a title="sure">这里</a>进行配置；</li>' +
			'<li>最后,点击<a title="save">这里</a>使设置生效；</li>';

		mui('#device_add_iframe')[0].innerHTML = '<iframe id="wifiSet" height="190" src="http://10.10.11.234/wifi_set_cn.html"></iframe>' +
			'<iframe id="wifistatus" style="display: none;" src="http://10.10.11.234/status_cn.html"></iframe>';
		var t = setInterval(function() {
			wifiSet = document.getElementById('wifiSet').contentWindow;
			if(wifiSet) {
				wifistatus = document.getElementById('wifistatus').contentWindow;
				COM.closeLoading();
				clearInterval(t);
				_hardwareReload();
			}
		}, 100);
	}

	/**
	 * 触发iframe中的搜索按钮
	 */
	var _searchClick = function() {
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
		if(btn){
			COM.createLoading('正在保存...');
			btn.click();
		}
	}

	/**
	 * 硬件重启
	 */
	var _hardwareReload = function() {
		var t = setInterval(function() {
			var reloadBtn = wifiSet.document.getElementById('reload_btn');
			if(reloadBtn) {
				document.getElementById('wifiSet').style.display = 'none';
				clearInterval(t);
				deviceCode = wifistatus.document.getElementById('sys_wifi_MAC').innerHTML;
				reloadBtn.click(); //设备重启
				if(wifiFlag === 0) {
					COM.createLoading('正在绑定设备...');
					setTimeout(_f0BindStart, 500);
				} else {
					_f12Show();
				}
			}
		}, 100);
	}

	/**
	 * wifiFlag === 0 自动绑定
	 */
	var _f0BindStart = function() {
		var netWorkId = _endBack(); //返回之前的联网状态
		if(netWorkId >= 0) { //如果连接的是wifi
			var t1 = setInterval(function() {
				var now = wifi.getNow();
				console.log(now.getNetworkId() + '====' + netWorkId);
				if(now.getNetworkId() == netWorkId) { //已经连接回之前的wifi
					console.log('wifi已还原');
					clearInterval(t1);
					setTimeout(function() {
						_f0bindDo(); //绑定到服务器 
					}, 5000);
				}
			}, 1000);
		} else {
			setTimeout(function() {
				_f0bindDo();
			}, 1000);
		}
	}

	/**
	 * wifiFlag === 1 || 2 手动绑定
	 */
	var _f12Show = function() {
		mui('#device_add_order')[0].innerHTML = '绑定设备：';
		if(wifiFlag === 1) {
			mui('#device_add_tips')[0].innerHTML =
				'<li>请切换到可用的wifi,点击<a title="wifi">这里</a>跳转wifi设置界面；</li>' +
				'<li>切换成功后,点击<a title="bind">这里</a>进行绑定设备；</li>';
		} else {
			mui('#device_add_tips')[0].innerHTML =
				'<li>请切换到可用的wifi；</li>' +
				'<li>切换成功后,点击<a title="bind">这里</a>进行绑定设备；</li>';
		}

		mui('#device_add_iframe')[0].innerHTML = '';
	}

	/**
	 * wifiFlag === 0 与绑定
	 */
	var _f0bindDo = function() {
		DEVICE.bindDevice(deviceCode, function() {
			COM.openWindow('liliao_device_list', '../../../liliao/html/device/liliao_device_list.html', true);
			//			COM.closeLoading();
			setTimeout(function() {
				plus.webview.close(plus.webview.currentWebview());
			}, 1000);
		}, function() {
			setTimeout(function() {
				_f0bindDo();
			}, 2000);
		});
	}

	/**
	 * wifiFlag === 1 || 2 绑定
	 */
	var _f12BindDo = function() {
		COM.createLoading('正在绑定设备...');
		DEVICE.bindDevice(deviceCode, function() {
			COM.openWindow('liliao_device_list', '../../../liliao/html/device/liliao_device_list.html', true);
			//			COM.closeLoading()
			setTimeout(function() {
				plus.webview.close(plus.webview.currentWebview());
			}, 1000);
		}, function() {
			COM.closeLoading();
			mui.alert('无法绑定设备,请确认是否已经切换到可用网络', '提示');
		});
	}

	/**	
	 * 返回之前的wifi状态
	 */
	var _endBack = function(flag) {
		var netWorkId = COM.getStorage(STORAGE.net_work_id);
		if(netWorkId !== null) {
			netWorkId = parseInt(netWorkId);
			wifi.removeExsits(ssid); //移除当前配置的ssid
			switch(netWorkId) {
				case -2: //之前wifi是关闭状态的
					wifi.close(); //关闭wifi
					break;
				case -1: //之前wifi是打开但未连接
					break;
				default:
					wifi.connectOld(netWorkId);
			}
		}
		if(flag) {
			COM.closeLoading();
		}
		return netWorkId;
	}

	/**
	 * 重置页面
	 */
	var _reset = function() {
		if(wifiFlag === 0) {
			mui('#device_add_order')[0].innerHTML = '操作提示：';
			mui('#device_add_tips')[0].innerHTML = '<li>请确认床垫<span>电源已打开</span>，wifi指示灯在闪烁；</li><li>点击<a title="f0">这里</a>自动打开wifi连接并获取wifi列表；</li>';
			mui('#device_add_iframe')[0].innerHTML = '';
		} else if(wifiFlag === 1) {
			mui('#device_add_order')[0].innerHTML = '配网前：';
			mui('#device_add_tips')[0].innerHTML =
				'<li>请确认床垫<span>电源已打开</span>,wifi指示灯在闪烁；</li>' +
				'<li>连接wifi,账号:<span>' + ssid + '</span>,密码:<span>' + pwd + '</span>,' +
				'点击<a title="wifi">这里</a>跳转wifi设置界面；</li>' +
				'<li>wifi连接后,点击<a title="f1">这里</a>开始配网；</li>';
			mui('#device_add_iframe')[0].innerHTML = '';
		} else {
			mui('#device_add_order')[0].innerHTML = '配网前：';
			mui('#device_add_tips')[0].innerHTML =
				'<li>请确认床垫<span>电源已打开</span>,wifi指示灯在闪烁；</li>' +
				'<li>打开wifi界面，连接wifi,账号:<span>' + ssid + '</span>,密码:<span>' + pwd + '</span>；</li>' +
				'<li>wifi连接后,点击<a title="f1">这里</a>开始配网；</li>';
			mui('#device_add_iframe')[0].innerHTML = '';
		}
	}

	/**
	 * 跳转wifi设置界面
	 */
	var _goWifi = function() {
		try {
			wifi.goWifi();
		} catch(e) {
			wifiFlag = 2;
			mui.toast('打开wifi失败,请手动操作。');
			_reset();
		}
	}

	/**
	 * 初始化
	 */
	var _init = function() {
		COM.addHN(true, "添加新设备", CONST_MENU.home);
		COM.back(false);
		mui('#device_add_tips').on('tap', 'a', function() {
			var fuc = this.getAttribute('title');
			DEVICE_ADD_ANDROID[fuc] && DEVICE_ADD_ANDROID[fuc]();
		});
		_reset();
		COM.addReload(function() {
			_reset();
		});
	}
	
	

	/**
	 * 开始函数 判断wifiFlag
	 */
	var _start = function() {
		try {
			wifiFlag = 0;
			wifi = new WIFI();
		} catch(e) {
			try {
				wifiFlag = 1;
				wifi = new C_WIFI();
			} catch(e) {
				wifiFlag = 2;
			}
		}
		_init();
	}
	

	return {
		start: _start, //开始
		f0: _f0Start, //wifiFlag === 0  点击开始配网 
		f1: _f1Start, //wifiFlag === 1 点击开始配网
		bind: _f12BindDo, //wifiFlag === 1||2 的点击绑定设备
		search: _searchClick,
		sure: _sureClick,
		save: _saveClick,
		wifi: _goWifi
	}
})();