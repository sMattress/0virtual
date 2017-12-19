init_blue_ios = function() {
	
	// IOS 蓝牙插件
	var _BARCODE = 'BlueCenter',
		B = window.plus.bridge;
	blueCtrl = {};

	//发送消息
	blueCtrl.sendInfo = function(txt, callBack) {
		if(DEBUG) console.log('==========执行 blueCtrl.sendInfo');
		var callbackID = B.callbackId(callBack);
		return B.exec(_BARCODE, 'sendInfo', [callbackID, txt]);
	}
	//扫描设备
	blueCtrl.searchDevice = function(txt, callBack) {
		if(DEBUG) console.log('==========执行 blueCtrl.searchDevice');
		var tCallBack = function(rs) {
			if(rs == 1) {
				var tL = 0;
				window.tScan = setInterval(function() {
					if(++tL > 10) {
						blueCtrl.stopSearch();
						callBack && callBack();
					} else {
						blueCtrl.getBlueList(function(rs) {
							blueCtrl.result = JSON.parse(rs);
						});
					}
				}, 1000);
			} else {
				mui.alert('扫描设备发生错误,请重新操作', '提示');
			}
		}
		var callbackID = B.callbackId(tCallBack);
		return B.exec(_BARCODE, 'searchDevice', [callbackID, txt]);
	}
	//连接蓝牙设备
	blueCtrl.createService = function(address, callBack) {
		if(DEBUG) console.log('==========执行 blueCtrl.createService');

		for(var i = 0 ; i < blueCtrl.result.length; i++){
			if(blueCtrl.result[i].address == address){
				break;
			}
		}
		
		var tCallBack = function() {
			var tCont = setInterval(function() {
				blueCtrl.getContState(function(rs) {
					if(rs == '8') {
						clearInterval(tCont);
						blueCtrl.getBlueInfo(function(rs) {
							blueCtrl.readTxt = rs;
						});
						//定时读取蓝牙发送的消息
						window.tRead = setInterval(function() {
							blueCtrl.getBlueInfo(function(rs) {
								blueCtrl.readTxt = rs;
							});
						}, 4000);

						callBack && callBack(1);
					} else if(rs < 0) {
						if(rs == '-98' || rs == '-97' || rs == '-96') {
							callBack && callBack(0);
							mui.alert('连接蓝牙失败,请重试', '提示');
						} else if(rs == '-99') {
							callBack && callBack(0);
							mui.alert('检测到蓝牙连接断开，点击确定将刷新页面', '提示', function() {
								location.href = location.href;
							});
						}
					}
				});
			}, 1000);
		}
		var callbackID = B.callbackId(tCallBack);
		return B.exec(_BARCODE, 'createService', [callbackID, i]);
	}
	//读取内容
	blueCtrl.readInfo = function() {
		var txt = blueCtrl.readTxt;
		blueCtrl.readTxt = '';
		return txt || '';
	}
	//断开蓝牙连接
	blueCtrl.disconnect = function() {
		if(window.tRead) {
			clearInterval(tRead);
			tRead = null;
		}
		var callbackID = B.callbackId(function() {});
		return B.exec(_BARCODE, 'disconnect', [callbackID]);
	}
	//停止扫描
	blueCtrl.stopSearch = function() {
		if(tScan) {
			clearInterval(tScan);
			window.tScan = null;
		}
		var callbackID = B.callbackId(function() {});
		return B.exec(_BARCODE, 'stopSearch', [callbackID]);
	}

	//初始化
	blueCtrl.init = function(callBack) {
		if(DEBUG) console.log('=执行 blueCtrl.init');
		var tCallBack = function(rs) {
			if(DEBUG) console.log('=回调 blueCtrl.init rs='+rs);
			if(rs == '1') {
				var tBlueState = setInterval(function() {
					blueCtrl.getBlueState(function(rs) {
						console.log('=getBlueState rs==='+rs);
						if(rs == '2') {
							clearInterval(tBlueState);
							mui.alert('您的手机不支持蓝牙控制,换一个手机试试吧！', '提示');
						} else if(rs == '5') {
							clearInterval(tBlueState);
							callBack && callBack();
						}
					});
				}, 1000);
			} else {
				mui.alert('初始化环境发生错误,请联系开发人员', '提示');
			}
		}
		var callbackID = B.callbackId(tCallBack);
		return B.exec(_BARCODE, 'init', [callbackID]);
	}

	var fucArr = [];
	fucArr.push('getBlueState');
	fucArr.push('getBlueList');
	fucArr.push('getBlueInfo');
	fucArr.push('getContState');
	var createFuc = function(key) {
		return function(callBack) {
			callBack = callBack || function() {};
			if(DEBUG) console.log('==========执行 blueCtrl.' + key);
			var callbackID = B.callbackId(callBack);
			return B.exec(_BARCODE, key, [callbackID]);
		};
	}
	for(var i = 0; i < fucArr.length; i++) {
		var key = fucArr[i];
		blueCtrl[key] = createFuc(key);
	}
}