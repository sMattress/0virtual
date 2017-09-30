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
				console.log('action===>' + intent.getAction()); //获取action
				if(intent.getAction() == "android.bluetooth.adapter.action.DISCOVERY_FINISHED") {
					console.log('扫描已结束,共有' + self.result.length + '条数据');
					//					self.BAdapter.cancelDiscovery();
					main.unregisterReceiver(receiver); //取消监听 
					self.endCallBack && self.endCallBack(self.result); //执行搜索回调结束回调
				} else {
					//此值是当前扫描到的设备的属性
					var BleDevice = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE);
					if(!BleDevice) {
						console.log('不是设备 BleDevice');
					} else {
						console.log('已扫描到设备，name===>' + BleDevice.getName() + ';address===>' + BleDevice.getAddress());
						if(BleDevice.getName() === self.name) { //不是要找的设备  不进行添加
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
 * 扫描需要的周边蓝牙设备
 * @param {Object} name 扫描的设备名
 * @param {Object} endCallBack 扫描结束回调函数 传入扫描结果[new BluetoothDevice()]
 */
BLUE_ANDROID.prototype.searchDevice = function(name, endCallBack) {
	console.log('searchDevice 运行');
	var self = this;
	this.name = name;
	this.endCallBack = endCallBack;
	this.result = []; //搜索到的结果
	var _startSearch = function() {
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
 * 查看蓝牙是否打开
 */
BLUE_ANDROID.prototype.isEnabled = function() {
	return this.BAdapter.isEnabled();
}
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
		var t = setInterval(function() { 
			if(self.isEnabled()) { //蓝牙打开成功
				clearInterval(t);
				setTimeout(function() {
					//在未打开蓝牙情况下通过代码代开
					//有些时候无法获取数据
					//所以进行延时操作
					callBack && callBack.call(self);
				}, 2000);
			}
			if(tmpI++ > 10) {
				clearInterval(t);
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
BLUE_ANDROID.prototype.createService = function(deviceAddress, endCallBack) {
	this.enable(function() {
		console.log('deviceAddress==>' + deviceAddress);
		var BleDevice = this.BAdapter.getRemoteDevice(deviceAddress); //通过地址获取蓝牙设备
		plus.android.importClass(BleDevice);
		if(BleDevice) {
			console.log('BleDevice 存在===>' + BleDevice.getName());
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
					console.log('onConnectionStateChange 已执行');
				}
			});

			//获取到连接控制器
			var BGatt = this.BGatt = BleDevice.connectGatt(this.main, false, callBack);
			plus.android.importClass(BGatt);

			var self = this;
			if(BGatt) {
				console.log('BGatt已获取')
				//因为没法进入回调函数 所以就直接认定是3秒后已连接 能解决大部分情况 
				setTimeout(function() {
					//获取服务,因为没有办法进入回调函数 所以使用定时器来获取
					BGatt.discoverServices();
					var t = setInterval(function() {
						var bGattServices = BGatt.getServices(); //蓝牙会提供多个服务
						if(bGattServices.size() > 0) {
							clearInterval(t);
							console.log('列表已获取===' + bGattServices.size());
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
											console.log('读对象已获取');
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
													console.log('监听已注册');
													var bytes = plus.android.invoke(descriptor.ENABLE_NOTIFICATION_VALUE, 'getBytes', 'US-ASCII');
													descriptor.setValue(bytes);
													BGatt.writeDescriptor(descriptor);
													BGatt.setCharacteristicNotification(rGattCharacteristic, true);
												}
											}
										}
										if(uuid === write) {
											console.log('写对象已获取');
											wGattCharacteristic = self.wGattCharacteristic = bGattCharacteristic;
										}
									}
									break;
								}
							}
							endCallBack && endCallBack();
						}
					}, 1000);
				}, 1000);
			} else {
				throw '无法连接到蓝牙控制器';
			}
		} else {
			throw '无法通过此蓝牙地址获取到设备';
		}
	});
}

/* *
 * 发送消息
 */
BLUE_ANDROID.prototype.sendInfo = function(txt, callBack) {
	//	txt = '000000,AT+ADP?\r\n';
	//	var bytes = plus.android.invoke(txt, 'getBytes', 'US-ASCII');
	//	
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