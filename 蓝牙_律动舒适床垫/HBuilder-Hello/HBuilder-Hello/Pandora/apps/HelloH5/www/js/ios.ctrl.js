//存储四个选择器对象
var popArr = [null, null, null, null];
var blueIOS = null; //IOS 蓝牙对象
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

//IOS打印信息改为在dom中显示
console = {};
console.log = function(rs) {
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
				this.parentNode.next().setAttribute('class', 'bc-qidong list-show');
			} else {
				setStr[index] = '0';
				this.parentNode.next().setAttribute('class', 'bc-qidong list-hide');
			}
			if(DEBUG) console.log('=setStr====' + setStr);
		});
	});
	mui('#blue_ctrl').on('tap', '#do_it', function() {
		var t = setStr.join('');
		if(DEBUG) console.log('=sendInfo t====' + t);
		blueIOS.writeValue(t, function(rs) {
			if(DEBUG) console.log('=sendInfo rs====' + rs);
			document.getElementById('do_it').innerHTML = '正在运行';
		});
	});
	mui('#d_IOS_bug').on('tap', 'button', function() {
		document.getElementById('d_console').innerHTML = '';
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
var _goBack = function() {
	if(DEBUG) console.log('==========正在执行 _goBack step====' + step);
	plus.navigator.setStatusBarBackground("#3d51b4");
	if(step === 1) {
		plus.navigator.setStatusBarBackground("#3d51b4");
		bs_box.setAttribute('class', 'bs_before');
		if(window.tScan){
			clearInterval(window.tScan);
			window.tScan = null;
			blueIOS.stopScan(function(){});
			_createList();
		}
	} else if(step === 2) {
		blueIOS.disContBlue(function(){});
		//		blueAndroid.disable();
	} else {

	}
	blue_search.style.display = 'block';
	blue_ctrl.style.display = 'none';
	go_back.style.display = 'none';
	
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
					_createList();
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
var _createList = function(){
	var list = blueIOS.result || [];
	if(list.length === 0) {
		bs_devices.innerHTML = '暂无设备，点击<a>扫描</a>开始获取设备';
	} else {
		var html = '';
		for(var i = 0; i < list.length; i++) {
			var blueObj = list[i];
			var address = blueObj.address;
			html += '<li i="'+i+'" address="' + address + '"><div class="bds-name">设备：' + blueObj.name +
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
		var tIA = 0;
		setStr = ["L", "1", "|", "1", "0", "8", "0", "6", "0", "|", "1", "3", "5", "0", "6", "0"];
		_reset_blue_ctrl();
		var tFirst = setInterval(function() {
			if(DEBUG) console.log('=tIA====' + tIA);
			blueIOS.readValue(function(info) {
				if(tIA++ > 5) {
					clearInterval(tFirst);
					if(step === 2) {
						_hideLoading();
						go_back.style.display = 'block';
						blue_search.style.display = 'none';
						blue_ctrl.style.display = 'block';
					}
				} else if(info) {
					clearInterval(tFirst);
					if(step === 2) {
						_hideLoading();
						if(DEBUG) console.log('=readValue info====' + info);
						document.getElementById('bc_temp_now').innerHTML = (info.split('|')[3] || 0) + '℃';
						go_back.style.display = 'block';
						blue_search.style.display = 'none';
						blue_ctrl.style.display = 'block';
					}
				}
			});
		}, 1000);
	}
	var _listenRead = function() {
		window.nowTemp = setInterval(function() {
			blueIOS.readValue(function(info) {
				if(DEBUG) console.log('=readValue tInfo====' + tInfo);
				if(tInfo) {
					var tttt = tInfo.split('|')[3];
					if(tttt) {
						document.getElementById('bc_temp_now').innerHTML = tttt + '℃';
					}
				}
			});
		}, 30 * 1000);
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
	var fucArr = ['init', 'getBlueState', 'getBlueList', 'startScan', 'stopScan', 'getContState', 'readValue','disContBlue'];
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