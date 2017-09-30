/**
 * 单个睡眠记录详情
 * Y_代表的是young文件夹
 */
window.Y_RECORD_DETAILE = (function() {
	var _deviceCode = null; //当前设备编号
	var _id = null;
	var _stateObj = Y_COM.sleepOverState;

	var _anaxObj = null; //解析后的对象

	var _stageWidth = 290;
	var _oneMinuteStamp = 1 * 60 * 1000; //一分钟的时间戳
	var _oneDayTimeStamp = 24 * 60 * _oneMinuteStamp;

	var _stagePieChart = null; //睡眠状态 #yrb_stage
	var _heartPieChart = null; //心率曲线图 #heart_grid
	var _staticsPieChart = null; //睡眠分期图 #yrb_stage
	var _downElem = null; //下拉元素

	//开始函数
	var _start = function() {
		_init();
		_bind();
		_getSleepFullstage();
	}
	//初始化数据 需要修改
	var _init = function() {
		_id = COM.getStorage(STORAGE.oneSleepId);
		console.log('_id===' + _id);
		//		_id = 3638;
		COM.back(function() {
			COM.openWindow('young_record', undefined, true);
		});
		COM.addReload(function() {
			_id = COM.getStorage(STORAGE.oneSleepId);
			_getSleepFullstage();
		})
//		_stageWidth = mui('#ys_box')[0].clientWidth;
		_stagePieChart = echarts.init(mui('#yrb_stage')[0]);
		_heartPieChart = echarts.init(mui('#heart_grid')[0]);
		_staticsPieChart = echarts.init(mui('#yrb_statics')[0]);
	}
	//绑定点击事件
	var _bind = function() {
		mui('#com_header').on('tap', 'button', function() {
			var title = this.getAttribute('title');
			if(title === 'home') {
				COM.openWindow('home', '../../../com/html/other/home.html');
			}
		});
		mui('#yrd_date').on('tap', '.mui-icon', function() {
			var direction = this.getAttribute('title');
			_getSleepFullstage(direction);
		});
		mui('#com_body').pullToRefresh({
			down: {
				callback: function() {
					_downElem = this;
					_getSleepFullstage();
				}
			}
		});
	}
	//获取睡眠分期数据 需要修改
	var _getSleepFullstage = function(direction) {
		direction = direction || 0;
		//		_id = 3638;
		var ajaxObj = {
			url: URL.getSleepFullstage,
			data: {
				id: _id,
				direction: direction
			},
			type: 'GET',
			sign: false,
			success: function(data) {
				if(data && data.flag) {
					var obj = data.params[0];
					if(obj && obj.id) {
						_showSleepFullSatge(obj);
					} else {
						if(direction == -1) {
							mui.toast('抱歉，已经没有上一次的数据啦');
						} else if(direction == 1) {
							mui.toast('抱歉，已经没有下一次的数据啦');
						} else {
							mui.toast('抱歉，获取详情失败啦');
						}
					}
				} else {
					if(_downElem) {
						_downElem.endPullDownToRefresh();
						_downElem = null;
					}
					mui.toast('抱歉，获取详情失败啦');
				}
			},
			error: function() {
				if(_downElem) {
					_downElem.endPullDownToRefresh();
					_downElem = null;
				}
			}
		};
		//		ajaxObj.success(_getData());
		if(DEBUG) console.log('_getSleepFullstage开始请求数据');
		COM.ajax(ajaxObj);
	}
	//解析获取到的睡眠分期数据 需要修改
	var _showSleepFullSatge = function(obj) {
		var startStamp = new Date().getTime();
		if(DEBUG) {
			console.log('_showSleepFullSatge===========');
			if((obj.start_time + obj.start_time).indexOf('-') !== -1) {
				throw '返回回来的时间带有-,ios不能解析带有-格式的日期字符串,字符串：' + (asleep_time + awake_time);
			} 
		}
		_id = obj.id;
		COM.setStorage(STORAGE.oneSleepId, _id);
		var start_time = obj.start_time;
		var end_time = obj.end_time;

		//计算日期显示
		var dayStartStamp = new Date(start_time.substr(0, 10) + ' 12:00:00').getTime();
		var asleepTimeDate = new Date(start_time);
		var nowDate = null;
		if(dayStartStamp > asleepTimeDate.getTime()) {
			nowDate = new Date(dayStartStamp - _oneDayTimeStamp).format('yyyy/MM/dd');
		} else {
			nowDate = asleepTimeDate.format('yyyy/MM/dd');
		}
		console.log('=nowDate===='+nowDate);

		//显示睡眠效率
		mui('#yrd_efficiency')[0].innerHTML = (obj.efficiency || 0) + '%';
		if(obj.start_time){//上床时间
			mui('#yrd_date>span')[2].innerHTML = nowDate;
			mui('#yrd_start_time>span')[1].innerHTML =  new Date(obj.start_time).format('hh:mm');
		}else{
			mui('#yrd_date>span')[2].innerHTML = "";
			mui('#yrd_start_time>span')[1].innerHTML =  "";
		}
		if(obj.asleep_time){//入睡时间
			mui('#yrd_asleep_time>span')[1].innerHTML =  new Date(obj.asleep_time).format('hh:mm');
		}else{
			mui('#yrd_asleep_time>span')[1].innerHTML = "";
		}
		if(obj.awake_time){//觉醒时间
			mui('#yrd_awake_time>span')[1].innerHTML =  new Date(obj.awake_time).format('hh:mm');
		}else{
			mui('#yrd_awake_time>span')[1].innerHTML =  "";
		}
		if(obj.end_time){//离床时间
			mui('#yrd_end_time>span')[1].innerHTML =  new Date(obj.end_time).format('hh:mm');
		}else{
			mui('#yrd_end_time>span')[1].innerHTML =  "";
		}
		if(DEBUG){
			console.log('=start_time===='+obj.start_time);
			console.log('=asleep_time===='+obj.asleep_time);
			console.log('=awake_time===='+obj.awake_time);
			console.log('=end_time===='+obj.end_time);
		}
		_showStage(obj.stage, start_time, end_time);
		_showStatics(obj.statics, start_time, end_time);
		_showHeartRate(obj.heart_rate, start_time, end_time);

		var endStamp = new Date().getTime(); 
		console.log('_showSleepFullSatge运行时间' + (endStamp - startStamp) / 1000);
		if(_downElem) {
			_downElem.endPullDownToRefresh();
			_downElem = null;
		}
	}
	//#ys_box 睡眠数据展示
	var _showStage = function(stage, start, end) {
		if(DEBUG) console.log('_showStage===========');
		if(DEBUG) console.log(stage);
//		console.log(stage);
		var xAxis = [];
		var stageTmpArr = (stage || '').split(',');
		var startStamp = new Date(start).getTime();
		var timeSplice = _oneMinuteStamp / 2;
		var max = 4000;
		var min = 0;
		var stageArr = []; 
		for(var i = 0; i < stageTmpArr.length - 1; i++) {
			var tmpTimeStamp = startStamp + (i * timeSplice);
			xAxis.push(new Date(tmpTimeStamp).format('hh:mm'));
			var hi = parseInt(stageTmpArr[i] * 1000);
			stageArr.push(hi);
		}
		if(DEBUG) console.log("=stageArr===="+JSON.stringify(stageArr));
//		console.log("=stageArr===="+JSON.stringify(stageArr));
		var stageOption = {
			title: {
				text: '睡眠状态图',
				padding: [15, 0, 0, 15],
				textStyle: {
					color: '#000',
					fontFamily: 'Helvetica Neue',
					fontSize: 18
				}
			},
			color: '#FF7F00',
			xAxis: {
				type: 'category',
				axisTick: {
					alignWithLabel: true
				},
				axisLine: {
					onZero: false,
					lineStyle: {
						color: '#d14a61'
					}
				},
				data: xAxis
			},
			grid: {
				left: '3%',
				right: '4%',
				bottom: '3%',
				containLabel: true
			},
			yAxis: {
				type: 'value',
				min: min,
				max: max,
				splitLine: {
					show: false,
					lineStyle: {
						type: 'dashed'
					}
				},
				axisTick:{
					show:false
				},
				axisLine: {
					onZero: false
				},
				axisLabel: {
					formatter: function(value, index) {
						if(value >= 3500){
							return "清醒";
						}else if(value >= 2500){
							return "中睡";
						}else if(value >= 1500 ){
							return "浅睡";
						}else if(value === 0){
							return "深睡";
						}else{
							return "";
						}
					}
				},
			},
			series: [{
				name: '睡眠数据',
				type: 'line',
				smooth: true,
				silent: true,
				hoverAnimation: false,
				data: stageArr
			}]
		};
		_stagePieChart.setOption(stageOption, false);
	}
	//yrb_stage 睡眠分期图
	var _showStatics = function(list, start, end) {
		if(DEBUG) console.log('_showStatics===========');
		if(DEBUG) console.log(JSON.stringify(list));
		var serieData = [];
		var legendData = [];
		for(var i = 0; i < list.length; i++) {
			var obj = list[i];
			var state = _stateObj[obj.key];
			var name = state[0];
			var color = '#' + state[2];

			serieData.push({
				name: name,
				value: obj.percent,
				itemStyle: {
					normal: {
						barBorderColor: color,
						color: color
					},
					emphasis: {
						barBorderColor: color,
						color: color
					}
				}
			});
			legendData.push({
				name: name
			});
		}

		var stageOption = {
			title: {
				text: '睡眠分期图',
				padding: [15, 0, 0, 0],
				textStyle: {
					color: '#000',
					fontFamily: 'Helvetica Neue',
					fontSize: 18
				}
			},
			legend: {
				bottom: 0,
				data: legendData,
				selectedMode: false
			},
			label: {
				normal: {
					show: false,
					position: 'inside',
					formatter: '{b}:{d}%'
				}
			},
			series: [{
				type: 'pie',
				center: ['50%', '50%'],
				radius: [0, '50%'],
				data: serieData
			}]
		}
		_staticsPieChart.setOption(stageOption, false);
	}

	//显示心率数据
	var _showHeartRate = function(heart_rate, start, end) {
		if(DEBUG) console.log('_showHeartRate============');
		if(DEBUG) console.log("=heart_rate===="+heart_rate); 
		var xAxis = [];
		heart_rate = heart_rate || '';
		heartRate = heart_rate.split(',');
		var startStamp = new Date(start).getTime();
		var timeSplice = _oneMinuteStamp / 2;
		var max = 0;
		var min = 1000;
		var heartArr = []; 
		for(var i = 0; i < heartRate.length - 1; i++) {
			var tmpTimeStamp = startStamp + (i * timeSplice);
			xAxis.push(new Date(tmpTimeStamp).format('hh:mm'));
			var hi = parseInt(heartRate[i]);
			heartArr.push(hi);
			if(hi > max) {
				max = hi;
			}
			if(hi < min) {
				min = hi;
			} 
		}
		if(DEBUG) console.log("=heartArr===="+JSON.stringify(heartArr));
		if(max === 0) {
			max = 100;
		}
		max = (parseInt(max / 10) + 1) * 10;
		if(min === 1000) {
			min = 0;
		}
		if(min != 0) {
			min = (parseInt(min / 10) - 1) * 10;
		}

		var heartRateOption = {
			title: {
				text: '心率折线图',
				padding: [15, 0, 0, 15],
				textStyle: {
					color: '#000',
					fontFamily: 'Helvetica Neue',
					fontSize: 18
				}
			},
			color: '#FF7F00',
			xAxis: {
				type: 'category',
				axisTick: {
					alignWithLabel: true
				},
				axisLine: {
					onZero: false,
					lineStyle: {
						color: '#d14a61'
					}
				},
				data: xAxis
			},
			yAxis: {
				type: 'value',
				min: min,
				max: max,
				splitLine: {
					show: true,
					lineStyle: {
						type: 'dashed'
					}
				},
				axisLine: {
					onZero: false
				}
			},
			series: [{
				name: '心率数据',
				type: 'line',
				smooth: true,
				silent: true,
				markLine: {
					lineStyle: {
						normal: {
							color: '#333'
						}
					},
					data: [
						[{
								type: 'max',
								name: '最大值',
								x: '10%',
								symbol: 'emptyCircle'
							},
							{
								symbol: 'none',
								yAxis: 'max',
								x: '90%',
								label: {
									normal: {
										position: 'end',
										formatter: '{c}'
									}
								},
							}
						],
						[{
								type: 'min',
								name: '最小值',
								x: '10%',
								symbol: 'emptyCircle'
							},
							{
								symbol: 'none',
								yAxis: 'min',
								x: '90%',
								label: {
									normal: {
										position: 'end',
										formatter: '{c}'
									}
								},
							}
						]
					]
				},
				hoverAnimation: false,
				data: heartArr
			}]
		};
		_heartPieChart.setOption(heartRateOption, false);
	}

	//需要删除
	var _getData = function() {
		var startStamp = new Date().getTime();
		var data = {
			flag: 1,
			params: []
		};
		var tmp = {};
		tmp.efficiency = COM.getRandom(30, 99);
		tmp.asleep_time = '2017/08/01 21:00:00';
		tmp.awake_time = '2017/08/02 07:00:00';

		tmp.statics = [];
		var rate = 100;
		for(var i = 1; i < 5; i++) {
			tmp.statics.push({
				key: i,
				percent: COM.getRandom(200, 400)
			});
		}
		var stage = '66666688888888888886866666677777777777767768886666667767777777777677999666696969666666777777777777777667777776777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777776677777777777777777777777777777777777777777667777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777677777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777799999999999999996666667777799966666677777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777799999999999666666999969966666677777777777777777777777777777777777777777777777777777777777777777777777777777777777777677777777777777777777777777777777799666666777777777777777777777777777777666777999999';
		tmp.stage = stage;

		tmp.heart_rate = '';
		for(var i = 0; i < 500; i++) {
			var flag = COM.getRandom(10);
			if(i < 200) {
				tmp.heart_rate += (COM.getRandom(60, 65) + ',');
			} else if(i > 200 && i < 220) {
				tmp.heart_rate += ('0,');
			} else if(i > 300 && i < 330) {
				tmp.heart_rate += (COM.getRandom(100, 110) + ',');
			} else {
				tmp.heart_rate += (COM.getRandom(60, 70) + ',');
			}
		}
		tmp.id = '123';
		data.params.push(tmp);
		var endStamp = new Date().getTime();
		if(DEBUG) console.log('生成睡眠数据花费时间：' + (endStamp - startStamp) / 1000);
		return data;
	}

	return {
		start: _start
	}
})();