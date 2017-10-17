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
	var site_survey = null;
	var wifiFlag = 0; //wifi标识 0代表可以自动连接处理 1代表可以半自动进入wifi设备 2代表手动进入wifi
	var deviceCode = null; //记录设备标识符
	var cSSID = null;

	var step = -1;
	var stepFucArr = []; //根据step对应的函数

	var _refreshFuc = null; //刷新的函数
	var _prevFuc = null; //上一步函数
	var _nextFuc = null; //下一步函数

	var _bindEndData = null;

	var _reGet = 0;
	var tmpCssid = null;
	/*********** wifiFlag = 0 start ********************/
	/**
	 * wifiFlag = 0   自动判断wifi是否打开 
	 */
	var _f0Start = function() {
		if(DEBUG) console.log('==========执行 DEVICE_USER_INFO _f0Start');
		if(DEBUG) console.log('=====创建蒙层');
		COM.createLoading('正在执行...');
		if(!wifi.isWifiEnabled()) {
			COM.createLoading('正在打开WIFI设备...');
			COM.setStorage(STORAGE.net_work_id, '-2'); //代表wifi是未打开
			wifi.open(); //打开wifi 
			var i = 0;
			var t = setInterval(function() {
				if(i++ > 5) {
					clearInterval(t);
					if(_reGet++ > 4) {
						COM.closeLoading();
						_endBack(true);
						mui.alert('无法打开wifi,请手动打开后再尝试', '提示');
					} else {
						COM.createLoading('打开wifi失败，正在尝试重新打开...');
						_f0Start();
					}
				} else if(wifi.isWifiEnabled()) { //wifi设备已打开
					_reGet = 0;
					clearInterval(t);
					setTimeout(function() {
						_f0Check();
					}, 1000);
				}
			}, 1000);
		} else {
			var now = wifi.getNow();
			var nowSsid = now.getSSID();
			if(nowSsid.startsWith(ssid) || nowSsid.startsWith('"' + ssid)) {
				console.log('当前连接的ssid是' + nowSsid);
				COM.setStorage(STORAGE.net_work_id, '-2');
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
		if(DEBUG) console.log('==========执行 DEVICE_USER_INFO _f0Check');
		COM.createLoading('正在获取设备...');
		var i = 0;
		var t = setInterval(function() {
			var list = wifi.getAllList();
			if(i++ > 20) {
				clearInterval(t);
				COM.closeLoading();
				_endBack(true);
				mui.alert('无法获取到设备,请重试', '提示');
			} else if(list) {
				clearInterval(t);
				var wifiList = wifi.checkSsid(ssid); //获取周边ssid的个数 如果超过1个，则提示
				if(DEBUG) console.log(JSON.stringify(wifiList));
				var num = wifiList.length;
				//				if(num === 1) { //如果只有一个 则连接硬件
				//					_f0Connect(wifiList[0].ssid);
				//				} else 
				if(num === 0) { //没有硬件设备
					mui.alert('未发现设备,请确定床垫电源是否打开并且wifi指示灯亮起或闪烁。', '提示');
					_endBack(true);
				} else { //开启的设备有多个
					_showWifiList(wifiList);
				}
			}
		}, 500);
	}

	/**
	 * 显示设备列表
	 * @param {Object} list
	 */
	var _showWifiList = function(list) {
		if(DEBUG) console.log('==========执行 DEVICE_USER_INFO _showWifiList');
		var len = list.length;
		//		for(var i = 0; i < len; i++) {
		//			var objI = list[i];
		//			for(var j = i + 1; j < len; j++) {
		//				var objJ = list[j];
		//				if(objI.level < objJ.level) {
		//					var tmp = list[i];
		//					list[i] = list[j];
		//					list[j] = tmp;
		//				}
		//			}
		//		}
		var html = '';
		for(var i = 0; i < len; i++) {
			html += '<li class="mui-table-view-cell"><a class="mui-navigate-right">' + list[i].ssid + '</a></li>';
		}
		if(DEBUG) console.log(html);

		mui('#android_add_box>ul')[0].innerHTML = html;

		mui('#ad_box>p')[0].innerHTML = '<span>点击</span>选择要配置的床垫';
		$prev.style.display = 'none';
		$center.style.display = 'none';
		$next.style.display = 'none';
		$box.style.display = 'block';
		$pwd.style.display = 'none';

		if(DEBUG) console.log('=====销毁蒙层');
		COM.closeLoading();
	}

	/**
	 * wifiFlag = 0 自动连接硬件wifi
	 */
	var _f0Connect = function(cSsid) {
		if(DEBUG) console.log('==========执行 DEVICE_USER_INFO _f0Connect');
		if(DEBUG) console.log('=====创建蒙层');
		COM.createLoading('正在连接床垫...');
		cSSID = cSsid;
		wifi.connectNew(cSsid, pwd); //连接硬件的wifi

		var tmpSsid = '"' + cSsid + '"';
		var i = 0;
		var t = setInterval(function() {
			if(i++ > 20) {
				mui.alert('无法连接到床垫，请手动进行配置', '确定', function() {
					wifiFlag = 1;
					_reset();
				})
				clearInterval(t);
				COM.closeLoading();
				return;
			} else {
				var now = wifi.getNow();
				if(now.getSSID() == tmpSsid) {
					clearInterval(t);
					setTimeout(_secondStart, 2000);
				} else {
					if(DEBUG) console.log('=now.getSSID====' + now.getSSID());
					if(DEBUG) console.log('=now.getNetworkId====' + now.getNetworkId());
					if(DEBUG) console.log('=STORAGE.net_work_id====' + COM.getStorage(STORAGE.net_work_id));
					if(now.getNetworkId() == -1 || COM.getStorage(STORAGE.net_work_id) == now.getNetworkId()) {
						wifi.connectNew(cSsid, pwd);
					}
				}
			}
		}, 1000);
	}

	/*********** wifiFlag = 0 end ********************/

	/*********** wifiFlag = 1 end ********************/
	/**
	 * wifiFlag = 1 开始
	 */
	var _f1Start = function() {
		if(DEBUG) console.log('==========执行 DEVICE_USER_INFO _f1Start');
		_secondStart();
	}

	/*********** wifiFlag = 0 end ********************/

	/**
	 * 发送请求
	 */
	var _secondBefore = function() {
		if(DEBUG) console.log('==========执行 DEVICE_USER_INFO _secondBefore');
		try {
			mui.ajax({
				url: 'http://10.10.11.234/',
				//				contentType: 'application/json',
				//				dataType: 'json',
				username: 'admin',
				password: 'admin',
				async: false,
				type: 'POST',
				timeout: 200,
				success: function(data) {
					console.log('已返回');
				},
				error: function() {

				}
			});
		} catch(e) {
			if(DEBUG) console.log('=e====' + e);
			return false;
		}
		return true;
	}
	/**
	 * 第二步 获取硬件中的信息
	 */
	var _secondStart = function() {
		if(DEBUG) console.log('==========执行 DEVICE_USER_INFO _secondStart');
		var connectTrue = _secondBefore();
		if(!connectTrue) {
			var i = 0;
			COM.createLoading('正在获取信息，获取时间较长，请耐心等待...');
			var t = setInterval(function() {
				if(i++ < 20) {
					_secondBefore() && _secondShow(t);
				} else {
					mui.alert('无法获取到信息，请清除带有' + ssid + '的wifi名和重启床垫后再尝试', '提示');
					clearInterval(t);
					_endBack(true);
				}
			}, 3000);
		} else {
			COM.createLoading('正在获取信息...');
			_secondShow();
		}
	}
	
	var loadWifiSet = function(){
		document.getElementById('wifiSet').setAttribute('src','http://10.10.11.234/wifi_set_cn.html');
		

	}
	
	/**
	 * 第二步 显示硬件中的信息
	 */
	var _secondShow = function(t) {
		if(DEBUG) console.log('==========执行 DEVICE_USER_INFO _secondShow');
		t && clearInterval(t);
		wifiSet = null;
		wifistatus = null;
		site_survey = null;
		
		var wifiSetIframe = document.getElementById('wifiSet');
		wifiSetIframe.setAttribute('src','http://10.10.11.234/wifi_set_cn.html');
		var i = 0;
		var t1 = setInterval(function(){
			if(i++ > 5){
				console.log('=进入t1 if');
				clearInterval(t1);
				if(_reGet++ > 4) {
					COM.closeLoading();
					_endBack(true);
					mui.alert('无法获取到信息,请重启床垫和手机后再尝试', '提示');
				} else {
					COM.createLoading('获取失败，正在尝试重新获取...');
					_secondShow();
				}
			}else{
				wifiSet = wifiSetIframe.contentWindow;
				console.log('=进入t1 else');
				if(wifiSet && wifiSet.document.form_wmode){
					console.log('=进入t1 end');
					clearInterval(t1);
					i = 0;
					
					var wifistatusIframe = document.getElementById('wifistatus');
					wifistatusIframe.setAttribute('src','http://10.10.11.234/status_cn.html');
					var t2 = setInterval(function(){
						if(i++ > 20){
							console.log('=进入t2 if');
							clearInterval(t2);
							COM.closeLoading();
							_endBack(true);
							mui.alert('无法获取到信息,请重启床垫和手机后再尝试', '提示');
						}else{
							console.log('=进入t2 else');
							wifistatus = wifistatusIframe.contentWindow;
							if(wifistatus && wifistatus.document.getElementById('sys_wifi_MAC')){
								console.log('=进入t2 end');
								clearInterval(t2);
								i = 0;
								var site_surveyIframe = document.getElementById('site_survey');
								site_surveyIframe.setAttribute('src','http://10.10.11.234/site_survey.html');
									
								var t3 = setInterval(function(){
									if(i++>20){
										console.log('=进入t3 if');
										clearInterval(t3);
										COM.closeLoading();
										_endBack(true);
										mui.alert('无法获取到信息,请重启床垫和手机后再尝试', '提示');
									}else{
										console.log('=进入t3 else');
										site_survey = site_surveyIframe.contentWindow;
										if(site_survey && site_survey.document.sta_site_survey){
											console.log('=进入t3 end');
											_reGet = 0;
											clearInterval(t3);
											setTimeout(function(){
												mui('#hidden_wifi_list')[0].innerHTML = site_survey.document.sta_site_survey.innerHTML;
												_secondCreate();
											},3000);

										}
									}
								},1000);
							}
						}
					},1000);
				}
			}
		},1000);
	}
	/**
	 * 刷新wifi列表
	 */
	var _secondCreateRefresh = function() {
		document.getElementById('site_survey').setAttribute('src','http://10.10.11.234/site_survey.html');
		site_survey = null;
		COM.createLoading('正在刷新...');
		var i = 0; 
		var t = setInterval(function(){
			site_survey = document.getElementById('site_survey').contentWindow;
			if(i++>20){
				clearInterval(t);
				console.log('site_survey 无法获取');
				_endBack(true);
				mui.alert('检测到程序出错,请重试', '提示');
			}else if(site_survey){
				clearInterval(t);
				setTimeout(function(){
					try{
						mui('#hidden_wifi_list')[0].innerHTML = site_survey.document.getElementsByTagName('form')[0].innerHTML;
					}catch(e){
						console.log('form 无法获取');
						_endBack(true);
						mui.alert('检测到程序出错,请重试', '提示');
						return;
					}
					_secondCreate();
				},3000);
			}
		},2000);
	}
	/**
	 * 返回设备列表
	 */
	var _secondCreateShow = function() {
		var wifiList = wifi.checkSsid(ssid); //获取周边ssid的个数 如果超过1个，则提示
		var num = wifiList.length;
		if(num === 0) { //没有硬件设备
			mui.alert('未发现设备,请确定床垫电源是否打开并且wifi指示灯亮起或闪烁。', '提示');
			_endBack(true);
		} else { //开启的设备有多个
			_showWifiList(wifiList);
		}
	}

	/**
	 * 创建wifi列表
	 */
	var _secondCreate = function() {
		_refreshFuc = _secondCreateRefresh;
		_prevFuc = _secondCreateShow;
		mui('#ad_box>p')[0].innerHTML = '<span>点击</span>选择可用的wifi：';

		var $listBox = document.getElementById('hidden_wifi_list');
		var trs = $listBox.getElementsByTagName('tr');
		var html = '';
		for(var i = 2; i < trs.length; i++) {
			var tr = trs[i];
			var fuc = tr.getElementsByTagName('input')[0].getAttribute('onclick');
			var tSsid = tr.getElementsByTagName('td')[1].innerText;
			if(DEBUG) console.log('=fuc====' + fuc + ';tSsid====' + tSsid);
			html += '<li class="mui-table-view-cell" fuc="' + fuc + '"><a class="mui-navigate-right">' + tSsid + '</a></li>';
		}
		mui('#android_add_box>ul')[0].innerHTML = html;

		$prev.style.display = 'block';
		$center.style.display = 'inline-block';
		$next.style.display = 'none';
		$box.style.display = 'block';
		$pwd.style.display = 'none';
		COM.closeLoading();
	}
	/**
	 * 选中wifi后，设置密码
	 */
	var _secondPwd = function(cSsid) {
		_prevFuc = _secondCreate;
		_nextFuc = _secondSave;
		tmpCssid = cSsid;
		mui('#ad_box>p')[0].innerHTML = '请配置 <span>' + cSsid + '</span> 的密码：';

		$prev.style.display = 'block';
		$center.style.display = 'none';
		$next.style.display = 'block';
		$box.style.display = 'none';
		$pwd.style.display = 'block';
		$pwd.getElementsByTagName('input')[0].value = '';// lxzj2017
	}
	/**
	 * 开始保存密码
	 */
	var _secondSave = function() {
		if(DEBUG) console.log('=pwd====' + $pwd.getElementsByTagName('input')[0].value);
		if(wifiSet) {
			if(_setWifiSet()){
				mui.confirm('请确认 ' + tmpCssid + ' 的wifi密码为 ' + $pwd.getElementsByTagName('input')[0].value +
				',如果wifi密码不正确,会导致床垫无法传递数据', '提示', CONSTANT.confirmBtn,
				function(e) {
					if(e.index == CONSTANT.confirmSure) {
						var btn = wifiSet.document.getElementById('save_btn');
						if(btn) {
							COM.createLoading('正在保存...');
							btn.click();
							_hardwareReload();
						} else {
							console.log('save_btn不存在')
							_endBack(true);
							mui.alert('检测到程序出错,请重试', '提示');
						}

					}
				});
			}
		} else {
			console.log('wifiSet 不存在')
			_endBack(true);
			mui.alert('检测到程序出错,请重试', '提示');
		}

	}
	
	var _setWifiSet = function(){
		var fw = wifiSet.document.form_wmode;
		fw.__SL_P_WST.value = WST;
		fw.__SL_P_WST.onchange();
		
		var WSK = f.__SL_P_WSK.value;
		if(WST === "WEP"){
			if(WSF === "ASCII"){
				if((WSK.length != 5) && (WSK.length != 13))
				{
					mui.alert("ASCII格式的密码长度应为5或者13位！",'提示');
					return false;
				}
			}else if(WSF === "HEX"){
				if((WSK.length != 10) && (WSK.length != 26))
				{
					mui.alert("HEX格式的密码长度应为10或者26位！",'提示');
					return false;
				}
				if(!check_pw(f.__SL_P_WSK.value))
				{
					mui.alert("HEX格式的密码应为十六进制字符串！",'提示');
					return false;
				}
			}
			fw.__SL_P_WSK.value = f.__SL_P_WSK.value;
			fw.__SL_P_WSF.value = WSF;
		}else if(WST === 'WPA2PSK' || WST === 'WPAPSK'){
			if((WSK.length < 8) || (WSK.length > 64))
			{
				mui.alert("WPA/WPA2加密类型密码长度为8~64位！",'提示');
				return false;
			}
			fw.__SL_P_WSK.value = f.__SL_P_WSK.value;
			fw.__SL_P_WSF.value = WSF;
		}else if(WST === 'AUTO'){
			fw.__SL_P_WSK.value = f.__SL_P_WSK.value;
		}
		return true;
	}
	function check_pw(v)
	{
		var re=/^[0-9a-fA-F]{10,26}$/;
		return re.test(v);	
	}
	/**
	 * 硬件重启
	 */
	var _hardwareReload = function() {
		if(DEBUG) console.log('==========执行 DEVICE_USER_INFO _hardwareReload');
		var i = 0;
		var t = setInterval(function() {
			var reloadBtn = wifiSet.document.getElementById('reload_btn');
			if(DEBUG && reloadBtn) console.log('=正在获取信息====reloadBtn 存在');
			if(wifistatus) {
				var sys_wifi_MAC = wifistatus.document.getElementById('sys_wifi_MAC');
				if(sys_wifi_MAC) {
					if(DEBUG) console.log('=正在获取信息====sys_wifi_MAC 存在');
					deviceCode = sys_wifi_MAC.innerHTML.toLocaleLowerCase();
				}
			} else {
				console.log('wifistatus 不存在')
				_endBack(true);
				mui.alert('检测到程序出错,请重试', '提示');
				clearInterval(t);
				return;
			}
			if(DEBUG) console.log('=deviceCode====' + deviceCode);
			if(i++ > 5) {
				clearInterval(t);
				if(_reGet++ > 4) {
					COM.closeLoading();
					_endBack(true);
					mui.alert('无法获取到信息,请重启床垫和手机后再尝试', '提示');
				} else {
					COM.createLoading('获取失败，正在尝试重新获取...');
					_hardwareReload();
				}
			} else if(reloadBtn && deviceCode) {
				_reGet = 0;
				clearInterval(t);
				reloadBtn.click(); //设备重启
				if(wifiFlag === 0) {
					COM.createLoading('正在绑定设备...');
					setTimeout(_f0BindStart, 500);
				} else {
					_f12Show();
				}
			}
		}, 1000);
	}

	/**
	 * wifiFlag === 0 自动绑定
	 */
	var _f0BindStart = function() {
		if(DEBUG) console.log('==========执行 DEVICE_USER_INFO _f0BindStart');
		var netWorkId = _endBack(); //返回之前的联网状态
		console.log('=netWorkId====' + netWorkId);
		if(netWorkId >= 0) { //如果连接的是wifi
			var i = 0;
			var t = setInterval(function() {
				var now = wifi.getNow();
				if(DEBUG) console.log(now.getNetworkId() + '====' + netWorkId);
				if(i++ > 3) {
					clearInterval(t);
					if(_reGet++ > 4) {
						COM.closeLoading();
						_endBack(true);
						mui.alert('无法切换到可用wifi,请重启手机和床垫后再尝试', '提示');
					} else {
						COM.createLoading('切换wifi失败，正在尝试重新切换...');
						_f0BindStart();
					}
				} else if(now.getNetworkId() == netWorkId) { //已经连接回之前的wifi
					_reGet = 0;
					clearInterval(t);
					console.log('wifi已还原');
					setTimeout(function() {
						_f0bindDo(); //绑定到服务器 
					}, 5000);
				}
			}, 1000);
		} else {
			setTimeout(function() {
				_f0bindDo();
			}, 5000);
		}
	}

	/**
	 * wifiFlag === 1 || 2 手动绑定
	 */
	var _f12Show = function() {
		if(DEBUG) console.log('==========执行 DEVICE_USER_INFO _f12Show');
		$prev.style.display = 'none';
		$center.style.display = 'none';
		$next.style.display = 'block';
		$box.style.display = 'none';
		$pwd.style.display = 'none';
		COM.closeLoading();
		if(wifiFlag === 1) {
			_nextFuc = _goWifi12;
			mui('#ad_box>p')[0].innerHTML = '点击下一步切换到有网络的wifi；';
		} else {
			_nextFuc = _f12BindDo;
			mui('#ad_box>p')[0].innerHTML = '请手动切换到可用wifi，然后点击下一步；';
		}
	}

	/**
	 * wifiFlag === 0 与绑定
	 */
	var _f0bindDo = function() {
		if(DEBUG) console.log('==========执行 DEVICE_USER_INFO _f0bindDo');
		DEVICE.bindDevice(deviceCode, function(data) {
			_onBindEnd(data);
		}, function() {
			setTimeout(function() {
				_f0bindDo();
			}, 2000);
		});
	}

	/**
	 * 绑定设备昵称
	 */
	var _bindAlias = function() {
		mui.prompt('请输入您对此设备的备注：', '备注', '提示', ['确定'], function(e) {
			var name = e.value;
			DEVICE.updateDeviceName(deviceCode, name, function() {
				COM.openWindow('liliao_device_list', undefined, true);
//				setTimeout(function() {
//					plus.webview.close(plus.webview.currentWebview());
//				}, 1000);
			}, function() {
				_bindAlias();
			});
		}, 'div');
	}

	/**
	 * 绑定结束事件
	 * @param {Object} data
	 */
	var _onBindEnd = function(data) {
		if(DEBUG) console.log('==========执行 DEVICE_USER_INFO _onBindEnd');
		if(data && data.flag) {
			_bindEndData = data.params[0];
			_bindAlias();
		} else {
			COM.openWindow('liliao_device_list', undefined, true);
		}

	}

	/**
	 * wifiFlag === 1 || 2 绑定
	 */
	var _f12BindDo = function() {
		if(DEBUG) console.log('==========执行 DEVICE_USER_INFO _f12BindDo');
		COM.createLoading('正在绑定设备...');
		DEVICE.bindDevice(deviceCode, function(data) {
			_onBindEnd(data);
		}, function() {
			COM.closeLoading();
			mui.alert('无法绑定设备,请确认是否已经切换到可用网络', '提示');
		});
	}

	/**	
	 * 返回之前的wifi状态
	 */
	var _endBack = function(flag) {
		if(DEBUG) console.log('==========执行 DEVICE_USER_INFO _endBack');
		var netWorkId = COM.getStorage(STORAGE.net_work_id);
		if(netWorkId !== null) {
			netWorkId = parseInt(netWorkId);
			wifi.removeExsits(cSSID); //移除当前配置的ssid
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
			_reset();
			COM.closeLoading();
		}
		return netWorkId;
	}

	/**
	 * 跳转wifi设置界面
	 */
	var _goWifi = function() {
		if(DEBUG) console.log('==========执行 DEVICE_USER_INFO _goWifi');
		try {
			wifi.goWifi();
			_goWifiAfter();
		} catch(e) {
			wifiFlag = 2;
			mui.alert('打开wifi失败,请手动跳转。', '提示');
			_reset();
		}
	}
	var _goWifi12 = function() {
		if(DEBUG) console.log('==========执行 DEVICE_USER_INFO _goWifi');
		_nextFuc = _f12BindDo;

		wifi.goWifi();
		$prev.style.display = 'none';
		$center.style.display = 'none';
		$next.style.display = 'inline-block';
		$box.style.display = 'none';
		$pwd.style.display = 'none';

		mui('#ad_box>p')[0].innerHTML = '切换到有网络的wifi后，点击下一步保存数据；';
	}

	/**
	 * 跳转wifi界面后 显示
	 */
	var _goWifiAfter = function() {
		_nextFuc = _secondStart;
		$prev.style.display = 'none';
		$center.style.display = 'none';
		$next.style.display = 'inline-block';
		$box.style.display = 'none';
		$pwd.style.display = 'none';
		setTimeout(function() {
			mui('#ad_box>p')[0].innerHTML = '1.账号为带有<span>' + ssid + '</span>的wifi名,密码:<span>' + pwd + '</span>;<br/>' +
				'2.确认已连入床垫wifi后，点击下一步；'
		}, 4000);
	}

	/**
	 * 通过 step 进行下一步操作
	 */
	var _goByStep = function() {
		if(DEBUG) console.log('=step====' + step);
		stepFucArr[step]();
	}
	/**
	 * 重置页面
	 */
	var _reset = function() {
		if(DEBUG) console.log('==========执行 DEVICE_USER_INFO _reset');
		if(DEBUG) console.log('=wifiFlag====' + wifiFlag);
		if(wifiFlag === 0) {
			_nextFuc = _f0Start;
			$prev.style.display = 'none';
			$center.style.display = 'none';
			$next.style.display = 'inline-block';
			$box.style.display = 'none';
			$pwd.style.display = 'none';
			mui('#ad_box>p')[0].innerHTML = '请确认床垫<span>电源已打开</span>，wifi指示灯在闪烁；';
		} else if(wifiFlag === 1) {
			_nextFuc = _goWifi;
			$prev.style.display = 'none';
			$center.style.display = 'none';
			$next.style.display = 'inline-block';
			$box.style.display = 'none';
			$pwd.style.display = 'none';

			mui('#ad_box>p')[0].innerHTML = '1.请确认床垫<span>电源已打开</span>，wifi指示灯在闪烁；<br/>' +
				'2.手动连接床垫wifi，账号为带有<span>' + ssid + '</span>的wifi名,密码:<span>' + pwd + '</span>;<br/>' +
				'3.点击<span>下一步</span>跳转wifi设置界面;';
		} else {
			_nextFuc = _secondStart;
			$prev.style.display = 'none';
			$center.style.display = 'none';
			$next.style.display = 'inline-block';
			$box.style.display = 'none';
			$pwd.style.display = 'none';

			mui('#ad_box>p')[0].innerHTML = '1.请确认床垫<span>电源已打开</span>，wifi指示灯在闪烁；<br/>' +
				'2.手动连接床垫wifi，账号为带有<span>' + ssid + '</span>的wifi名,密码:<span>' + pwd + '</span>;<br/>' +
				'3.确认连接床垫wifi后，点击<span>下一步</span>开始配置;';
		}
		document.getElementById('ad_box').style.display = 'block';
		if(DEBUG) console.log('=====关闭蒙层');
		COM.closeLoading();
	}
	var $prev = null; //上一步
	var $next = null; //下一步
	var $center = null; //刷新
	var $box = null; //列表box
	var $pwd = null; //输入框密码
	/**
	 * 初始化
	 */
	var _init = function() {
		if(DEBUG) console.log('==========执行 DEVICE_USER_INFO _init');
		mui('#android_add_box').on('tap', 'li', function() {
			var fuc = this.getAttribute('fuc');
			if(DEBUG) console.log('=fuc====' + fuc);
			if(fuc) {
				eval('(' + fuc + ')');
			} else {
				var tSsid = this.innerText.trim();
				if(DEBUG) console.log('=tSsid====' + tSsid);
				_f0Connect(tSsid);
			}
		});

		mui('#ad_box').on('tap', '.mui-btn', function() {
			var txt = this.innerText.trim();
			if(DEBUG) console.log('=正在执行====' + txt);
			if(txt == '上一步') {
				_prevFuc();
			} else if(txt == '下一步') {
				_nextFuc();
			} else {
				_refreshFuc(); //刷新操作
			}
		});
		COM.addReload(function() {
			_reset();
		});
		var $line = mui('#ad_box>.adb-btn-line')[0];
		$prev = $line.getElementsByClassName('adb-prev')[0];
		$next = $line.getElementsByClassName('adb-next')[0];
		$center = $line.getElementsByClassName('adb-center')[0];
		$box = mui('#android_add_box')[0];
		$pwd = document.getElementById('wifi_pwd_box');
	}

	/**
	 * 设置床垫中的wifi连接
	 * @param {Object} ssid
	 * @param {Object} auth
	 * @param {Object} encry
	 */
	var selectedSSIDChange = function(ssid, auth, encry) {
		try {
			wifiSet.set_sta_ssid(ssid, auth, encry);
			_secondPwd(ssid, auth);
			console.log('=ssid====' + ssid + ';auth===' + auth + ';encry====' + encry);
		} catch(e) {
			_endBack(true);
			mui.alert('检测到程序出错,请重试', '提示');
		}
	}

	/**
	 * 开始函数 判断wifiFlag
	 */
	var _start = function() {
		if(DEBUG) console.log('==========执行 DEVICE_USER_INFO _start');
		if(DEBUG) console.log('=====开启蒙层');
		COM.createLoading('正在检测手机环境...');

		COM.addHN(true, "添加新设备", CONST_MENU.home);
//		COM.back(false);
		COM.addReload(_reset);
		_init();
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
		COM.closeLoading();
		_reset();
	}

	return {
		start: _start //开始
	}
})();