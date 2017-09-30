window.BLUE_BEFORE_ANDROID = (function() {
	var blue = null;
	var blueName = null; //通过 CONSTANT.blueName设置
	var bluePwd = null; //

	/**
	 * 通过缓存的mac蓝牙地址进行连接
	 * @param {Object} address 蓝牙mac地址
	 */
	var _bondByAddress = function(address) {
		COM.createLoading('正在尝试连接蓝牙...');
		var device = blue.getDevice(address);
		//		device.setPin(bytes);  
		//		device.createBond();
		//		var i = 0;
		//		console.log(device.getBondState());
		//		var t = setInterval(function() {
		//			if(device.getBondState() === device.BOND_BONDED) {
		//				console.log('已配对');
		//			} else {
		//				console.log('未配对');
		//			}
		//			console.log(device.getBondState())
		//			console.log(device.BOND_BONDED)
		//			if(i++ > 10) {
		//				clearInterval(t);
		//			}
		//		}, 1000);

				blue.createBondByAddress(address);

//		blue.sendInfo(device, '111');
	}

	/**
	 * 连接蓝牙
	 */
	var _searchAndBond = function() {
		COM.createLoading('正在搜索蓝牙...');
		blue.searchDevice(blueName, function(list) {
			var len = list.length;
			if(len === 0) {
				COM.closeLoading();
				mui.alert('未搜索到蓝牙设备，请确认床垫电源是否打开或者是否有其他人员连接蓝牙', '提示');
			} else if(len === 1) {
				COM.createLoading('已搜索到<br>正在配对蓝牙...');
				var BleDevice = list[0];
				_bondByAddress(BleDevice.getAddress())
				//				if(BleDevice.createBond()) {
				//					COM.createLoading('已配对<br>正在连接蓝牙...');
				//					BleDevice.setPin(plus.android.invoke('000000', 'getBytes', 'utf-8'));
				//					_sendInfo(BleDevice);
				//				} else {
				//					COM.closeLoading();
				//					mui.alert('蓝牙配对失败，请稍后再尝试', '提示');
				//				}
			} else {
				COM.closeLoading();
				mui.alert('搜索到' + len + '个蓝牙设备,请关闭其他蓝牙设备,只保留需要连接的蓝牙设备。', '提示');
			}
		});
	}

	/**
	 * 发送消息
	 * @param {Object} address 发往的mac地址
	 */
	var _sendInfo = function(BleDevice) {
		var text = 'L0x40EOT';
		blue.sendInfo(BleDevice, text);

		//					try{
		//						blue.sendInfo(address, text);
		//					}catch(e){
		//						mui.alert('发送数据失败,请查看蓝牙连接是否正常','提示');
		//					}
		COM.closeLoading();
	}

	/**
	 * 初始化
	 */
	var _init = function() {
		blueName = CONSTANT.blueName;
		bluePwd = CONSTANT.bluePwd;
		mui('#blue_before').on('tap', 'a', function() {
			var fuc = this.getAttribute('title');
			console.log('fuc===>' + fuc);
			BLUE_BEFORE_ANDROID[fuc] && BLUE_BEFORE_ANDROID[fuc]();
		});
	}

	/**
	 * 开始函数
	 */
	var _start = function() {
		COM.addHN(false, '蓝牙连接');
		COM.back();
		mui('#blue_name')[0].innerHTML = blueName = CONSTANT.blueName;
		blue = new BLUE_ANDROID();
		_init();
		var address = COM.getStorage(STORAGE.blueAddress);
		_bondByAddress(address);
		//		_searchAndBond();
		try {
			//			blue = new BLUE_ANDROID();
			//			_init();
			//			var address = COM.getStorage(STORAGE.blueAddress);
			//			_searchAndBond();
			//			_bondByAddress(address);
			//			_searchAndBond();
			//			if(address) {
			//				_bondByAddress(address);
			//			} else {
			//				_searchAndBond();
			//			}
		} catch(e) {
			console.error(e);
			mui('#blue_before')[0].innerHTML = '对不起，您的手机不支持蓝牙控制，请更换手机。';
		}
	}

	return {
		start: _start,
		search: _searchAndBond
	}
})();