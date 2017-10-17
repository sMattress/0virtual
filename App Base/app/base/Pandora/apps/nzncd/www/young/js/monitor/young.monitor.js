/**
 * 睡眠监控页面
 * Y_代表的是young文件夹
 */
window.Y_MONITOR = (function(stateObj) {
	var _deviceCode = null; //当前设备编号
	var _refreshTime = 30;
	var _monitorIntervalId = null; //定时器id

	var _monitorStateObj = Y_COM.stateObj; //状态对象 来自Y_COM.stateObj
	var _stageArr = []; //实时分期状态字符串
	_stageArr.start = 0; //实时分期 查询位置
	_stageArr.oldState = ''; //上一次简析的状态

	var _stageWidth = 290;
	var _stageFlag = false;
	
	var isAjax = false;
	//页面开始
	var _start = function() {
		_init();
		_bind();
		_getSleepMonitor();
//		_countRefresh();
	}
	
	//初始化
	var _init = function() {
		var deviceObj = JSON.parse(COM.getStorage(STORAGE.device) || '{"alias":"我的"}');
		//		COM.addHN(false, '“' + deviceObj.alias + '”的实时监听', CONST_MENU.home, true);
		COM.addHN(true, '“' + deviceObj.alias + '”的实时状态', CONST_MENU.home, true);
		COM.back(function() {
			clearInterval(_monitorIntervalId);
			COM.openWindow('home');
		});
		COM.addReload(function() {
			var deviceObj = JSON.parse(COM.getStorage(STORAGE.device) || '{"alias":"我的"}');
			mui('#com_header>h1')[0].innerHTML = '“' + deviceObj.alias + '”的实时监听';
			_deviceCode = deviceObj.device_name;
			_refreshGo();
		});
		_deviceCode = Y_COM.debug_device || deviceObj.device_name;//此处需要删除

		_stageWidth = document.body.clientWidth - 30;
	}
	//绑定点击事件
	var _bind = function() {
		mui('#com_body').pullToRefresh({
			down: {
				callback: function() {
					setTimeout(function() {
						location.href = location.href;
					}, 500);
				}
			}
		});
		mui('#real_time_monitor')[0].addEventListener('toggle', function(event) {
			if(event.detail.isActive) {
				_stageFlag = true;
			} else {
				_stageFlag = false;
				mui('#ys_box')[0].innerHTML = "";
			}
		});
		mui('#test_div').on('tap', 'div', function() { //需要删除
			var txt = this.innerText;
			if(txt === '监控结束') {
				_showDiv('yb_counting');
			} else {
				_showDiv('yb_counting_over');
			}
		});
//		mui('#com_header').on('tap', 'button', function() {
//			COM.openWindow('home', '../../../com/html/other/home.html');
//		});
		mui('#y_monitor').on('tap','.ym-show-refresh',_refreshGo);
//		mui('#com_nav').on('tap', 'a', function() {
//			var id = this.getAttribute('title');
//			var href = '../' + this.getAttribute('goHref');
//			if(id !== 'young_monitor') {
//				COM.openWindow(id, href, true);
//			}
//		});
		mui('#yb_counting_over').on('tap', 'a', function() {
			COM.openWindow('young_record_detaile', '../record/young_record_detaile.html', true);
		});
	}
	
	//计算刷新
	var _countRefresh = function(){
		mui('#y_monitor>.ym-show-time')[0].innerHTML = '<span>'+ _refreshTime +'</span>秒<br />后刷新';
//		console.log('_refreshTime==='+_refreshTime);
		_monitorIntervalId = setInterval(function(){
//			if(DEBUG) console.log('=_refreshTime===='+_refreshTime);
			if(--_refreshTime <= 0){
				_refreshGo();
			}else{
				mui('#y_monitor>.ym-show-time')[0].innerHTML = '<span>'+ _refreshTime +'</span>秒<br />后刷新';
			}
		},1000);
	}
	//刷新
	var _refreshGo = function(){
		clearInterval(_monitorIntervalId);
		_refreshTime = 30;
		_getSleepMonitor();
		if(_stageFlag){
			_getSleepStage();
		}
	}
	
	//获取实时数据  需要改变
	var _getSleepMonitor = function() {
		if(isAjax){
			return;
		}
		isAjax = true;
		mui('#y_monitor>.ym-show-time')[0].innerHTML = '刷新中';
		var ajaxObj = {
			url: URL.getSleepMonitor,
			data: {
				device_id: _deviceCode
			},
			type: 'GET',
			sign:false,
			success: function(data) {
				isAjax = false;
				if(data && data.flag) {
					var obj = data.params[0];
					if(obj) {
						if(obj.end_flag !== 'true') { //正在监听
							_showDiv(true);
						} else { //监测到已结束
							obj.heart_rate = '0';
							obj.current_state = '9';
							if(obj.id) { //计算结果已出
								COM.setStorage(STORAGE.oneSleepId, obj.id);
								_showDiv('yb_counting_over');
							} else { //计算结果未出
								_showDiv('yb_counting');
							}
						}
						_showSleepMonitor(obj);
					} else {
						mui.toast('获取当前睡眠数据失败啦');
					}
				} else {
					_showDiv('yb_error');
				}
				_countRefresh();
			},
			error: function() {
				isAjax = false;
				_showDiv('yb_error');
				_countRefresh();
			}
		}
		if(DEBUG) console.log('_getSleepMonitor正在执行ajax请求');
		COM.ajax(ajaxObj);
//		var data = _getTestMonitor();
//		ajaxObj.success(data);
	}
	//展示实时数据  需要改变
	var _showSleepMonitor = function(obj) {
		//显示心率
		mui('#y_monitor>.ym-show-heart')[0].innerHTML = obj.heart_rate;
		//显示状态
		var txt = new Date().format('hh:mm');
		var current_state = obj.current_state;
		var csArr = _monitorStateObj[current_state];
		if(csArr){
			txt += ' <span style="color:#'+ csArr[2] +';">'+csArr[0]+'</span>';
		}else{
			txt += ' <span>刚上床</span>';
		}
		mui('#y_monitor>.ym-show-state')[0].innerHTML = txt;
	}

	//获取测试睡眠数据 需要删除
	var _getTestMonitor = function() {
		var data = {
			flag: 1,
			params: []
		};
		var tmp = {};
		tmp.current_state = COM.getRandom(6, 9);
		tmp.heart_rate = COM.getRandom(60, 100);
		tmp.breath_rate = '待定';
		tmp.end_flag = 'false';
		data.params.push(tmp);
		return data;
	}

	//获取分期数据 需要修改
	var _getSleepStage = function() {
		return;
		console.log(_stageArr.start);
		var ajaxObj = {
			url: URL.getSleepStage,
			data: {
				device_id: _deviceCode,
				start: _stageArr.start
			},
			type: 'GET',
			sign:false,
			success: function(data) {
				if(data && data.flag) {
					var obj = data.params[0];
					if(obj) {
						_showSleepStage(obj);
					} else {
						mui.toast('获取睡眠分期失败啦');
					}
				} else {
					mui.toast('获取睡眠分期失败啦');
				}
			}
		};
		if(DEBUG) console.log('_getSleepStage 正在执行ajax请求');
		COM.ajax(ajaxObj);
//		var data = _getStageStr(_stageArr.start);
//		ajaxObj.success(data);
	}
	//显示睡眠分期 需要修改
	var _showSleepStage = function(obj) {
		var stage = obj.stage;
		mui('#ys_start')[0].innerHTML = obj.start_time.substr(5, 11);
		mui('#ys_now')[0].innerHTML = obj.now_time.substr(5, 11);
		console.log(stage.length);
		if(stage.length !== 0) {
			var total = _stageArr.start += stage.length;
			for(var i = 0; i < stage.length; i++) {
				var stageI = stage[i];
				if(!_monitorStateObj[stageI]){
					console.log('存在状态'+stageI);
					continue;
				}
				if(_stageArr.oldState === stageI) {
					_stageArr[_stageArr.length - 1].num++;
				} else {
					_stageArr.oldState = stageI;
					_stageArr.push({
						key: stageI,
						num: 1
					})
				}
			}
			var html = '';
			var width = _stageWidth;
			for(var i = 0; i < _stageArr.length; i++) {
				var tmp = _stageArr[i];
				if(_stageArr.length === 1) {
					var percent = _stageWidth + 'px';
				} else {
					if(i === _stageArr.length - 1) {
						var percent = width + 'px';
					} else {
						var wTmp = (tmp.num / total * _stageWidth).toFixed(2);
						width -= wTmp;
						var percent = wTmp + 'px';
					}
				}
				html += '<i style="width:' + percent + ';" class="sb-' + _monitorStateObj[tmp.key][1] + '"></i>';
			}
			mui('#ys_box')[0].innerHTML = html;
		} else {
			if(_stageArr.start === 0){
				mui('#ys_box')[0].innerHTML = '暂时没有数据哦';
				console.log('获取到的字符串为空');
			}
		}
	}
	var _clear = function(){
		clearInterval(_monitorIntervalId);
	}
	
	/**
	 * 显示需要显示的div
	 * @param {Object} id 为字符串显示对应id的值 为false时都不显示  其他显示最后两个
	 */
	var _showDiv = function(id) {
		console.log('=id===='+id);
		var ids = ['yb_error', 'yb_counting', 'yb_counting_over'];
		for(var i = 0; i < ids.length; i++) {
			document.getElementById(ids[0]).style.display = 'none';
		}
		if(typeof id === 'string') {
			document.getElementById(id).style.display = 'block';
		} 
		document.getElementById('y_monitor').style.display = 'block';
//		document.getElementById('yb_stage_box').style.display = 'block';
	}

	//此值需要删除
	var _stageStr = '66666688888888888886866666677777777777767768886666667767777777777677999666696969666666777777777777777667777776777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777776677777777777777777777777777777777777777777667777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777677777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777799999999999999996666667777799966666677777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777799999999999666666999969966666677777777777777777777777777777777777777777777777777777777777777777777777777777777777777677777777777777777777777777777777799666666777777777777777777777777777777666777999999';
	//	var _stageStr = '66666688888888888888777777';
	var _getStageStr = function(start) {
		var len = COM.getRandom(5, 20);
		//		var len = _stageStr.length - 1;
		var t = '';
		var flag = 0;
		if(_stageStr.length > start + len) {
			t = _stageStr.substr(start, len);
		} else {
			flag = 1;
		}

		var data = {
			flag: 1,
			params: []
		};
		var tmp = {};
		tmp.stage = t;
		tmp.start_time = '2017-08-13 22:23:00';
		tmp.now_time = '2017-08-14 03:02:00';
		tmp.end_flag = flag;
		data.params.push(tmp);
		return data;
	}

	return {
		start: _start,
		_getSleepStage: _getSleepStage,
		clear:_clear
	}
})();