//存储四个选择器对象
var popArr = [null, null, null, null];
var blueAndroid = null; //安卓蓝牙对象
var blue_search = null;
var blue_ctrl = null;
var go_back = null;
var bs_box = null;
var bs_devices = null;
var qd_box = null;
var ll_box = null;
var blueList = [];
var step = 0; //当前进行步骤 0初始化 1正在搜索 2连接蓝牙
var setStr = ["L", "1", "|", "1", "0", "8", "0", "6", "0", "|", "1", "3", "5", "0", "6", "0"]; //存储设置对象
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
	//初始化 _popArr
	popArr[0] = createPop(MODE_DATA);
	popArr[1] = createPop(USE_TIME_DATA);
	popArr[2] = createPop(TEMP_DATA);
	popArr[3] = createPop(USE_TIME_DATA);
	blue_search = document.getElementById('blue_search');
	blue_ctrl = document.getElementById('blue_ctrl');
	go_back = document.getElementById('go_back');
	bs_box = document.getElementById('bs_box');
	bbs_info = document.getElementById('bbs_info');
	bs_devices = document.getElementById('bs_devices');
	ll_box = document.getElementById('ll_box');
	qd_box = document.getElementById('qd_box');
}
/**
 * 绑定数据
 */
var _bind = function() {
	mui('#blue_ctrl').on('tap', '.li-select', function() {
		var index = this.getAttribute('index');
		console.log('=pop,index====' + index);
		var now = this;
		popArr[index].show(function(items) {
			now.innerHTML = items[0].text;
			_popSetStr(index, items[0].value);
			if(DEBUG) console.log('=setStr====' + setStr);
		});
	});
	range = document.getElementById('field-range');
	range.addEventListener('input', function() {
		document.getElementById('fr_v').innerHTML = this.value;
		var tV = this.value + '';
		if(tV.length === 1) {
			setStr[4] = '0';
			setStr[5] = tV;
		} else {
			setStr[4] = tV[0];
			setStr[5] = tV[1];
		}
		if(DEBUG) console.log('=setStr====' + setStr);
	});
	mui('#header').on('tap', '#go_back', _goBack);
	mui('#header').on('tap', '.mui-pull-right', function(){
		COM.openWindow('help','help.html');
	});
	mui('#bs_box').on('tap', '#bss_search', _searchClick);
	mui('#bs_devices').on('tap', 'a', _searchClick);
	mui('#bs_devices').on('tap', 'i', function() {
		_setRemarks.call(this);
	});
	mui('#bs_devices').on('tap', '.bds-ctrl', function() {
		_connectBlue.call(this);
	});
	mui('#blue_ctrl .mui-switch').each(function() { //循环所有toggle
		/**
		 * toggle 事件监听
		 */
		this.addEventListener('toggle', function(event) {
			var index = this.getAttribute('index');
			if(DEBUG) console.log('=swtich,index====' + index);
			if(event.detail.isActive) {
				setStr[index] = '1';
				this.parentNode.next().setAttribute('class','bc-qidong list-show');
			} else {
				setStr[index] = '0';
				this.parentNode.next().setAttribute('class','bc-qidong list-hide');
			}
			if(DEBUG) console.log('=setStr====' + setStr);
		});
	});
	mui('#blue_ctrl').on('tap', '#do_it', function() {
		var t = setStr.join('') + '\r\n';
		if(DEBUG) console.log('=sendInfo t===='+t);
		blueAndroid.sendInfo(t, function(rs) {
			if(DEBUG) console.log('=sendInfo rs===='+rs);
			document.getElementById('do_it').innerHTML = '正在运行';
		});
	});

	mui.back = _goBack;
}
/**
 * pop对象改变后，设置setStr的值
 * @param {Object} arr
 * @param {Object} value
 */
var _popSetStr = function(index, value) {
	var tArr = [
		[3],
		[6, 7, 8],
		[11, 12],
		[13, 14, 15]
	];
	var arr = tArr[index];
	for(var i = 0; i < value.length; i++) {
		setStr[arr[i]] = value[i];
	}
}
/**
 * 重置 设置
 */
var _reset_blue_ctrl = function() {
	mui('#blue_ctrl .bc-reset').each(function() {
		this.innerHTML = this.getAttribute('title');
		range.value = '8';
	});
	mui('#blue_ctrl .mui-switch').each(function() {
		var className = this.getAttribute('class');
		if(className.indexOf('mui-active') === -1) {
			mui(this).switch().toggle();
		}
	});
	document.getElementById('do_it').innerHTML = '开始运行';
}

/**
 * 返回功能
 */
var _goBack = function(flag) {
	if(DEBUG) console.log('==========正在执行 _goBack step===='+step);
	if(step === 1) {
		bs_box.setAttribute('class', 'bs_before');
		if(!flag){
			blueAndroid.stopSearch();
			_createList();
		}
	} else if(step === 2) {
		blueAndroid.disable();
	} else {
		
	}
	if(window.nowTemp){
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
		if(step === 1) {
			_createList();
			_goBack(true);
		}
	});
	bbs_info.innerHTML = '正在搜索<br/>已搜索到0个设备';
	var t = setInterval(function() {
		bbs_info.innerHTML = '正在搜索<br/>已搜索到' + blueAndroid.result.length + '个设备';
	}, 1000);
}

//
var _createList = function(){
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
			var tIA = 0;
			setStr = ["L", "1", "|", "1", "0", "8", "0", "6", "0", "|", "1", "3", "5", "0", "6", "0"];
			_reset_blue_ctrl();
			var tFirst = setInterval(function() {
				if(DEBUG) console.log('=tIA===='+tIA);
				var info = blueAndroid.readInfo();
				if(tIA++ > 5) {
					clearInterval(tFirst);
					if(step === 2){
						_hideLoading();
						go_back.style.display = 'block';
						blue_search.style.display = 'none';
						blue_ctrl.style.display = 'block';
					}				
				} else if(info) {
					clearInterval(tFirst);
					if(step === 2){
						_hideLoading();
						if(DEBUG) console.log('=info===='+info);
						document.getElementById('bc_temp_now').innerHTML = info.split('|')[3] +'℃';
						go_back.style.display = 'block';
						blue_search.style.display = 'none';
						blue_ctrl.style.display = 'block';
						window.nowTemp = setInterval(function(){
							var tInfo = blueAndroid.readInfo();
							if(DEBUG) console.log('=tInfo===='+tInfo);
							if(tInfo){
								var tttt = tInfo.split('|')[3];
								if(tttt){
									document.getElementById('bc_temp_now').innerHTML = tttt +'℃';
								}
							}
						},30*1000);
					}
				}
			}, 1000);
		}
	},function(txt){
		mui.alert(txt,'提示');
		_goBack();
	});
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
			console.log('=txt===='+txt);
			if(txt) {
				elem.innerHTML = '备注：'+ txt;
				COM.setStorage(address, txt);
			}
		}
	},'div');
}

/**
 * 创建pop对象
 * @param {Object} data 对象值
 */
var createPop = function(data) {
	var tmpPop = new mui.PopPicker();
	tmpPop.setData(data);
	return tmpPop;
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
 * 启动模式数据
 */
var MODE_DATA = [{
		value: '1',
		text: '循环模式'
	},
	{
		value: '2',
		text: '两侧牵引模式'
	},
	{
		value: '3',
		text: '右循环 从脚到头'
	},
	{
		value: '4',
		text: '左循环 从头到脚'
	},
	{
		value: '5',
		text: '交替模式  奇偶交替'
	}
];
//时长数据
var USE_TIME_DATA = [{
	value: '000',
	text: '一直开启'
}];
for(var i = 30; i <= 120; i += 15) {
	var t = i + '';
	if(t.length < 3) {
		t = '0' + t;
	}
	USE_TIME_DATA.push({
		value: t,
		text: i + '分钟'
	});
}
//温度数据 25-45
var TEMP_DATA = [];
for(var i = 25; i <= 45; i++) {
	TEMP_DATA.push({
		value: i,
		text: i + '分钟'
	});
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
BLUE_ANDROID.prototype.isNeed = function(BleDevice){
	if(BleDevice.getName() != this.name){
		return false;
	}
	var flag = true;
	var list = this.result;
	for(var i = 0; i < list.length ;i++){
		if(list[i].getAddress() === blueObj.getAddress()){
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
BLUE_ANDROID.prototype.stopSearch = function(){
	if(DEBUG) console.log('=this.searchFlag===='+this.searchFlag);
	if(this.searchFlag){
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
BLUE_ANDROID.prototype.createService = function(deviceAddress, endCallBack,errorCallBack) {
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
						if(DEBUG) console.log('=size===='+bGattServices.size());
						if(sI++ > 5){
							clearInterval(t);
							errorCallBack && errorCallBack('无法获取蓝牙服务');
						}else if(bGattServices.size() > 0) {
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
							if(self.rGattCharacteristic && self.wGattCharacteristic){
								endCallBack && endCallBack();
							}else{
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
	if(DEBUG) console.log('正在发送消息' + txt);
	if(self.BGatt.writeCharacteristic(self.wGattCharacteristic)) {
		if(DEBUG) console.log('消息已发送');
		var readI = 0;
		var t = setInterval(function() {
			self.BGatt.readCharacteristic(self.rGattCharacteristic);
			var data = self.rGattCharacteristic.getValue();
			if(data != null) {
				if(DEBUG) console.log('读取到返回数据：' + data);
				self.sendFlag = false;
				clearInterval(t);
				//发送回来的会是ascll码表  具体看蓝牙模块怎么提供
				var dataStr = String.fromCharCode.apply(String, data);
				dataStr = dataStr.replaceAll('\r', '').replaceAll('\n', '');
				callBack && callBack(dataStr);
			}
			if(readI++ === 5) { //最多读取二十次  超过则记做超时
				if(DEBUG) console.log('超时');
				clearInterval(t);
				self.sendFlag = false;
				callBack && callBack(-2);
			}
		}, 3000);
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