/**
 * 睡眠记录页面
 * Y_代表的是young文件夹
 */
window.Y_RECORD = (function() {
	var _deviceCode = null; //当前设备编号

	var _searchData = { //查询提交的参数
		device_id: '设备编号',
		start_time: '开始时间',
		end_time: '结束时间'
	};
	var _searchTimeStamp = null; //当前查询的时间戳
	var _oneDayTimeStamp = 1 * 24 * 60 * 60 * 1000; //一天的时间戳

	var _weekTxtArr = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
	var _xAxis = []; //存储查询周的一周日期 X轴
	var _yAxis = ['12:00','14:00', '16:00','18:00', '20:00','22:00', '00:00','02:00', '04:00','06:00', '08:00','10:00', '12:00']; //每天时间
	var _colorArr = ['c35652', '9dc6b3', '77a9ae', 'd1917b', '51626e', '000000'];

	var _title = ''; //显示记录的标题
	var _nowWeek = 0; //为0时代表的是当前周 负的代表的是已当前周往前的周数
	var _barClickFlag = false; //柱状图点击事件绑定

	var _barData = null; //柱状图数据  addReload的时候调用
	var _efficiencyPieChart = null; //睡眠效率对象
	var _heartRatePieChart = null; //睡眠效率对象

	var _downElem = null; //下拉元素
	//页面开始函数
	var _start = function() {
		_init();
		_bind();
		_getSleepEfficiency();
	}
	//初始化部分数据  需要修改
	var _init = function() {
		var deviceObj = JSON.parse(COM.getStorage(STORAGE.device) || '{}');
		COM.addHN(false, '“' + deviceObj.alias + '”的睡眠记录', CONST_MENU.home, true);
		COM.back();
		COM.addReload(function() {
			var deviceObj = JSON.parse(COM.getStorage(STORAGE.device) || '{}');
			if(_deviceCode === deviceObj.device_name) {
				console.log('走这儿');
				_barData && _efficiencyPieChart.setOption(_barData, true);
			} else {
				console.log('走这儿-1');
				_downElem = null;
				mui('#' + CONSTANT.headerId + ' h1')[0].innerHTML = '“' + deviceObj.alias + '”的睡眠记录';
				_searchTimeStamp = new Date().getTime();
				_searchData.device_id = _deviceCode = Y_COM.debug_device || deviceObj.device_name;
				_getSleepEfficiency();
			}
		});
		//初始化 _searchData
		_searchData.device_id = _deviceCode = Y_COM.debug_device || deviceObj.device_name;//此处需要删除

		_efficiencyPieChart = echarts.init(mui('#yr_efficiency')[0]);
		//		_heartRatePieChart = echarts.init(mui('#yr_heart_rate')[0]);
		_searchTimeStamp = new Date().getTime();
	}

	//绑定点击事件
	var _bind = function() {
		mui('#yr_search').on('tap', 'button', function() {
			var method = this.getAttribute('method');
			if(method === 'prev') {
				_searchTimeStamp -= 7 * _oneDayTimeStamp;
				_nowWeek--;
			} else if(method === 'now') {
				if(_nowWeek === 0) { //如果是当前周 则不处理
					return;
				}
				_nowWeek = 0;
				_searchTimeStamp = new Date().getTime();
			} else { //需要修改

				//				if(_nowWeek === 0) { //如果是当前周 则没有下一周  
				//					mui.toast('下一周的睡眠数据我也不知道呢(￣.￣)');
				//					return;
				//				}
				_nowWeek++;
				_searchTimeStamp += 7 * _oneDayTimeStamp;
			}
			_getSleepEfficiency();
		});
		mui('#com_body').pullToRefresh({
			down: {
				callback: function() {
					_downElem = this;
					_getSleepEfficiency();
				}
			}
		});
	}
	//创建查询参数 需要值_searchTimeStamp  需要修改
	var _createSearchData = function() {
//		_searchTimeStamp = new Date('2017/09/03 16:00:00');

		var tmpDate = new Date(_searchTimeStamp);
		var weekIndex = tmpDate.getDay(); //获取星期几的值 星期日=0 星期六=6
		if(weekIndex === 0){
			_searchTimeStamp -= _oneDayTimeStamp;
			var tmpDate = new Date(_searchTimeStamp);
			var weekIndex = tmpDate.getDay(); //获取星期几的值 星期日=0 星期六=6
		}
		_xAxis = []
		for(var i = 0; i < 7; i++) {
			var tmpTimeStamp = _searchTimeStamp - (weekIndex - i) * _oneDayTimeStamp;
			_xAxis.push(new Date(tmpTimeStamp).format('dd'));
			if(i === 0) { //查询开始时间
				_title = new Date(tmpTimeStamp).format('MM月dd号');
				_searchData.start_time = new Date(tmpTimeStamp).format('yyyy/MM/dd') + ' 12:00:00';
			}
			if(i === 6) { //查询结束时间
				_title += ' 至 ' + new Date(tmpTimeStamp).format('MM月dd号');
				_searchData.end_time = new Date(tmpTimeStamp + _oneDayTimeStamp).format('yyyy/MM/dd') + ' 12:00:00';
			}
		}
		mui('#yr_title')[0].innerHTML = _title;
	}
	//获取睡眠效率 需要值_searchData  需要修改
	var _getSleepEfficiency = function() {
		_createSearchData();

		var ajaxObj = {
			url: URL.getSleepEfficiency,
			data: _searchData,
			type: 'GET',
			sign: false,
			success: function(data) {
				_barData = null;
				if(data && data.flag) {
					var series = _anasSleepEfficiencyData(data.params);
					if(series) {
						_showSleepEfficiency(series.efficiency);
					} else {
						_efficiencyPieChart.clear();
					}
					if(_downElem) {
						_downElem.endPullDownToRefresh();
						_downElem = null;
					}
					//					_showHeartRate(series.heartRate);
				} else {
					mui.toast('获取睡眠记录失败啦');
				}
			},
			error:function(){
				_barData = null;
			}
		}
		if(DEBUG) console.log('_getSleepEfficiency开始请求数据');
		COM.ajax(ajaxObj);
		//		ajaxObj.success(_getEfficiencyData());
	}
	//解析获取到的睡眠效率数据   需要修改
	var _anasSleepEfficiencyData = function(list) {
		//第一步简析  将睡眠数据按照号数存储
		var keyObj = {}; //根据日期 存储数据
		if(DEBUG) console.log(JSON.stringify(list));
		if(list.length === 0) {
			mui('#yrb_none')[0].innerHTML = _title + '没有睡眠数据，<br><span style="color:red;">检查您的查询日期是否正确。</span>';
			mui('#yrb_none')[0].style.display = 'block';
			return;
		} else {
			mui('#yrb_none')[0].style.display = 'none';
		}
		for(var i = 0; i < list.length; i++) {
			var obj = list[i];
			var asleep_time = obj.asleep_time;
			var dayStartStamp = new Date(asleep_time.substr(0, 10) + ' 12:00:00').getTime();
			var key = null;
			if(dayStartStamp > new Date(asleep_time).getTime()) {
				key = new Date(dayStartStamp - _oneDayTimeStamp).format('dd');
			} else {
				key = asleep_time.substr(8, 2);
			}
			if(keyObj[key]) {
				keyObj[key].push(obj);
			} else {
				keyObj[key] = [obj];
			}
		}
		if(DEBUG) console.log(JSON.stringify(keyObj));
		//第二步解析  每天睡觉次数的最大值
		var maxSleepNum = 0;
		for(var key in keyObj) {
			if(keyObj[key].length > maxSleepNum) {
				maxSleepNum = keyObj[key].length;
			}
			for(var i = 0; i < _xAxis.length; i++) {
				if(_xAxis[i] === key) {
					keyObj[key].xAxisIndex = i;
					break;
				}
			}
		}
		//第三步解析 生成echarts中的series中的每个data
		var series = _createSeries(maxSleepNum);
		var efficiencySeries = series.efficiency;
		//		var heartRateSeries = series.heartRate;
		for(var key in keyObj) {
			var keyArr = keyObj[key];
			var index = keyArr.xAxisIndex;

			var start = keyArr[0].asleep_time.substr(0, 8) + _xAxis[index] + ' 12:00:00';
			var startTimeStamp = new Date(start).getTime();
			var oldAwakeStamp = startTimeStamp;
			for(var i = 0; i < keyArr.length; i++) {
				var asleep_time = keyArr[i].asleep_time;
				var awake_time = keyArr[i].awake_time;
				if(DEBUG) {
					if((asleep_time + awake_time).indexOf('-') !== -1) {
						throw '返回回来的时间带有-,ios不能解析带有-格式的日期字符串,字符串：' + (asleep_time + awake_time);
					}
				}
				//处理睡眠效率
				asleepTimeStamp = new Date(asleep_time).getTime();
				awakeTimeStamp = new Date(awake_time).getTime();
				var tmpAsleep = efficiencySeries[i * 2].data[index] = _getYValue(asleepTimeStamp - oldAwakeStamp);
				var tmpAwake = _getYValue(awakeTimeStamp - oldAwakeStamp) - tmpAsleep;
				if(isNaN(tmpAsleep) || isNaN(tmpAwake)) { //过滤掉没有开始时间或者结束时间的
					continue;
				}
				if(DEBUG) console.log('asleep_time===>' + asleep_time + ';awake_time===>' + awake_time);
				if(DEBUG) console.log('tmpAsleep===>' + tmpAsleep + ';tmpAwake===>' + tmpAwake);
				if(DEBUG) console.log('id===>' + keyArr[i].id);

				var itemStyle = _getItemStyle(keyArr[i].efficiency);
				efficiencySeries[i * 2 + 1].data[index] = {
					id: keyArr[i].id,
					efficiency: keyArr[i].efficiency,
					asleep_time: start.substr(0, 10),
					//					itemStyle:itemStyle,
					value: tmpAwake
				};

				oldAwakeStamp = awakeTimeStamp;
				//处理心率
				//				var tmpHeartRate = heartRateSeries[i].data[index];
				//				var heart_rate = keyArr[i].heart_rate;
				//				tmpHeartRate[1] = heart_rate[1]; //最小值
				//				tmpHeartRate[2] = heart_rate[2]; //平均值
				//				tmpHeartRate[3] = heart_rate[0]; //最大值
			}
		}
		if(DEBUG) console.log(JSON.stringify(series));
		return series;
	}

	/**
	 * 创建睡眠效率和心率的Series数据
	 * @param {Object} max 最大有多少组
	 */
	var _createSeries = function(max) {
		var efficiencyArr = []; //睡眠效率的数据
		var heartRateSArr = []; //心率的数据
		for(var i = 0; i < max; i++) {
			var tColor = '#' + _colorArr[0];
			efficiencyArr[i * 2] = _createEfficiencyBar('空白部分', 'rgba(0,0,0,0)');
			efficiencyArr[i * 2 + 1] = _createEfficiencyBar('显示部分', tColor, true);
			//			heartRateSArr[i] = _createHeartRateData(tColor);
		}
		return {
			efficiency: efficiencyArr,
			//			heartRate: heartRateSArr
		}
	}
	/**
	 * 通过睡眠效率获取显示颜色
	 * @param {Object} efficiency
	 */
	var _getItemStyle = function(efficiency) {
		var color = '';
		if(efficiency > 90) {
			color = _colorArr[0];
		} else if(efficiency > 80) {
			color = _colorArr[1];
		} else if(efficiency > 70) {
			color = _colorArr[2];
		} else if(efficiency > 60) {
			color = _colorArr[3];
		} else {
			color = _colorArr[4];
		}
		color = '#' + color;
		return {
			normal: {
				barBorderColor: color,
				color: color
			},
			emphasis: {
				barBorderColor: color,
				color: color
			}
		}
	}

	/**
	 * 创建睡眠效率柱状图数据初始化
	 * @param {Object} name 名称
	 * @param {Object} color 颜色
	 * @param {Object} labelFlag 是否显示label
	 */
	var _createEfficiencyBar = function(name, color, labelFlag) {
		var obj = {};
		obj.name = name;
		obj.type = 'bar',
			obj.stack = 'stack';
		obj.itemStyle = {
			normal: {
				barBorderColor: color,
				color: color
			},
			emphasis: {
				barBorderColor: color,
				color: color
			}
		};
		obj.data = [null, null, null, null, null, null, null];
		if(labelFlag) {
			obj.label = {
				normal: {
					show: true,
					formatter: function(obj) {
						return(obj.data.efficiency || 0) + '%';
					}
				}
			};
		}
		return obj;
	}
	/**
	 * 创建心率箱线图初始化数据
	 * @param {Object} color 颜色
	 */
	var _createHeartRateData = function(color) {
		var obj = {};
		obj.name = '箱线图';
		obj.type = 'boxplot',
			obj.stack = 'stack';
		//		obj.itemStyle = {
		//			normal: {
		//				color: color
		//			},
		//			emphasis: {
		//				color: color
		//			}
		//		};
		obj.data = [];
		for(var i = 0; i < 7; i++) {
			obj.data.push([30, 0, 0, 0, 200]);
		}
		return obj;
	}

	//每天睡觉和起床的时间戳，映射为Y轴的值
	var _getYValue = function(timeStamp, id, efficiency) {
		return parseFloat((timeStamp / _oneDayTimeStamp).toFixed(2)) * (_yAxis.length-1) * 100;
	}

	//显示睡眠效率  需要修改
	var _showSleepEfficiency = function(series) {
		for(var i = 0; i < _xAxis.length; i++) {
			_xAxis[i] = _weekTxtArr[i] + '\n(' + _xAxis[i] + '号)';
		}
		_barData = {
			title: {
				text: '睡眠效率',
				padding: [15, 0, 0, 0],
				textStyle: {
					color: '#000',
					fontFamily: 'Helvetica Neue',
					fontSize: 18
				}
			},
			grid: {
				left: '3%',
				right: '4%',
				bottom: '3%',
				containLabel: true
			},
			xAxis: {
				type: 'category',
				axisTick: {
					show: false,
					interval: 0
				},
				axisLabel: {
					interval: 0
				},
				splitLine: {
					show: true,
					lineStyle: {
						type: 'dashed'
					}
				},
				axisLine: {
					show: false
				},
				data: _xAxis
			},
			yAxis: {
				type: 'value',
				splitLine: {
					show: true,
					lineStyle: {
						type: 'dashed'
					}
				},
				min: 0,
				max: (_yAxis.length-1) * 100,
				splitNumber: _yAxis.length-1,
				axisLabel: {
					formatter: function(value, index) {
						return _yAxis[index];
					}
				},
				boundaryGap: false
			},
			series: series
		};

		_efficiencyPieChart.setOption(_barData, true);
		if(!_barClickFlag) {
			_barClickFlag = true;
			_efficiencyPieChart.on('click', _barClick);
		}
	}
	/**
	 * 显示心率箱线图 暂时不用
	 * @param {Object} series
	 */
	var _showHeartRate = function(series) {
		var option = {
			title: {
				text: '心率',
			},
			grid: {
				left: '3%',
				right: '4%',
				bottom: '3%',
				containLabel: true
			},
			xAxis: {
				type: 'category',
				axisTick: {
					show: false,
					interval: 0
				},
				axisLabel: {
					interval: 0
				},
				splitLine: {
					show: true,
					lineStyle: {
						type: 'dashed'
					}
				},
				axisLine: {
					show: false
				},
				data: _xAxis
			},
			yAxis: {
				type: 'value',
				splitLine: {
					show: true,
					lineStyle: {
						type: 'dashed'
					}
				},
				boundaryGap: false
			},
			series: series
		};
		//		console.log(option);
		_heartRatePieChart.setOption(option, true);
		if(!_barClickFlag) {
			_barClickFlag = true;
			_efficiencyPieChart.on('click', _barClick);
			_heartRatePieChart.on('click', _barClick);
		}
	}

	//柱状图点击事件
	var _barClick = function(serie) {
		if(serie.data.id) {
			COM.setStorage(STORAGE.oneSleepId, serie.data.id + '');
			COM.openWindow('young_record_detaile', undefined, true);
		}
	}

	//获取睡眠效率数据  需要删除
	var _getEfficiencyData = function(num) {
		var data = {
			flag: 1,
			params: []
		};
		num = num || 2;
		var min = new Date(_searchData.start_time.replaceAll('-', '/')).getTime();
		var max = new Date(_searchData.end_time.replaceAll('-', '/')).getTime();
		var len = 7 * num;
		var startArr = [];
		var endArr = [];
		for(var i = 0; i < len; i++) {
			var tmp = {};
			var t = parseInt(i / num);
			var end = COM.getRandom(3, 6);
			var tmpR = 2;
			if(i % 2 === 1) {
				var start = tmpR + startArr + endArr + 1;
				var tS = COM.getRandom(start, start + tmpR);
				var end = COM.getRandom(3, 6);
			} else {
				var tS = COM.getRandom(tmpR);
				startArr = tS;
				endArr = end;
			}

			var tMin = min + (t * 24 + tS) * 60 * 60 * 1000;
			var tMax = min + (t * 24 + tS + end) * 60 * 60 * 1000;
			tmp.asleep_time = new Date(tMin).format('yyyy/MM/dd hh:mm:ss');
			tmp.awake_time = new Date(tMax).format('yyyy/MM/dd hh:mm:ss');
			tmp.efficiency = COM.getRandom(10, 99);
			tmp.heart_rate = [COM.getRandom(80, 90), COM.getRandom(40, 50), COM.getRandom(60, 70)];
			tmp.breath_rate = [COM.getRandom(80, 90), COM.getRandom(40, 50), COM.getRandom(60, 70)];
			tmp.id = i;
			data.params.push(tmp);
		}
		console.log(data.params);
		return data;
	}

	return {
		start: _start
	}
})();