window.ANDROID_CTRL = (function() {
	var blue = null;
	var blueName = null; //通过 CONSTANT.blueName设置
	var address = null; //蓝牙地址
	var downSelf = null;
	var isConnect = false;//是否已连接
	var setp = 0;//步骤 0开始  1已经获取到blue 2已经搜索到设备 3 已经连接到蓝牙
	var defaultText = '您操作太快了,请慢一点^_^';
	/*************处理第一页(页面) start*************/
	/***
	 * 处理第一页  需要的元素
	 */
	var showElem = mui("#remoteCtrl .info"); //存储上方显示信息元素
	var elemInfo = {}; //存储下方操作的每个元素的信息
	var btnArr = mui("#remoteCtrl .switch"); //取得按钮
	var tTArr = [35, 35]; //左右两边的温度 0为右 1为左
	//左右加热 理疗点击处理
	var param = {
		"side": 0,
		"mode": 1,
		"targetTemperature": 37,
		"currentTemperature": 0
	};
	//温度加减按钮 通过p检测是否处理 通过t进行加减
	var tUD = {
		"4": {
			t: 1,
			p: 0
		},
		"5": {
			t: 1,
			p: 1
		},
		"7": {
			t: -1,
			p: 0
		},
		"8": {
			t: -1,
			p: 1
		}
	};

	/**
	 * 获取到第一页的数据
	 */
	var _getFirst = function() {
		var txt = 'L32|2\r\n'; //查询状态
		var _sendCallBack = function(data) {
			console.log('查询状态获取的消息...');
			if(data.startsWith('L1')) {
				var arr = data.split('|');
				var obj0 = {
					side: 0, //右边
					currentTemperature: 0
				}
				var str0 = arr[2];
				obj0.mode = _stringToInt(str0.substring(0, 1), 0);
				obj0.targetTemperature = _stringToInt(str0.substring(1, 3), 35);
				var obj1 = {
					side: 1, //左边
					currentTemperature: 0
				}
				var str1 = arr[3];
				obj1.mode = _stringToInt(str1.substring(0, 1), 0);
				obj1.targetTemperature = _stringToInt(str1.substring(1, 3), 35);

				var power = _stringToInt(arr[1], 0);
				var dataParams = {
					params: [obj0, obj1, {
						powerOn: power
					}]
				}
				_showFirst(dataParams);
			} else {
				mui.alert('获取初始数据失败，请检查蓝牙是否已断开', '提示');
			}
			downSelf && downSelf.endPullDownToRefresh();
			downSelf = null;
		}
		//		var data = 'L1|1|1300|1300';
		//		_sendCallBack(data);
		_sendInfo(txt, _sendCallBack);
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
	 * 初始化第一页
	 */
	var _initFirst = function() {
		console.log('_initFirst 已运行');
		mui.each(btnArr, function() {
			var tmp = {};
			tmp.flag = false; //标识此元素是否已点击
			tmp.className = this.getAttribute("class"); //记录此元素的class _reset的时候调用
			tmp.elem = this;
			elemInfo[this.getAttribute("index")] = tmp;
		});
		//绑定点击事件
		mui("#remoteCtrl").on("tap", ".switch", function() {
			if(!isConnect){
				mui.alert('蓝牙未连接上,点击右上角刷新试试','提示');
				return;
			}
			var index = this.getAttribute("index");
			index = parseInt(index);
			if(index === 6) { //开关
				_switch6(index, this);
			} else if(index < 4) { //左右加热、理疗
				if(elemInfo[6].flag) { //开关已开启 才可以点击
					_switch0123(index, this);
				} else {
					mui.toast("请按中间的开关开启设备");
				}
			} else { //左右温度加减
				_switch4578(index, this);
			}
		});
	}
	/**
	 * 显示第一页数据
	 * @param {Object} data 获取到的数据
	 */
	var _showFirst = function(data) {
		_resetFirst();
		var _do = function(side, mode, tT) {
			side = parseInt(side);
			console.log("side=>" + side + ";mode=>" + mode + ";tT=>" + tT);
			if(mode == 1 || mode == 3) { //更改加热按钮及子按钮 
				var child = [5 - side, 8 - side];
				_doFirstBtnOne(1 - side, child, mode);
			}
			if(mode == 2 || mode == 4) {
				_doFirstBtnOne(3 - side, null, mode);
			}
			//更改显示
			showElem[3 - side].innerHTML = modeArr[mode];
			showElem[1 - side].innerHTML = tT + "°C";
			tTArr[side] = parseInt(tT);
		}
		var modeArr = ["待机", "加热", "理疗", '预约加热', '预约理疗'];
		var p1 = data.params[0] || {};
		_do(p1.side || 0, p1.mode || 0, p1.targetTemperature || "待设置");
		var p2 = data.params[1] || {};
		_do(p2.side || 0, p2.mode || 0, p2.targetTemperature || "待设置");
		//处理开关显示
		if(data.params[2] && data.params[2].powerOn) {
			_doFirstBtnOne(6); //显示开关开启
		} else {
			//_reset();
		}
	}
	//第一页 处理类名 
	var _doClassName = function(className, flag) {
		var _classArr = className.split(" ");
		if(flag) {
			return className + " " + _classArr[0] + "_h";
		} else {
			return _classArr[0] + " " + _classArr[1];
		}
	}
	//第一页 处理某一个的点击事件
	var _doFirstBtnOne = function(index, child, mode) {
		//console.log("_doFirstBtnOne => " +index);
		modeFlag = mode;
		var tmp = elemInfo[index];
		tmp.flag = !tmp.flag;
		//console.log(_doClassName(tmp.className));
		tmp.elem.setAttribute("class", _doClassName(tmp.className, tmp.flag));
		if(mode === 3) {

		} else {
			if(child) {
				for(var i in child) {
					_doFirstBtnOne(child[i]);
				}
			}
		}
	}
	//第一页 重置
	var _resetFirst = function() {
		mui.each(btnArr, function() {
			var tmp = elemInfo[this.getAttribute("index")];
			this.setAttribute("class", tmp.className);
			tmp.flag = false;
		});
	}
	/**
	 * 第一页 class="switch"中index为6的点击事件
	 * @param {Object} index 
	 * @param {Object} elem 当前元素
	 */
	var _switch6 = function(index, elem) {
		var tmp = elemInfo[index];
		var powerOn = 0;
		if(tmp.flag) {
			powerOn = 0;
			var text = "关闭";
			var _other = _resetFirst;
		} else {
			powerOn = 1;
			var text = "开启";
			var _other = null;
		}

		var txt = 'L20|' + powerOn + '\r\n'; //开关设置
		var _sendCallBack = function(data) {
			if(data.startsWith('L1')) {
				mui.toast('开关已' + text);
				_doFirstBtnOne(index);
				_other && _other();
			} else {
				mui.toast(defaultText)
			}
		}
		_sendInfo(txt, _sendCallBack);
	}
	/**
	 * 第一页 class="switch"中index为0123的点击事件
	 * @param {Object} index
	 * @param {Object} elem 当前元素
	 */
	var _switch0123 = function(index, elem) {
//		console.log('_switch0123===》' + JSON.stringify(elemInfo));
		if(index < 2) { //加热 index0为左 1为右  side=0代表右 =1代表左
			var tmp = elemInfo[index];
			param.side = 1 - index;
			param.mode = tmp.flag ? 0 : 1;
			param.targetTemperature = tTArr[1 - index];
			var txt = 'L16|' + param.side + '|' + param.mode + '|' + param.targetTemperature + '\r\n';

			var _sendCallBack = function(data) {
				if(data.startsWith('L1')) {
					_doFirstBtnOne(index, [4 + index, 7 + index]);
					if(elemInfo[2 + index].flag) {
						_doFirstBtnOne(2 + index); //更改理疗点击状态
					}
					showElem[index].innerHTML = tTArr[1 - index] + "°C";
					showElem[2 + index].innerHTML = (param.mode === 1 ? "加热" : '待机');
				} else {
					mui.toast(defaultText);
				}
			}
			//			var data = 'L1';
			//			_sendCallBack(data);
			_sendInfo(txt, _sendCallBack);
		} else {
			var i = index % 2; //理疗 i=0为左 =1为右  side=0代表右 =1代表左
			var tmp = elemInfo[index];
			param.side = 1 - i;
			param.mode = tmp.flag ? 0 : 2;
			param.targetTemperature = tTArr[1 - i];

			var txt = 'L16|' + param.side + '|' + param.mode + '|' + param.targetTemperature + '\r\n';
			var _sendCallBack = function(data) {
				if(data.startsWith('L1')) {
					_doFirstBtnOne(index);
					if(elemInfo[i].flag) {
						_doFirstBtnOne(i, [4 + i, 7 + i]);
					}
					showElem[2 + i].innerHTML = (param.mode === 2 ? "理疗" : '待机');
				} else {
					mui.toast(defaultText);
				}
			}
			//			var data = 'L1';
			//			_sendCallBack(data);
			_sendInfo(txt, _sendCallBack);
		}
	}
	var _switch4578 = function(index, elem) {
		if(DEBUG) console.log("index===>" + index);
		if(modeFlag === 3) {
			mui.toast('加热预约无法进行温度改变');
			return;
		}
		var tmp = tUD[index];
		if(elemInfo[tmp.p].flag) { //可点击
			if(DEBUG) console.log("tmp.p===>" + tmp.p);
			param.side = 1 - tmp.p;
			param.mode = 1;
			if(tTArr[1 - tmp.p] + tmp.t < 25) {
				mui.toast("已经是最低温度了");
				return;
			}
			if(tTArr[1 - tmp.p] + tmp.t > 45) {
				mui.toast("已经是最高温度了");
				return;
			}
			param.targetTemperature = (tTArr[1 - tmp.p] += tmp.t);

			var txt = 'L16|' + param.side + '|' + param.mode + '|' + param.targetTemperature + '\r\n';
			var _sendCallBack = function(data) {
				if(data.startsWith('L1')) {
					showElem[tmp.p].innerHTML = tTArr[1 - tmp.p] + "°C";
				} else {
					mui.toast(defaultText);
				}
			}
			//			var data = 'L1';
			//			_sendCallBack(data);
			_sendInfo(txt, _sendCallBack);
		}
	}
	//发送消息公用函数
	var _sendInfo = function(txt, callBack) {
		blue.sendInfo(txt, function(data) {
			if(data === -1) {
				mui.toast('正在发送之前的数据,请稍后再尝试操作');
			} else if(data === -2) {
				mui.alert('返回信息超时,请检查蓝牙是否已断开。如果未断开，请关闭蓝牙并重启程序试试', '提示');
			} else {
				callBack && callBack(data);
			}
		});
	}
	/*************处理第一页 end*************/

	/**
	 * 搜索蓝牙设备
	 */
	var _search = function() {
		COM.createLoading('正在搜索蓝牙设备...');
		try {
			blue.searchDevice(blueName, function(list) {
				var len = list.length;
				if(len === 0) {
					COM.closeLoading();
					mui.alert('未搜索到蓝牙设备,请确认是否有其他人员连接蓝牙或者床垫电源是否打开。如果已确定其他是没有问题但是不能搜索到,则是您的手机不支持此蓝牙4.1协议(android5.0以上都支持)', '提示');
				} else if(len === 1) {
					setp = 2;
					var BleDevice = list[0];
					address = BleDevice.getAddress();
					COM.setStorage(STORAGE.blueAddress, address);
					_connect();
				} else {
					COM.closeLoading();
					mui.alert('搜索到' + len + '个蓝牙设备,请关闭其他蓝牙设备,只保留需要连接的蓝牙设备', '提示');
				}
			});
		} catch(e) {
			mui.alert(e, '提示');
		}

	}

	/**
	 * 连接蓝牙设备
	 */
	var _connect = function() {
		COM.createLoading('正在连接蓝牙...');
		try {
			blue.createService(address, function() {
				isConnect = true;
				setp = 3;
				console.log('已经完成连接');
				COM.closeLoading();
				_getFirst();
			});
		} catch(e) {
			COM.closeLoading();
			mui.alert(e, '提示');
		}
	}

	/**
	 * 初始化
	 */
	var _init = function() {
		blueName = CONSTANT.blueName;
		COM.back();
		COMMON.menuClick = function(){//此处是刷新的点击响应事件
			if(setp === 0){
				blue = new BLUE_ANDROID();
				_search();
			}else{
				_search();
			}
		}
		COM.addHN(false,'蓝牙控制',{id:'-1',text:'刷新'})
		_initFirst();
		//		_getFirst();
		mui('#remoteCtrl').pullToRefresh({
			down: {
				callback: function() {
					downSelf = this;
					_getFirst();
				}
			}
		});
	}

	/**
	 * 开始
	 */
	var _start = function() {
		_init();
		try {
			blue = new BLUE_ANDROID();
			
			address = COM.getStorage(STORAGE.blueAddress);
			console.log('address===' + address);
			_search();
			setp = 1;
			//			if(address) {
			//				_connect();
			//			} else {
			//				_search();
			//			}
		} catch(e) {
			COM.closeLoading();
			mui.alert(e, '提示');
		}
	}

	return {
		start: _start
	}
})();