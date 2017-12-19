var blueAndroid = null; //安卓蓝牙对象
var blue_search = null;
var blue_ctrl = null;
var go_back = null;
var helpElem = null;
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

//IOS打印信息改为在dom中显示
console = {};
console.log = function(rs) {
	return;
	document.getElementById('d_console').innerHTML += rs + '</br>';
}
/**
 * 开始函数
 */
var start = function() {
	plus.navigator.setStatusBarStyle('light');

	init_blue_ios();
	blueIOS = BLUE_IOS;
	blueIOS.init(function(rs) {
		if(rs == '1') {
			var tBlueState = setInterval(function() {
				blueIOS.getBlueState(function(rs) {
					if(rs == '2') {
						clearInterval(tBlueState);
						mui.alert('您的手机不支持蓝牙控制,换一个手机试试吧！', '提示');
					} else if(rs == '5') {
						clearInterval(tBlueState);
						_init();
						_bind();
					}
				});
			}, 1000);
		} else {
			mui.alert('初始化环境发生错误,请联系开发人员', '提示');
		}
	});
}
/**
 * 初始化数据
 */
var _init = function() {
	//初始化 _popArr
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
	helpElem = mui('#header button')[0];
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

	mui('#d_IOS_bug').on('tap', 'button', function() {
		document.getElementById('d_console').innerHTML = '';
	});
	mui.back = _goBack;
}

var writeFlag = false;
/**
 * 公用发送消息到蓝牙
 * @param {Object} txt 发送的字符串
 * @param {Function} success 发送成功回调
 */
var _comSendInfo = function(txt, success) {
	if(writeFlag) {
		mui.toast('您点得太快啦，请慢一点！');
		return;
	}
	writeFlag = true;
	blueIOS.writeValue(txt, function(rs) {
		blueIOS.readValue(function(data) {
			if(DEBUG) console.log('=data====' + data);
			if(data.length != 0) {
				writeFlag = false;
				clearInterval(tRead);
				success && success(data);
			} else {
				var tR = 0;
				var tRead = setInterval(function() {
					if(tR++ > 10) {
						writeFlag = false;
						mui.alert('您刚才操作响应超时了', '提示');
						clearInterval(tRead);
					} else {
						blueIOS.readValue(function(data) {
							if(DEBUG) console.log('=data====' + data);
							if(data.length != 0) {
								writeFlag = false;
								clearInterval(tRead);
								success && success(data);
							}
						});
					}
				}, 200);
			}
		});

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
		var sendTxt = 'L20|' + power;
		if(DEBUG) console.log('=sendTxt====' + sendTxt);
		_comSendInfo(sendTxt, function() {
			valueArr[0] = power;
			clickElem.setAttribute('class', 'lcb-cc' + power);
			_showValueArr();
		});
	} else if(title === '0' && valueArr[1] == 1) { //左侧温度加减
		if(DEBUG) console.log('=====左侧温度加减按钮');
		_temperatureChange.call(this, '1', 3);
	} else if(title === '1' && valueArr[2] == 1) { //右侧温度加减
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
		var sendTxt = 'L16|' + side + '|1|' + v;
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
	var sendTxt = 'L16|' + side + '|' + mode + '|' + valueArr[index + 2];
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
var _goBack = function() {
	if(DEBUG) console.log('==========正在执行 _goBack step====' + step);
	plus.navigator.setStatusBarBackground("#3d51b4");
	if(step === 1) {
		if(window.tScan) {
			clearInterval(window.tScan);
			window.tScan = null;
			blueIOS.stopScan(function() {});
		}
		_createList();

		plus.navigator.setStatusBarBackground("#3d51b4");
		bs_box.setAttribute('class', 'bs_before');
	} else if(step === 2) {
		blueIOS.disContBlue(function() {});
		//		blueAndroid.disable();
	} else {

	}
	blue_search.style.display = 'block';
	blue_ctrl.style.display = 'none';
	go_back.style.display = 'none';
	helpElem.style.display = 'inline-block';

	if(window.nowTemp) {
		clearInterval(window.nowTemp);
		window.nowTemp = null;
	}
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
	helpElem.style.display = 'none';
	//动画效果由CSS3 实现
	bs_box.setAttribute('class', 'bs_before bsb-active');
	var list = null;
	var tL = 0;
	plus.navigator.setStatusBarBackground("#516CFB");
	blueIOS.startScan(function(rs) {
		if(rs == 1) {
			window.tScan = setInterval(function() {
				if(++tL > 10) {
					clearInterval(tScan);
					window.tScan = null;
					blueIOS.stopScan(function() {});
					_goBack();
				} else {
					blueIOS.getBlueList(function(rs) {
						blueIOS.result = list = JSON.parse(rs);
						bbs_info.innerHTML = '正在搜索<br/> 已搜索到' + list.length + '个设备';
					});
				}
			}, 1000);
		} else {
			mui.alert('扫描设备发生错误,请重新操作', '提示');
		}
	});
}

/**
 * 创建设备列表
 */
var _createList = function() {
	var list = blueIOS.result || [];
	if(list.length === 0) {
		bs_devices.innerHTML = '暂无设备，点击<a>扫描</a>开始获取设备';
	} else {
		var html = '';
		for(var i = 0; i < list.length; i++) {
			var blueObj = list[i];
			var address = blueObj.address;
			html += '<li i="' + i + '" address="' + address + '"><div class="bds-name">设备：' + blueObj.name +
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
	var index = this.parentNode.getAttribute('i');
	step = 2;
	blueIOS.contBlue(index, function() {
		var tCont = setInterval(function() {
			if(step === 2) {
				blueIOS.getContState(function(rs) {
					if(rs == '8') {
						clearInterval(tCont);
						_contSuccess();
					} else if(rs < 0) {
						if(rs == '-98' || rs == '-97' || rs == '-96') {
							mui.alert('连接蓝牙失败,请重试', '提示');
						} else if(rs == '-99') {
							mui.alert('检测到蓝牙连接断开，点击确定将刷新页面', '提示', function() {
								location.href = location.href;
							});
						}
						_hideLoading();
					}
				});
			} else {
				_hideLoading();
				clearInterval(tCont);
			}
		}, 1000);
	});
	//蓝牙连接成功回调函数
	var _contSuccess = function() {
		if(DEBUG) console.log('=sendTxt====L32|2');
		_comSendInfo('L32|2', function(rs) {
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
				plus.navigator.setStatusBarBackground("#202026");
				go_back.style.display = 'block';
				helpElem.style.display = 'none';
				blue_search.style.display = 'none';
				blue_ctrl.style.display = 'block';
			}
		});
	}
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

BLUE_IOS = {};

init_blue_ios = function() {
	// 声明的JS“扩展插件别名”
	var _BARCODE = 'BlueCenter',
		B = window.plus.bridge;
	var createFuc = function(key) {
		return function(callBack) {
			if(DEBUG) console.log('==========执行 BLUE_IOS.' + key);
			var callbackID = B.callbackId(callBack);
			return B.exec(_BARCODE, key, [callbackID]);
		};
	}
	var fucArr = ['init', 'getBlueState', 'getBlueList', 'startScan', 'stopScan', 'getContState', 'readValue', 'disContBlue'];
	for(var i = 0; i < fucArr.length; i++) {
		var key = fucArr[i];
		BLUE_IOS[key] = createFuc(key);
	}
	//连接蓝牙
	BLUE_IOS.contBlue = function(index, callBack) {
		if(DEBUG) console.log('==========执行 BLUE_IOS.contBlue');
		var callbackID = B.callbackId(callBack);
		return B.exec(_BARCODE, 'contBlue', [callbackID, index]);
	}
	//连接发送消息
	BLUE_IOS.writeValue = function(msg, callBack) {
		if(DEBUG) console.log('==========执行 BLUE_IOS.writeValue');
		var callbackID = B.callbackId(callBack);
		return B.exec(_BARCODE, 'writeValue', [callbackID, msg]);
	}
}