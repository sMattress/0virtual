/**
 * 理疗 设备控制页面
 */
window.L_DEVICE = (function() {
	var deviceObj = null; //当前设备对象
	var deviceCode = null; //设备名称
	var alias = null; //设备昵称
	var account = null; //用户账户
	var socket = null; //连接对象
	var bindFlag = false;
	var indexNum = 0;
	var downSelf = null;
	var modeFlag = 0; //记录理疗预约 这个时候不能进行增减温度
	var errorText = '床还没有连上服务器,请耐心等待';

	var d = document;
	var gId = "getElementById";
	var gClass = "getElementsByClassName";
	var gTag = "getElementsByTagName";
	var gAttr = "getAttribute";
	var sAttr = "setAttribute";
	var nextE = "nextElementSibling";
	var prveE = "previousElementSibling";
	var refresh = false;

	var secondTime = ''; //第二页 预约时间
	var thirdTimeStart = ''; //第三页 开始时间
	var thirdTimeEnd = ''; //第三页 结束时间

	/*************三页公用方法 start*************/
	/**
	 * 开始函数
	 */
	var _start = function() {
		COM.createLoading();
		deviceObj = JSON.parse(COM.getStorage(STORAGE.device) || '{}');
		COM.addReload(function() {
			location.href = location.href;
//			var thisDevice = JSON.parse(COM.getStorage(STORAGE.device) || '{}');
//			COM.createLoading();
//			refresh = false;
//			_getFirst(_getSecond, _getThird);
//			mui('#' + CONSTANT.headerId + ' h1')[0].innerHTML = thisDevice.alias;
//
//			sliderElem.gotoItem(0);
		});
		COM.addHN(true, deviceObj.alias, CONST_MENU.home, true);
		COM.back(function(){
			COM.openWindow('home');
		});
		var sliderElem = mui('#slider').slider();
		mui('#slider').on("tap", ".mui-control-item", function() {
			var title = indexNum = this[gAttr]("title");
			sliderElem.gotoItem(title);
		});
		mui('#slider')[0].addEventListener('slide', function(e) {
			indexNum = e.detail.slideNumber;
			refresh = true;
			if(indexNum == 0) {
				_getFirst();
			} else if(indexNum == 1) {
				_getSecond();
			} else {
				_getThird();
			}
		});
		mui('#remoteCtrl').pullToRefresh({
			down: {
				callback: function() {
					downSelf = this;
					if(bindFlag) {
						_getFirst();
					} else {
						_openSocket(_getFirst);
					}
				}
			}
		});
		mui('#heatRvat').pullToRefresh({
			down: {
				callback: function() {
					downSelf = this;
					if(bindFlag) {
						_getSecond();
					} else {
						_openSocket(_getSecond);
					}
				}
			}
		});
		mui('#phyRvat').pullToRefresh({
			down: {
				callback: function() {
					downSelf = this;
					if(bindFlag) {
						_getThird();
					} else {
						_openSocket(_getThird);
					}
				}
			}
		});

		deviceCode = deviceObj.device_name; //设备编号
		alias = deviceObj.alias; //昵称
		account = COM.getStorage(STORAGE.account); //用户账户
		//		mui("#now_device")[0].innerHTML = "当前设备：" + alias;
		_openSocket();
		//_initThird();
	}

	/**
	 * 打开连接
	 */
	var _openSocket = function(callBack) {
		console.log('URL.socket:' + URL.socket + ';account:' + account + ';VERSION:' + VERSION.liliao);
		//开启链接
		socket = new Mysocket(URL.socket, account, VERSION.liliao);
		socket.openSocket(function(data) {
			console.log("外部调用=》打开硬件成功" + JSON.stringify(data));
			if(!bindFlag) {
				bindFlag = true;
				_initFirst();
				_initSecond();
				_initThird();
			}
			if(callBack) {
				callBack(data);
			} else {
				_getFirst();
			}
		}, function(data) {
			COM.closeLoading();
			downSelf && downSelf.endPullDownToRefresh();
			downSelf = null;
			if(data === false) {
				mui.alert('抱歉,您的手机不支持远程控制', '确定', function() {
					COM.openWindow('liliao_device_list');
				});
			} else {
				mui.toast(errorText);
			}
		});
	}
	//时间字符串和秒的转换
	var _timestrAndSecond = function(a) {
		if(typeof a === "number") {
			var h = parseInt(a / 3600);
			var m = parseInt(a % 3600) / 60;
			return _checkTime(h) + ":" + _checkTime(m);
		} else {
			var b = a.split(":");
			return parseInt(b[0]) * 3600 + parseInt(b[1]) * 60;
		}
	}

	var _checkTime = function(hm) {
		hm = hm.toString();
		return hm.length === 1 ? "0" + hm : hm;
	}

	//发送消息公用函数
	var _sendInfo = function(cmd, params, success, error) {
		var _send = function() {
			var msg = socket.Msg(deviceCode, {
				"version": VERSION.liliao,
				"cmd": cmd,
				"params": params
			});
			socket.sendMsg(msg, function(data) {
				success && success(data);
				//成功后获取当前状态
			}, function(data) {
				COM.closeLoading();
				downSelf && downSelf.endPullDownToRefresh();
				downSelf = null;
				try {
					if(data.cause.indexOf('never registered')) {
						mui.toast(errorText);
					} else {
						mui.toast('刷新数据失败');
					}
				} catch(e) {
					mui.toast('刷新数据失败');
				}
				error && error(data);
			});
		}

		if(socket.getConnect()) {
			_send();
		} else {
			_openSocket(_send);
		}

	}
	/*************三页公用 end*************/

	/*************处理第一页 start*************/
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
	var _getFirst = function(second, third) {
		var i = 0;
		var tmpGet = function() {
			i++;
			_sendInfo(32, [{
				"side": 2
			}], function(data) {
				console.log("获取数据成功");
				if(downSelf) {
					downSelf.endPullDownToRefresh();
					mui.toast('刷新成功');
					downSelf = false;
				}
				if(refresh) {
					mui.toast('刷新成功');
				}
				_showFirst(data);
				COM.closeLoading();
				second && second();
				third && setTimeout(third, 500);
			}, function(data) {

			});
		}
		tmpGet();
	}

	/**
	 * 初始化第一页
	 */
	var _initFirst = function() {
		console.log('_initFirst 已运行');
		mui.each(btnArr, function() {
			var tmp = {};
			tmp.flag = false; //标识此元素是否已点击
			tmp.className = this[gAttr]("class"); //记录此元素的class _reset的时候调用
			tmp.elem = this;
			elemInfo[this[gAttr]("index")] = tmp;
		});
		//绑定点击事件
		mui("#remoteCtrl").on("tap", ".switch", function() {
			var index = this[gAttr]("index");
			index = parseInt(index);
			if(index === 6) { //开关
				_switch6(index, this);
			} else if(index < 4) { //左右加热、理疗
				if(elemInfo[6].flag) { //开关已开启 才可以点击
					_switch0123(index, this);
				} else {
					mui.toast("请按中间的开关开启设备。");
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
		tmp.elem[sAttr]("class", _doClassName(tmp.className, tmp.flag));
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
			var tmp = elemInfo[this[gAttr]("index")];
			this[sAttr]("class", tmp.className);
			tmp.flag = false;
		});
		//			showElem[0].innerHTML = "待机";
		//			showElem[1].innerHTML = "待机";
		//			showElem[2].innerHTML = "已关机";
		//			showElem[3].innerHTML = "已关机";
	}
	/**
	 * 第一页 class="switch"中index为6的点击事件
	 * @param {Object} index 
	 * @param {Object} elem 当前元素
	 */
	var _switch6 = function(index, elem) {
		var tmp = elemInfo[index];
		if(tmp.flag) {
			var params = [{
				"powerOn": 0
			}];
			var text = "关闭";
			var _other = _resetFirst;
		} else {
			var params = [{
				"powerOn": 1
			}];
			var text = "开启";
			var _other = null;
		}
		_sendInfo(20, params, function(data) {
			console.log("开关" + text + "成功");
			mui.toast("开关已" + text);
			_doFirstBtnOne(index);
			_other && _other();
		}, function(data) {

		});
	}
	/**
	 * 第一页 class="switch"中index为0123的点击事件
	 * @param {Object} index
	 * @param {Object} elem 当前元素
	 */
	var _switch0123 = function(index, elem) {
		console.log('_switch0123===》' + JSON.stringify(elemInfo));
		if(index < 2) { //加热 index0为左 1为右  side=0代表右 =1代表左
			var tmp = elemInfo[index];
			param.side = 1 - index;
			param.mode = tmp.flag ? 0 : 1;
			param.targetTemperature = tTArr[1 - index];
			console.log(JSON.stringify(param));
			_sendInfo(16, [param], function() {
				//mui.toast("加热已开启。");
				_doFirstBtnOne(index, [4 + index, 7 + index]);
				if(elemInfo[2 + index].flag) {
					_doFirstBtnOne(2 + index); //更改理疗点击状态
				}
				showElem[index].innerHTML = tTArr[1 - index] + "°C";
				showElem[2 + index].innerHTML = (param.mode === 1 ? "加热" : '待机');
			}, function() {

			});
		} else {
			var i = index % 2; //理疗 i=0为左 =1为右  side=0代表右 =1代表左
			var tmp = elemInfo[index];
			param.side = 1 - i;
			param.mode = tmp.flag ? 0 : 2;
			param.targetTemperature = tTArr[1 - i];
			_sendInfo(16, [param], function() {
				//mui.toast("理疗已开启。"); 
				_doFirstBtnOne(index);
				if(elemInfo[i].flag) {
					_doFirstBtnOne(i, [4 + i, 7 + i]);
				}
				showElem[2 + i].innerHTML = (param.mode === 2 ? "理疗" : '待机');
			}, function() {

			});
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
				mui.toast("已经是最低温度了。");
				return;
			}
			if(tTArr[1 - tmp.p] + tmp.t > 45) {
				mui.toast("已经是最高温度了。");
				return;
			}
			param.targetTemperature = (tTArr[1 - tmp.p] += tmp.t);
			_sendInfo(16, [param], function() {
				showElem[tmp.p].innerHTML = tTArr[1 - tmp.p] + "°C";
			}, function() {
				console.log('理疗开启失败');
			});
		}
	}
	/*************处理第一页 end*************/

	/*************处理第二页 start*************/
	//存储加热预约订单的值
	var secoldParams = [{
			modeSwitch: 1, //默认开启
			side: 1, //左边
			targetTemperature: 35, //默认温度
			protectTime: 2100, //默认保护时间
			startTime: 0,
			autoTemperatureControl: 0 //智能温度曲线 默认关闭
		},
		{
			modeSwitch: 1,
			side: 0,
			targetTemperature: 35,
			protectTime: 2100,
			startTime: 0,
			autoTemperatureControl: 0
		}
	];
	var secondEdit = false; //
	var secondObj = secoldParams[0]; //当前改变对象

	var _initSecond = function() {
		console.log('_initSecond 已运行');
		//开启和关闭
		mui("#hr_switch")[0].addEventListener("toggle", function(e) {
			if(e.detail.isActive) { //开启
				mui('#hr_switch')[0].setAttribute('class', 'mui-switch mui-active');
				mui('#hr_switch>div')[0].setAttribute('style', 'transition-duration: 0.2s; transform: translate(43px, 0px);');
				mui('#hr_mark')[0].style.display = 'none';
				mui('#hr_sure')[0].style.display = 'block';
			} else { //关闭
				if(secondObj.modeSwitch == 1) {
					var txt = '是否取消' + (secondObj.side === 1 ? '左侧' : '右侧') + '加热预约';
					mui.confirm(txt, "提示", CONSTANT.confirmBtn, function(rs) {
						if(rs.index == CONSTANT.confirmSure) {
							//							_cancelSecondObj(secondObj);
							secondObj.modeSwitch = 0;
							_sendInfo(17, [secondObj], function() {
								_resetSecond();
								mui.toast("加热预约已取消");
							}, function() {
								console.log('加热预约取消失败');
							});
						} else {
							mui('#hr_switch')[0].setAttribute('class', 'mui-switch mui-active');
							mui('#hr_switch>div')[0].setAttribute('style', 'transition-duration: 0.2s; transform: translate(43px, 0px);');
						}
					});
				} else {
					mui('#hr_switch')[0].setAttribute('class', 'mui-switch');
					mui('#hr_switch>div')[0].setAttribute('style', '');
					mui('#hr_mark')[0].style.display = 'block';
					mui('#hr_sure')[0].style.display = 'none';
				}
			}
		});

		mui('#heatRvat').on('tap', '.elem-click', function() {
			var type = this.getAttribute('title');
			if(type === 'sure') { //确定按钮
				secondObj.modeSwitch = 1;
				_sendInfo(17, [secondObj], function() {
					_resetSecond();
					mui.toast("加热预约已设置");
				}, function() {
					console.log('加热预约设置失败');
				});
			} else if(type === 'side') { //左右切换
				if(secondObj.side === 1) {
					secondObj = secoldParams[1];
					this.innerHTML = '右边';
				} else {
					secondObj = secoldParams[0];
					this.innerHTML = '左边';
				}
				_resetSecond();
			} else if(type === 'mark') {
				mui.toast('请打开左上角的开关按钮,才可以进行设置');
			}
		});
		var min = 25;
		var max = 45;
		var step = 1;
		mui('#hr_tT').on('tap', 'button', function() {
			var className = this[gAttr]("class");
			console.log('已点击');
			if(className.indexOf('change1') !== -1) { //减
				if(secondObj.targetTemperature <= min) { //最低25度
					mui.toast("已经到最低温度啦");
					return;
				} else {
					secondObj.targetTemperature -= step;
				}
			}
			if(className.indexOf('change2') !== -1) { //加
				if(secondObj.targetTemperature >= max) { //最高45度
					mui.toast("已经到最高温度啦");
					return;
				} else {
					secondObj.targetTemperature += step;
				}
			}
			mui('#hr_change')[0].value = secondObj.targetTemperature;
			mui('#hr_sure')[0].style.display = 'block';
		});
		mui('#hr_tT').on('tap', 'span', function() {
			this.prev().focus();
		});
		mui('#hr_change')[0].onfocus = function() {
			mui('#hr_sure')[0].style.display = 'block';
		}
		mui('#hr_change')[0].onblur = function() {
			var v = parseInt(this.value);
			if(isNaN(v)) {
				mui.toast('请输入25-45之间的数字');
				this.value = secondObj.targetTemperature;
				return;
			}
			if(v < min) {
				mui.toast('最低温度为25°C');
				secondObj.targetTemperature = min;
				this.value = min;
				return;
			}
			if(v > max) {
				mui.toast('最高温度为45°C');
				secondObj.targetTemperature = max;
				this.value = max;
				return;
			}

		}
		//开机时间
		mui("#hr_time")[0].onclick = function() {
			var self = this;
			var time = new Date().format("yyyy-MM-dd");
			time += " " + _timestrAndSecond(secondObj.startTime);
			//生成时间控件
			var picker = new mui.DtPicker({
				"type": "time",
				"value": time
			});
			picker.show(function(rs) {
				mui('#hr_sure')[0].style.display = 'block';
				self.innerHTML = rs.text;
				secondObj.startTime = _timestrAndSecond(rs.text);
				picker.dispose();
			});
		};
		//智能温度控制
		mui("#hr_control")[0].addEventListener("toggle", function(e) {
			mui('#hr_sure')[0].style.display = 'block';
			secondObj.autoTemperatureControl = e.detail.isActive ? 1 : 0;
		});
	}
	var _cancelSecondObj = function(obj) {
		obj.startTime = 0;
		obj.modeSwitch = 0;
		obj.protectTime = 0;
		obj.autoTemperatureControl = 0;
		obj.targetTemperature = 35;
	}
	//24小时转化为秒的值
	var hours_24 = 24 * 60 * 60;

	/**
	 * 一个新的板子数据可能不正常,需要初始化
	 * @param {Object} obj
	 */
	var _checkSecondObj = function(obj) {
		if(obj.startTime > hours_24) {
			obj.startTime = 0;
		}
		if(obj.startTime % 60 !== 0) {
			obj.startTime = 0;
		}
		if(obj.targetTemperature > 45) {
			obj.targetTemperature = 35;
		}
		if(obj.targetTemperature < 25) {
			obj.targetTemperature = 35;
		}
		if(obj.targetTemperature % 1 !== 0) {
			obj.targetTemperature = 35;
		}
		obj.protectTime = 600;
	}
	/**
	 * 获取第二页数据
	 */
	var _getSecond = function() {
		//查询左右
		var _search = function(side) {
			if(DEBUG) console.log("_getSecond 开始查询===" + side);
			_sendInfo(33, [{
				side: side
			}], function(data) {
				if(DEBUG) console.log("_getSecond 查询成功 " + side + "===" + JSON.stringify(data));
				if(data && data.flag) {
					var p = data.params;
					_checkSecondObj(p[0]);
					//					if(p[0] && p[0].modeSwitch == 0) {
					//						_cancelSecondObj(p[0]);
					//					}
					mui.extend(secoldParams[1 - side], p[0]);
					if(side === 1) {
						secondObj = secoldParams[0];
						_resetSecond()
					} else {
						if(downSelf) {
							downSelf.endPullDownToRefresh();
							mui.toast('刷新成功');
							downSelf = false;
						}
						if(refresh) {
							mui.toast('刷新成功');
						}
					}
				} else {
					mui.toast(errorText);

				}
			}, function() {
				console.log('加热预约查询失败');
			});
		}
		//查询加热预约订单
		_search(1); //查询左边
		setTimeout(function() {
			_search(0); //查询右边
		}, 500);
	}
	/**
	 * 重置第二页
	 */
	var _resetSecond = function() { //重置
		//开关开启
		if(secondObj.modeSwitch === 1) {
			mui('#hr_switch')[0].setAttribute('class', 'mui-switch mui-active');
			mui('#hr_switch>div')[0].setAttribute('style', 'transition-duration: 0.2s; transform: translate(43px, 0px);');
			mui('#hr_mark')[0].style.display = 'none';
		} else {
			mui('#hr_switch')[0].setAttribute('class', 'mui-switch');
			mui('#hr_switch>div')[0].setAttribute('style', '');
			mui('#hr_mark')[0].style.display = 'block';
		}
		mui('#hr_sure')[0].style.display = 'none';
		//左右切换
		if(secondObj.side === 1) {
			mui('#hr_side')[0].innerHTML = '左侧';
		} else {
			mui('#hr_side')[0].innerHTML = '右侧';
		}
		//温度显示
		mui('#hr_change')[0].value = secondObj.targetTemperature;
		//时间显示
		mui('#hr_time')[0].innerHTML = _timestrAndSecond(secondObj.startTime);
		//智能温度曲线显示
		mui('#hr_control')[0].setAttribute('class', secondObj.autoTemperatureControl ? "mui-switch mui-active" : "mui-switch");
		mui('#hr_control>div')[0].setAttribute('style', secondObj.autoTemperatureControl ? "transition-duration: 0.2s; transform: translate(43px, 0px);" : "");
	}

	/*************处理第二页 end*************/

	/*************处理第三页 start*************/
	//分钟 转化为秒数
	var minute_120 = 120 * 60;
	var minute_45 = 45 * 60;
	var minute_15 = 15 * 60;
	//设置初始值
	var thirdParams = [{
		"modeSwitch": 1,
		"side": 1,
		"workTime": minute_45, //45分钟
		"startTime": 0,
		"overTime": 0
	}, {
		"modeSwitch": 1,
		"side": 0,
		"workTime": minute_45,
		"startTime": 0,
		"overTime": 0
	}];
	var thirdObj = thirdParams[0];

	var _initThird = function() {
		console.log('_initThird 已运行');
		var min = 15 * 60; //最短理疗时长 
		var max = 120 * 60; //最长理疗时长 
		var step = 5 * 60; //步长 5分钟
		//开启和关闭
		mui("#pr_switch")[0].addEventListener("toggle", function(e) {
			if(e.detail.isActive) { //开启
				mui('#pr_switch')[0].setAttribute('class', 'mui-switch mui-active');
				mui('#pr_switch>div')[0].setAttribute('style', 'transition-duration: 0.2s; transform: translate(43px, 0px);');
				mui('#pr_mark')[0].style.display = 'none';
				mui('#pr_sure')[0].style.display = 'block';
			} else { //关闭
				if(thirdObj.modeSwitch == 1) {
					var txt = '是否取消' + (thirdObj.side === 1 ? '左侧' : '右侧') + '理疗预约';
					mui.confirm(txt, "提示", CONSTANT.confirmBtn, function(rs) {
						if(rs.index == CONSTANT.confirmSure) {
							//							_cancelThirdObj(thirdObj);
							thirdObj.modeSwitch = 0;
							_sendInfo(18, [thirdObj], function() {
								mui.toast("理疗预约已取消");
								_resetThird();
							}, function() {
								console.log('理疗预约取消失败');
							});
						} else {
							mui('#pr_switch')[0].setAttribute('class', 'mui-switch mui-active');
							mui('#pr_switch>div')[0].setAttribute('style', 'transition-duration: 0.2s; transform: translate(43px, 0px);');
						}
					});
				} else {
					mui('#pr_switch')[0].setAttribute('class', 'mui-switch');
					mui('#pr_switch>div')[0].setAttribute('style', '');
					mui('#pr_mark')[0].style.display = 'block';
					mui('#pr_sure')[0].style.display = 'none';
				}
			}
		});

		mui('#phyRvat').on('tap', '.elem-click', function() {
			var type = this.getAttribute('title');
			if(type === 'sure') { //确定按钮
				if(thirdObj.startTime >= thirdObj.overTime) {
					mui.toast("结束时间必须大于开始时间,请重新选择结束时间");
					return;
				}
				thirdObj.modeSwitch = 1;
				_sendInfo(18, [thirdObj], function() {
					_resetThird();
					mui.toast("理疗预约已设置");
				}, function() {
					console.log('理疗预约设置失败');
				});
			} else if(type === 'side') { //左右切换
				if(thirdObj.side === 1) {
					thirdObj = thirdParams[1];
					this.innerHTML = '右边';
				} else {
					thirdObj = thirdParams[0];
					this.innerHTML = '左边';
				}
				_resetThird();
			} else if(type === 'mark') {
				mui.toast('请打开左上角的开关按钮,才可以进行设置');
			}
		});

		//时间显示
		mui("#phyRvat").on("tap", ".pr_time", function() {
			var self = this;
			var id = self[gAttr]("id");
			var time = new Date().format("yyyy-MM-dd");
			time += " " + _timestrAndSecond(thirdObj[id]);
			//生成时间控件
			var picker = new mui.DtPicker({
				"type": "time",
				"value": time
			});
			picker.show(function(rs) {
				thirdObj[id] = _timestrAndSecond(rs.text);
				var inner = _getText(rs.text, id);
				if(inner.length !== 0) {
					self.innerHTML = inner;
				}
				picker.dispose();
			});
		});
		mui('#workTime').on('tap', 'button', function() {
			var className = this[gAttr]("class");
			console.log('已点击');
			if(className.indexOf('change1') !== -1) { //减
				if(thirdObj.workTime - step < min) { //最短15分钟
					mui.toast("最短时长为15分钟");
				} else {
					thirdObj.workTime -= step;
				}
			}
			if(className.indexOf('change2') !== -1) { //加
				if(thirdObj.workTime + step > max) { //最长120分钟
					mui.toast("最长时长为120分钟");
				} else {
					thirdObj.workTime += step;
				}
			}
			mui('#pr_change')[0].value = thirdObj.workTime / 60;
			mui('#pr_sure')[0].style.display = 'block';
		});
		mui('#workTime').on('tap', 'span', function() {
			this.prev().focus();
		});
		mui('#pr_change')[0].onfocus = function() {
			mui('#pr_sure')[0].style.display = 'block';
		}
		mui('#pr_change')[0].onblur = function() {
			var v = parseInt(this.value);
			if(isNaN(v)) {
				mui.toast('请输入15-120之间的数字');
				this.value = thirdObj.workTime / 60;
				return;
			}
			if(v < 15) {
				mui.toast('最短理疗时长为15分钟');
				thirdObj.workTime = min;
				this.value = min / 60;
				return;
			}
			if(v > 120) {
				mui.toast('最长理疗时长为120分钟');
				thirdObj.workTime = max;
				this.value = max / 60;
				return;
			}
		}
	}
	var _getThird = function() {
		//查询左右
		var _search = function(side) {
			if(DEBUG) console.log('_getThird 开始查询===' + side);
			_sendInfo(34, [{
				side: side
			}], function(data) {
				if(data && data.flag) {
					if(DEBUG) console.log('_getThird 查询成功' + side + '===' + JSON.stringify(data));
					var p = data.params;
					_checkThirdObj(p[0]);
					//					if(p[0] && p[0].modeSwitch == 0) {
					//						_cancelThirdObj(p[0]);
					//					}
					mui.extend(thirdParams[1 - side], p[0]);
					if(side === 1) {
						thirdObj = thirdParams[0];
						_resetThird();
					} else {
						if(downSelf) {
							downSelf.endPullDownToRefresh();
							downSelf = false;
							mui.toast('刷新成功');
						}
						if(refresh) {
							mui.toast('刷新成功');
						}
					}
				} else {
					mui.toast(errorText);
				}
			}, function() {
				console.log("理疗预约查询失败");
			});
		}
		//查询理疗预约订单
		_search(1); //查询左边
		setTimeout(function() {
			_search(0); //查询右边
			COM.closeLoading();
		}, 500);
	}
	var _cancelThirdObj = function(obj) {
		obj.modeSwitch = 0;
		obj.workTime = minute_45;
		obj.startTime = 0;
		obj.overTime = 0;
	}
	var _checkThirdObj = function(obj) {
		if(obj.workTime > minute_120) { //大于120分钟
			obj.workTime = minute_45;
		}
		if(obj.workTime < minute_15) { //小于15分钟
			obj.workTime = minute_45;
		}
		if(obj.workTime % 60 !== 0) { //
			obj.workTime = minute_45;
		}
		if(obj.startTime > hours_24) {
			obj.startTime = 0;
		}
		if(obj.startTime % 60 !== 0) {
			obj.startTime = 0;
		}
		if(obj.overTime > hours_24) {
			obj.overTime = 0;
		}
		if(obj.overTime % 60 !== 0) {
			obj.overTime = 0;
		}
	}

	//获取描述
	var _getText = function(time, id) {
		var hours = 0; //时
		var minute = 0; //分
		var text = "";
		if(typeof time === "number") {
			hours = parseInt(time / 3600);
			minute = parseInt(time % 3600 / 60);
		} else {
			var tmp = time.split(":");
			hours = parseInt(tmp[0]);
			minute = parseInt(tmp[1]);
		}
		if(id === "startTime") {
			text = "开始时间：" + _checkTime(hours) + ':' + _checkTime(minute);
		}
		if(id === "overTime") {
			text = "结束时间：" + _checkTime(hours) + ':' + _checkTime(minute);
		}
		return text;
	}
	/**
	 * 重置第三页
	 */
	var _resetThird = function() { //重置
		console.log('_resetThird 已运行');
		//开关开启
		if(thirdObj.modeSwitch === 1) {
			mui('#pr_switch')[0].setAttribute('class', 'mui-switch mui-active');
			mui('#pr_switch>div')[0].setAttribute('style', 'transition-duration: 0.2s; transform: translate(43px, 0px);');
			mui('#pr_mark')[0].style.display = 'none';
		} else {
			mui('#pr_switch')[0].setAttribute('class', 'mui-switch');
			mui('#pr_switch>div')[0].setAttribute('style', '');
			mui('#pr_mark')[0].style.display = 'block';
		}
		mui('#pr_sure')[0].style.display = 'none';
		//左右切换
		if(thirdObj.side === 1) {
			mui('#pr_side')[0].innerHTML = '左侧';
		} else {
			mui('#pr_side')[0].innerHTML = '右侧';
		}
		mui('#pr_change')[0].value = thirdObj.workTime / 60;
		mui('#startTime')[0].innerHTML = _getText(thirdObj.startTime, "startTime");
		mui('#overTime')[0].innerHTML = _getText(thirdObj.overTime, "overTime");
	}

	/*************处理第三页 end*************/

	var _reload = function() {
		location.href = location.href;
	}

	return {
		start: _start,
		reload: _reload
	}
})();