/**
 * 睡眠统计页面
 */
window.Y_REPORT = (function() {
	var t = 0;
	var showFlag = document.body.clientWidth >= 375 ? true : false;
	var xW = document.body.clientWidth * 0.8 * 0.7; //0.8是表格显示宽度 0.7是X轴显示宽度 用于计算刻度
	var sleepList = []; //睡眠列表数据 存储
	var xAxis = []; //柱状图的x轴,都是日期
	var barList = [{
		key: 'iSleepEffciency', //显示属性
		name: '睡眠效率', //名称
		xAxis: xAxis, //x轴数据
		yAxis: null, //y轴数据 _countData每次动态生成
		yUnit: '%',
		step: 20, //步长 _countData使用
		data: [] //具体的数据 _countData设置
	}, {
		key: 'iSleepDuration',
		name: '在床时长',
		xAxis: xAxis,
		yAxis: null,
		yUnit: '小时',
		step: 2, //步长 _countData使用
		data: []
	}, {
		key: 'fallAsleepDuration',
		name: '入睡时长',
		xAxis: xAxis,
		yAxis: null,
		yUnit: '分钟',
		rate: 60, //获取的数据 和显示的数值的倍率
		step: 2, //步长 _countData使用
		data: []
	}, {
		key: 'iSleepLeave',
		name: '离床次数',
		xAxis: xAxis,
		yAxis: null,
		yUnit: '次',
		step: 2, //步长 _countData使用
		data: []
	}, {
		key: 'iSleepMove',
		name: '体动次数',
		xAxis: xAxis,
		yAxis: null,
		yUnit: '次',
		step: 2, //步长 _countData使用
		data: []
	}];
	/**
	 * 获取睡眠列表数据
	 */
	var _getList = function() {
		var list = [];
		for(var i = 0; i < 7; i++) {
			var o = JSON.parse(JSON.stringify(TEST.obj));
			o.iSleepResultId += t;
			o.tSleepDate = '2017-05-' + (1 + t) + ' 00:00:00';
			o.tStartSleep = '2017-05-' + (1 + t) + ' ' + COM.getRandom(21, 24) + ':00:00';
			o.tEndSleep = '2017-05-' + (1 + t + 1) + ' 0' + COM.getRandom(6, 9) + ':00:00';
			o.tFallAsleepTime = '2017-05-' + (1 + t + 1) + ' 0' + COM.getRandom(6, 9) + ':00:00';
			o.tWakeTime = '2017-05-' + (1 + t + 1) + ' 0' + COM.getRandom(6, 9) + ':00:00';
			o.iSleepDuration = COM.getRandom(4, 9);
			o.fallAsleepDuration = COM.getRandom(4, 9);
			o.iWakeDuration = COM.getRandom(4, 9);
			o.iLightDuration = COM.getRandom(4, 9);
			o.iSleepMove = COM.getRandom(4, 9);
			o.iSleepLeave = COM.getRandom(4, 9);
			o.iSleepEffciency = COM.getRandom(10, 100);
			o.deepSleep = COM.getRandom(4, 9);
			o.weakSleep = COM.getRandom(4, 9);
			o.dreamSleep = COM.getRandom(4, 9);
			list.push(o);
			t++;
		}
		return list;
	}

	/**
	 * 简析睡眠列表数据 用于画柱状图
	 */
	var _anasList = function(list) {
//		console.log(list);
		/**
		 * 获取y轴的数据
		 * @param {Object} key 计算barObj中的哪个属性
		 * @param {Object} step 步长
		 * @param {Object} unit 单位
		 * @param {Object} rate 步长与单位之间的倍率 不传则为1
		 */
		var _countData = function(barObj) {
			var max = barObj.data.max();
			var rate = barObj.rate || 1;
//			console.log(rate);
			var step = barObj.step;
			var t = barObj.yAxis = [];
			var size = parseInt(max / step);
			if(size <= 5) {
				size = 5;
			} else {
				size = size * step === max ? size : size + 1;
			}
			for(i = 0; i <= size; i++) {
				t.push(i * step * rate);
			}

			var keyData = barObj.data;
			var lineData = barObj.lineData = [];
			for(var i = 0; i < xAxis.length; i++) {
				lineData.push([i, parseFloat((keyData[i] / step).toFixed(2))]);
			}
		}

		for(var i = 0; i < list.length; i++) {
			var obj = list[i];
			xAxis.push(new Date(obj.tSleepDate).format('MM-dd'));
			for(var j = 0; j < barList.length; j++) {
				barList[j].data.push(obj[barList[j].key]);
			}
		}
		for(var j = 0; j < barList.length; j++) {
			_countData(barList[j]);
		}

//		console.log(barList);
	}

	/**
	 * 获取生成柱状图的对象
	 */
	var _getOption = function(index) {
		var keyObj = barList[index];
		var max = parseInt(xW / keyObj.xAxis.length);
//		console.log(max);
		var chartOption = {
			name: keyObj.name,
			xAxis: {
				axisLabel: {
					interval: function(index, value) {
						if(showFlag || index % 2 === 0) {
							return value;
						} else {
							return '';
						}
					},
				},
				//				min:max,
				//				max: max,
				axisTick: {
					interval: 0,

				},
				boundaryGap: false,
				data: keyObj.xAxis
			},

			yAxis: {
				name: keyObj.yUnit,
				category: 'category',
				boundaryGap: false,
				data: keyObj.yAxis
			},
			series: [{
				name: '睡眠统计',
				type: 'line',
				data: keyObj.lineData
			}]
		}
//		console.log(chartOption);
		return chartOption;
	}

	/**
	 * 生成柱状图
	 */
	var _showBar = function() {
		var option = _getOption(2);
		var pieChart = echarts.init(mui('.y_echarts_box')[0]);
		pieChart.setOption(option, false);

	}

	/**
	 * 开始函数
	 */
	var _start = function() {
		console.log('Y_REPORT.start已执行');
		//		COM.createLoading();
		//var deviceObj = JSON.parse(COM.getStorage(STORAGE.device) || '{}');
		deviceObj = {
			alias: '青少年'
		};
		COM.addReload(function() {
			var thisDevice = JSON.parse(COM.getStorage(STORAGE.device) || '{}');
			if(deviceObj.device_name !== thisDevice.device_name) {
				mui('#' + CONSTANT.headerId + ' h1')[0].innerHTML = thisDevice.alias + '的睡眠统计';
			}
		});
		COM.addHN(false, deviceObj.alias + '的睡眠统计', CONST_MENU.home, true);
		COM.back(); 
		sleepList = _getList(); //获取列表
		_anasList(sleepList); //简析列表
		_showBar(); //生成数据
	}
	var _next = function() {
		sleepList = _getList(); //获取列表
		_anasList(sleepList); //简析列表
		_showBar(); //生成数据
	}
	return {
		start: _start,
		next: _next
	}
})();