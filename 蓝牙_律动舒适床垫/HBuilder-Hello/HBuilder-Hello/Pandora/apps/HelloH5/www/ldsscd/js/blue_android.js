
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
	self.connect = {};
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
						if(self.isNeed(BleDevice)) { //去重
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
	//	if(BleDevice.getName() != this.name) {
	//		return false;
	//	}
	var flag = true;
	var list = this.result;
	for(var i = 0; i < list.length; i++) {
		if(list[i].getAddress() === BleDevice.getAddress()) {
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

	self.disconnect();

	//打开蓝牙并执行搜索
	self.enable(_startSearch);
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
 * 将蓝牙连接断开
 */
BLUE_ANDROID.prototype.disconnect = function() {
	if(this.BGatt) {
		this.BGatt.disconnect();
		this.BGatt = null;
	}
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
							errorCallBack && errorCallBack('无法获取蓝牙服务,请重试');
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
								endCallBack && endCallBack(1);
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

	//这个消息有些时候需要传递java的bytes类型,自行转换
	//var bytes = plus.android.invoke(txt, 'getBytes', 'US-ASCII');
	self.wGattCharacteristic.setValue(txt);
	self.sendFlag = true;
	if(DEBUG) console.log('正在发送消息' + txt);
	if(self.BGatt.writeCharacteristic(self.wGattCharacteristic)) {
		if(DEBUG) console.log('消息已发送');
		callBack && callBack();
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