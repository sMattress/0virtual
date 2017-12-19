var blueAndroid = null; //安卓蓝牙对象
var blue_search = null;
var blue_ctrl = null;
var go_back = null;
var bs_box = null;
var bs_devices = null;
var lc_info = null;
var lc_btn = null;
var lc_stage = null;
var lc_stageLis = null;
var l_t = null;
var l_s = null;
var r_t = null;
var r_s = null;
var power_btn = null;
var lcbStr = 'lc-btn';
var lcsStr = 'lc-stage';
var blueList = [];
var step = 0; //当前进行步骤 0初始化 1正在搜索 2连接蓝牙

//存储当前硬件的值 下标0->开关   1->左边状态(待机|加热|理疗)  2->右边状态
//3->左区目标温度  4->右区目标温度
var valueArr = [1, 1, 1, 35, 35];
var stageArr = ['待机', '加热', '理疗'];
/**
 * 开始函数
 */
var start = function() {
	try {
		blueAndroid = new BLUE_ANDROID();
		_init();
		_bind();
	} catch(e) {
		console.log('=e====' + e);
		mui.alert('您的手机不支持蓝牙控制,换一个手机试试吧！', '对不起');
	}
}
/**
 * 初始化数据
 */
var _init = function() {
	blue_search = document.getElementById('blue_search');
	blue_ctrl = document.getElementById('blue_ctrl');
	go_back = document.getElementById('go_back');
	bs_box = document.getElementById('bs_box');
	bbs_info = document.getElementById('bbs_info');
	bs_devices = document.getElementById('bs_devices');
	lc_btn = document.getElementById('lc_btn');
	lc_info = document.getElementById('lc_info');
	lc_stage = document.getElementById('lc_stage');
	l_t = document.getElementById('l_t');
	l_s = document.getElementById('l_s');
	r_t = document.getElementById('r_t');
	r_s = document.getElementById('r_s');
	lc_stageLis = lc_stage.getElementsByTagName('li');
	power_btn = lc_btn.getElementsByTagName('li')[4];
	//	_showValueArr();
}
/**
 * 绑定数据
 */
var _bind = function() {
	mui('#header').on('tap', '#go_back', _goBack);
	mui('#header').on('tap', '.mui-pull-right', function() {
		COM.openWindow('help', 'help.html');
	});
	mui('#bs_box').on('tap', '#bss_search', _searchClick);
	mui('#bs_devices').on('tap', 'a', _searchClick);
	mui('#bs_devices').on('tap', 'i', function() {
		_setRemarks.call(this);
	});
	mui('#bs_devices').on('tap', '.bds-ctrl', function() {
		_connectBlue.call(this);
	});
	mui('#lc_btn').on('tap', 'li', lc_btn_click);
	mui('#lc_stage').on('tap', 'li', lc_stage_click);
	mui.back = _goBack;
}
/**
 * 公用发送消息到蓝牙
 * @param {Object} txt 发送的字符串
 * @param {Function} success 发送成功回调
 */
var _comSendInfo = function(txt, success) {
	blueAndroid.sendInfo(txt, function(rs) {
		if(rs === -1) {
			mui.toast('您点得太快啦，请慢一点！');
			_hideLoading();
		} else if(rs === -2) {
			mui.toast('您刚刚的操作没有响应呢，请重试！');
			_hideLoading();
		} else {
			if(rs[1] === '1') {
				success && success(rs);
			} else {
				mui.toast('您刚刚的操作没有响应呢，请重试！');
				_hideLoading();
			}
		}
	});
}
//ValueArr转化为按钮的展示
var _showValueArr = function() {
	var lcb = 0;
	if(valueArr[1] == 1) {
		lcb = 1;
	}
	if(valueArr[2] == 1) {
		lcb += 2
	}
	lcb *= valueArr[0];
	lc_btn.setAttribute('class', lcbStr + lcb);
	lc_stage.setAttribute('class', lcsStr + valueArr[0]);
	power_btn.setAttribute('class', 'lcb-cc' + valueArr[0]);
	lc_info.setAttribute('class', 'lc-info com-width blue-clear lc-info' + valueArr[0]);
	l_s.innerHTML = stageArr[valueArr[1]];
	l_t.innerHTML = valueArr[3] + '℃';
	r_s.innerHTML = stageArr[valueArr[2]];
	r_t.innerHTML = valueArr[4] + '℃';

	if(valueArr[1] == 1) {
		lc_stageLis[0].setAttribute('class', 'li-hover');
		lc_stageLis[2].setAttribute('class', '');
	} else if(valueArr[1] == 2) {
		lc_stageLis[0].setAttribute('class', '');
		lc_stageLis[2].setAttribute('class', 'li-hover');
	} else {
		lc_stageLis[0].setAttribute('class', '');
		lc_stageLis[2].setAttribute('class', '');
	}
	if(valueArr[2] == 1) {
		lc_stageLis[1].setAttribute('class', 'li-hover');
		lc_stageLis[3].setAttribute('class', '');
	} else if(valueArr[2] == 2) {
		lc_stageLis[1].setAttribute('class', '');
		lc_stageLis[3].setAttribute('class', 'li-hover');
	} else {
		lc_stageLis[1].setAttribute('class', '');
		lc_stageLis[3].setAttribute('class', '');
	}
}

/**
 * lc_btn下的li点击事件
 */
var lc_btn_click = function() {
	var clickElem = this;
	var title = this.getAttribute('title');
	if(title === '2') { //开关事件
		if(DEBUG) console.log('=====开关按钮已点击');
		var power = 1 - valueArr[0];
		var sendTxt = 'L20|' + power + '\r\n';
		if(DEBUG) console.log('=sendTxt====' + sendTxt);
		_comSendInfo(sendTxt, function() {
			valueArr[0] = power;
			clickElem.setAttribute('class', 'lcb-cc' + power);
			_showValueArr();
		});
	} else if(title === '0' && valueArr[1] == 1) { //左侧温度加减
		if(DEBUG) console.log('=====左侧温度加减按钮');
		_temperatureChange.call(this, '1', 3);
	} else if(title === '1') {
		if(DEBUG) console.log('=====右侧温度加减按钮');
		_temperatureChange.call(this, '0', 4);
	}
}

/**
 * 
 * @param {Object} side 左右
 * @param {Object} index valueArr的下标
 */
var _temperatureChange = function(side, index) {
	if(DEBUG) console.log('=side===' + side + ';=index====' + index);
	var v = valueArr[index] + parseInt(this.getAttribute('v'));
	if(v < 25) {
		mui.toast('最低温度只能设置为25℃哦！');
	} else if(v > 45) {
		mui.toast('最高温度只能设置为45℃哦！');
	} else {
		var sendTxt = 'L16|' + side + '|1|' + v + '\r\n';
		if(DEBUG) console.log('=sendTxt====' + sendTxt);
		_comSendInfo(sendTxt, function() {
			valueArr[index] = v;
			_showValueArr();
		});
	}
}

/**
 * lc_stage下的li点击事件
 */
var lc_stage_click = function() {
	var index = parseInt(this.getAttribute('i'));
	var value = parseInt(this.getAttribute('v'));
	var side = this.getAttribute('s');
	var mode = 0;
	if(value != valueArr[index]) {
		mode = value;
	}
	var sendTxt = 'L16|' + side + '|' + mode + '|' + valueArr[index + 2] + '\r\n';
	if(DEBUG) console.log('=sendTxt====' + sendTxt);
	_comSendInfo(sendTxt, function() {
		valueArr[index] = mode;
		_showValueArr();
	});
}

/**
 * 重置 设置
 */
var _reset_blue_ctrl = function() {

}

/**
 * 返回功能
 */
var _goBack = function(flag) {
	if(DEBUG) console.log('==========正在执行 _goBack step====' + step);
	if(step === 1) {
		blueAndroid.stopSearch();
		_createList();
		bs_box.setAttribute('class', 'bs_before');
	} else if(step === 2) {
		blueAndroid.disable();
	} else {

	}
	if(window.nowTemp) {
		clearInterval(window.nowTemp);
		window.nowTemp = null;
	}
	blue_search.style.display = 'block';
	blue_ctrl.style.display = 'none';
	go_back.style.display = 'none';
	_hideLoading();
	step = -1;
}
/**
 * 搜索按钮点击事件
 */
var _searchClick = function() {
	step = 1;
	if(DEBUG) console.log('==========正在执行 _showSearchIng');
	go_back.style.display = 'block';
	//动画效果由CSS3 实现
	bs_box.setAttribute('class', 'bs_before bsb-active');
	var list = null;
	blueAndroid.searchDevice(CONSTANT.blueName, function() {
		clearInterval(t);
		_goBack();
	});
	bbs_info.innerHTML = '正在搜索<br/>已搜索到0个设备';
	var t = setInterval(function() {
		bbs_info.innerHTML = '正在搜索<br/>已搜索到' + blueAndroid.result.length + '个设备';
	}, 1000);
}

//
var _createList = function() {
	var list = blueAndroid.result;
	if(list.length === 0) {
		bs_devices.innerHTML = '暂无设备，点击<a>扫描</a>开始获取设备';
	} else {
		var html = '';
		for(var i = 0; i < list.length; i++) {
			var blueObj = list[i];
			var address = blueObj.getAddress();
			html += '<li address="' + address + '"><div class="bds-name">设备：' + blueObj.getName() +
				'</div><div class="bds-nick"><span>备注：' + (COM.getStorage(address) || '未设置') + '</span><i></i></div><div class="bds-ctrl"></div></li>';
		}
		bs_devices.innerHTML = html;
	}
}

/**
 * 连接蓝牙
 */
var _connectBlue = function() {
	if(DEBUG) console.log('==========正在执行 _connectBlue');
	_showLoading();
	var address = this.parentNode.getAttribute('address');
	step = 2;
	blueAndroid.createService(address, function() {
		if(DEBUG) console.log('=createService已回调');
		if(step === 2) {
			if(DEBUG) console.log('=sendTxt====L32|2');
			_comSendInfo('L32|2\r\n', function(rs) {
				if(step === 2) {
					var arr = rs.split('|');
					//右边
					var str0 = arr[2];
					valueArr[2] = _stringToInt(str0.substring(0, 1), 0);
					valueArr[4] = _stringToInt(str0.substring(1, 3), 35);
					//左边
					var str1 = arr[3];
					valueArr[1] = _stringToInt(str1.substring(0, 1), 0);
					valueArr[3] = _stringToInt(str1.substring(1, 3), 35);
					//开关
					valueArr[0] = _stringToInt(arr[1], 0);
					_showValueArr();
					_hideLoading();
					go_back.style.display = 'block';
					blue_search.style.display = 'none';
					blue_ctrl.style.display = 'block';
				}
			});
		}
	}, function(txt) {
		mui.alert(txt, '提示');
		_goBack();
	});
}
var _stringToInt = function(s, d) {
	var t = parseInt(s);
	if(isNaN(t)) {
		return d;
	} else {
		return t;
	}
}
/**
 * 设置蓝牙备注
 */
var _setRemarks = function() {
	if(DEBUG) console.log('==========正在执行 _setRemarks');
	var address = this.parentNode.parentNode.getAttribute('address');
	var elem = this.prev();
	mui.prompt('请输入您对此设备的备注：', '备注', '输入备注', CONSTANT.confirmBtn, function(e) {
		if(e.index == CONSTANT.confirmSure) {
			var txt = e.value.trim();
			console.log('=txt====' + txt);
			if(txt) {
				elem.innerHTML = '备注：' + txt;
				COM.setStorage(address, txt);
			}
		}
	}, 'div');
}

var _showLoading = function() {
	document.getElementById('loading-bg').style.display = 'block';
	document.getElementById('loading').style.display = 'block';
}
var _hideLoading = function() {
	document.getElementById('loading-bg').style.display = 'none';
	document.getElementById('loading').style.display = 'none';
}

/**
 * 控制蓝牙连接  android 
 */
window.BLUE_ANDROID = function() {
	this._init();
}
/**
 * android5.0及以上版本调用此函数
 * 初始化环境 导入包 校验是否可用蓝牙
 */
BLUE_ANDROID.prototype._init = function() {
	var self = this;
	var main = self.main = plus.android.runtimeMainActivity();
	var Context = plus.android.importClass("android.content.Context");
	var BluetoothAdapter = plus.android.importClass("android.bluetooth.BluetoothAdapter");
	var BAdapter = self.BAdapter = BluetoothAdapter.getDefaultAdapter();
	if(!BAdapter) {
		throw '设备不支持蓝牙';
	} else {
		var IntentFilter = plus.android.importClass('android.content.IntentFilter');
		var BluetoothDevice = plus.android.importClass("android.bluetooth.BluetoothDevice");
		var Intent = plus.android.importClass("android.content.Intent");
		var bdevice = new BluetoothDevice();
		var receiver = self.receiver = plus.android.implements('io.dcloud.android.content.BroadcastReceiver', {
			onReceive: function(context, intent) { //实现onReceiver回调函数
				if(DEBUG) console.log('action===>' + intent.getAction()); //获取action
				if(intent.getAction() == "android.bluetooth.adapter.action.DISCOVERY_FINISHED") {
					if(DEBUG) console.log('扫描已结束,共有' + self.result.length + '条数据');
					//					self.BAdapter.cancelDiscovery();
					main.unregisterReceiver(receiver); //取消监听 
					self.searchFlag = false;
					self.endCallBack && self.endCallBack(self.result); //执行搜索回调结束回调
				} else {
					//此值是当前扫描到的设备的属性
					var BleDevice = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE);
					if(!BleDevice) {
						if(DEBUG) console.log('不是设备 BleDevice');
					} else {
						if(DEBUG) console.log('已扫描到设备，name===>' + BleDevice.getName() + ';address===>' + BleDevice.getAddress());
						if(self.isNeed(BleDevice)) { //如果是需要的设备，则添加
							self.result.push(BleDevice);
						}
					}
				}
			}
		});
		var filter = self.filter = new IntentFilter();
		filter.addAction(bdevice.ACTION_FOUND);
		filter.addAction(BAdapter.ACTION_DISCOVERY_STARTED);
		filter.addAction(BAdapter.ACTION_DISCOVERY_FINISHED);
		filter.addAction(BAdapter.ACTION_STATE_CHANGED);
	}
}

/**
 * 检测是否符合需要的
 * @param {Object} blueObj
 */
BLUE_ANDROID.prototype.isNeed = function(BleDevice) {
	if(BleDevice.getName() != this.name) {
		return false;
	}
	var flag = true;
	var list = this.result;
	for(var i = 0; i < list.length; i++) {
		if(list[i].getAddress() === blueObj.getAddress()) {
			flag = false;
			break;
		}
	}
	return flag;
}

/**
 * 扫描需要的周边蓝牙设备
 * @param {Object} name 扫描的设备名
 * @param {Object} endCallBack 扫描结束回调函数 传入扫描结果[new BluetoothDevice()]
 */
BLUE_ANDROID.prototype.searchDevice = function(name, endCallBack) {
	if(DEBUG) console.log('searchDevice 运行');
	var self = this;
	this.name = name;
	this.endCallBack = endCallBack;
	this.result = []; //搜索到的结果
	var _startSearch = function() {
		self.searchFlag = true;
		//这儿的this在enable函数已替换成self
		this.main.registerReceiver(this.receiver, this.filter); //注册监听 搜索结束会注销
		this.BAdapter.startDiscovery(); //开启搜索
	}
	this.disable(); //先将蓝牙关闭 然后再打开
	var t = setInterval(function() {
		if(!self.isEnabled()) {
			clearInterval(t);
			//打开蓝牙并执行搜索
			self.enable(_startSearch);
		}
	}, 1000);
}

/**
 * 停止搜索
 */
BLUE_ANDROID.prototype.stopSearch = function() {
	if(DEBUG) console.log('=this.searchFlag====' + this.searchFlag);
	if(this.searchFlag) {
		console.log('=已经注销监听')
		this.main.unregisterReceiver(this.receiver); //取消监听 
	}
}

/**
 * 查看蓝牙是否打开
 */
BLUE_ANDROID.prototype.isEnabled = function() {
	return this.BAdapter.isEnabled();
}
/**
 * 将蓝牙关闭
 */
BLUE_ANDROID.prototype.disable = function() {
	return this.BAdapter.disable();
}
/**
 * 打开蓝牙
 * @param {Object} callBack 打开成功的回调函数
 */
BLUE_ANDROID.prototype.enable = function(callBack) {
	var self = this;
	if(this.isEnabled()) { //蓝牙是打开的
		callBack && callBack.call(self);
	} else {
		this.BAdapter.enable(); //将蓝牙设置为打开
		var tmpI = 0;
		var tEnable = setInterval(function() {
			if(self.isEnabled()) { //蓝牙打开成功
				clearInterval(tEnable);
				setTimeout(function() {
					//在未打开蓝牙情况下通过代码代开
					//有些时候无法获取数据
					//所以进行延时操作
					callBack && callBack.call(self);
				}, 2000);
			}
			if(tmpI++ > 10) {
				clearInterval(tEnable);
				throw '打开蓝牙超时';
			}
		}, 1000);
	}
}

/**
 * 将手机蓝牙作服务器
 * 这儿是创建需要的东西(读、写服务)
 * @param {Object} deviceAddress 将要连接的设备地址(第一次扫描以后可以缓存起来)
 * @param {Object} endCallBack 完成以后进行回调
 */
BLUE_ANDROID.prototype.createService = function(deviceAddress, endCallBack, errorCallBack) {
	if(DEBUG) console.log('==========createService已执行');
	var self = this;
	this.enable(function() {
		if(DEBUG) console.log('deviceAddress==>' + deviceAddress);
		var BleDevice = this.BAdapter.getRemoteDevice(deviceAddress); //通过地址获取蓝牙设备
		plus.android.importClass(BleDevice);
		if(BleDevice) {
			if(DEBUG) console.log('BleDevice 存在===>' + BleDevice.getName());
			//导入一些包
			plus.android.importClass("java.util.ArrayList");
			plus.android.importClass("java.util.List");
			var BluetoothGattCharacteristic = plus.android.importClass("android.bluetooth.BluetoothGattCharacteristic");
			var BluetoothGattDescriptor = plus.android.importClass("android.bluetooth.BluetoothGattDescriptor");
			var BluetoothGattService = plus.android.importClass("android.bluetooth.BluetoothGattService");
			var BluetoothProfile = plus.android.importClass("android.bluetooth.BluetoothProfile");

			//这段代码没什么用  因为是虚拟类，NJS好像不能实现 有大神知道的话麻烦回复一下
			var Callback = plus.android.importClass('android.bluetooth.BluetoothGattCallback');
			var callBack = new Callback({
				onConnectionStateChange: function(gatt, status, newState) {
					if(DEBUG) console.log('onConnectionStateChange 已执行');
				}
			});

			//获取到连接控制器
			var BGatt = self.BGatt = BleDevice.connectGatt(this.main, false, callBack);
			plus.android.importClass(BGatt);

			if(BGatt) {
				if(DEBUG) console.log('BGatt已获取')
				//因为没法进入回调函数 所以就直接认定是3秒后已连接 能解决大部分情况 
				setTimeout(function() {
					//获取服务,因为没有办法进入回调函数 所以使用定时器来获取
					BGatt.discoverServices();
					var sI = 0;
					var t = setInterval(function() {
						var bGattServices = BGatt.getServices(); //蓝牙会提供多个服务
						if(DEBUG) console.log('=size====' + bGattServices.size());
						if(sI++ > 5) {
							clearInterval(t);
							errorCallBack && errorCallBack('无法获取蓝牙服务');
						} else if(bGattServices.size() > 0) {
							clearInterval(t);
							if(DEBUG) console.log('列表已获取===' + bGattServices.size());
							//每个服务会有一个id，看你自己的蓝牙需要的是什么服务，就用什么id 这个值不定,可以自行打印看看
							//我的这个值是有人物联网蓝牙模块的读写服务 
							var sUuid = '0003cdd0-0000-1000-8000-00805f9b0131';
							for(var i = 0; i < bGattServices.size(); i++) {
								var bGattService = bGattServices.get(i);
								var uuid = bGattService.getUuid().toString();
								if(uuid === sUuid) { //获取到需要的服务
									var bGattCharacteristics = bGattService.getCharacteristics();
									//读取的uuid 此值也应该不是固定的 自己打印看看
									var read = '0003cdd1-0000-1000-8000-00805f9b0131';
									//写入的uuid 
									var write = '0003cdd2-0000-1000-8000-00805f9b0131';
									self.rGattCharacteristic = null; //读数据的对象
									self.wGattCharacteristic = null; //写数据的对象
									for(var j = 0; j < bGattCharacteristics.size(); j++) {
										var bGattCharacteristic = bGattCharacteristics.get(j);
										var uuid = bGattCharacteristic.getUuid().toString();
										if(uuid === read) {
											if(DEBUG) console.log('读对象已获取');
											var rGattCharacteristic = self.rGattCharacteristic = bGattCharacteristic;
											var descriptors = rGattCharacteristic.getDescriptors();
											var rK = '00002902-0000-1000-8000-00805f9b34fb';
											var descriptors = rGattCharacteristic.getDescriptors();
											for(var k = 0; k < descriptors.size(); k++) {
												var descriptor = descriptors.get(k);
												plus.android.importClass(descriptor);
												var uuid = descriptor.getUuid().toString();
												if(uuid === rK) {
													//注册读取监听事件
													if(DEBUG) console.log('监听已注册');
													var bytes = plus.android.invoke(descriptor.ENABLE_NOTIFICATION_VALUE, 'getBytes', 'US-ASCII');
													descriptor.setValue(bytes);
													BGatt.writeDescriptor(descriptor);
													BGatt.setCharacteristicNotification(rGattCharacteristic, true);
												}
											}
										}
										if(uuid === write) {
											if(DEBUG) console.log('写对象已获取');
											wGattCharacteristic = self.wGattCharacteristic = bGattCharacteristic;
										}
									}
									break;
								}
							}
							if(self.rGattCharacteristic && self.wGattCharacteristic) {
								endCallBack && endCallBack();
							} else {
								errorCallBack && errorCallBack('未扫描到读写服务');
							}
						}
					}, 1000);
				}, 1000);
			} else {
				errorCallBack && errorCallBack('无法连接到蓝牙控制器');
			}
		} else {
			errorCallBack && errorCallBack('无法通过此蓝牙地址获取到设备');
		}
	});
}

/* *
 * 发送消息
 */
BLUE_ANDROID.prototype.sendInfo = function(txt, callBack) {
	//	txt = '000000,AT+NAME?\r\n';
	txt = plus.android.invoke(txt, 'getBytes', 'US-ASCII');
	var self = this;
	//记录是否发送过  如果发送过 则不发送
	if(self.sendFlag) {
		callBack && callBack(-1);
		return;
	}
	//这个消息有些时候需要传递java的bytes类型,自行转换
	//var bytes = plus.android.invoke(txt, 'getBytes', 'US-ASCII');
	self.wGattCharacteristic.setValue(txt);
	self.sendFlag = true;
	console.log('正在发送消息' + txt);
	if(self.BGatt.writeCharacteristic(self.wGattCharacteristic)) {
		console.log('消息已发送');
		var readI = 0;
		var t = setInterval(function() {
			self.BGatt.readCharacteristic(self.rGattCharacteristic);
			var data = self.rGattCharacteristic.getValue();
			console.log('读取到返回数据：' + data);
			if(data != null) {
				console.log('已获取');
				self.sendFlag = false;
				clearInterval(t);
				//发送回来的会是ascll码表  具体看蓝牙模块怎么提供
				var dataStr = String.fromCharCode.apply(String, data);
				dataStr = dataStr.replaceAll('\r', '').replaceAll('\n', '')
				callBack && callBack(dataStr);
			}
			if(readI++ === 20) { //最多读取二十次  超过则记做超时
				console.log('超时');
				clearInterval(t);
				self.sendFlag = false;
				callBack && callBack(-2);
			}
		}, 100);
	}
}

/**
 *读取数据
 */
BLUE_ANDROID.prototype.readInfo = function() {
	if(DEBUG) console.log('=========执行readInfo');
	var self = this;
	self.BGatt.readCharacteristic(self.rGattCharacteristic);
	var data = self.rGattCharacteristic.getValue();
	if(data != null) {
		if(DEBUG) console.log('读取到返回数据：' + data);
		var dataStr = String.fromCharCode.apply(String, data);
		return dataStr.replaceAll('\r', '').replaceAll('\n', '');
	}
	return "";
}