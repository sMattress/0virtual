/**
 * com.js是存储整个项目提供的公用方法
 * 自定义的方法都挂在COM对象下面
 * 测试COM方法在template.html
 */

/**
 * 监听网络并提示
 */
//document.addEventListener("netchange", function() {
//	var nt = plus.networkinfo.getCurrentType();
//	switch(nt) { 
//		case plus.networkinfo.CONNECTION_ETHERNET:
//		case plus.networkinfo.CONNECTION_WIFI:
//			mui.toast("当前网络为WiFi");
//			break;
//		case plus.networkinfo.CONNECTION_CELL2G:
//		case plus.networkinfo.CONNECTION_CELL3G:
//		case plus.networkinfo.CONNECTION_CELL4G:
//			mui.toast("当前网络非WiFi");
//			break;
//		default:
//			mui.toast("当前没有网络");
//			break;
//	}
//}, false);

/**
 * 动态添加js或者css文件
 * @param {String} type 添加类型 支持css和js
 * @param {String} src 添加路径 
 * @param {Function} success 回调函数
 */
COM.addCssOrJs = function(type, src, success) {
	var elem = null;
	var head = document.head || document.getElementsByTagName('head')[0];
	if(type === 'css') {
		elem = document.createElement('link');
		elem.href = src;
		elem.onload = function() {
			success && success();
		}
	} else if(type === 'js') {
		elem = document.createElement("script");
		elem.type = "text/javascript";
		elem.src = src;
		elem.onload = function() {
			success && success();
		}
	} else {
		console.log('COM.addCssOrJs type未匹配');
	}
	elem && (head.appendChild(elem));
}

/**
 * 添加下拉刷新方法
 * @param {Object} down 下拉回调函数
 * @param {Object} up 上拉回调函数
 */
COM.addPullDownRefresh = function(down, up) {
	var url = '../../js/min/mui.pullToRefresh.js';
	if(NOW !== COMMON) {
		url = '../../../com/js/min/mui.pullToRefresh.js'
	}
	var tmp = {};
	if(down !== false) {
		tmp.down = {
			callback: function() {
				if(down) {
					down.call(this)
				} else {
					setTimeout(function() {
						location.href = location.href;
					}, 1000);
				}
			}
		}
	}
	if(up) {
		tmp.up = {
			callback: function() {
				up.call(this)
			}
		}
	}

	COM.addCssOrJs('js', url, function() {
		mui("#" + CONSTANT.bodyId).pullToRefresh(tmp);
	});
}

/**
 * 初始化一些值
 * 此方法暂时未使用
 */
COM.init = function() {
	if(DEBUG) console.log('COM.init 已执行');
	mui.init({
		swipeBack: true //启用右滑关闭功能
	});
}

/**
 * 绑定重新加载事件
 * @param {Function} success 执行函数 可不传
 */
COM.addReload = function(success) {
	if(DEBUG) console.log('==执行 COM.addReload');
	document.addEventListener('reload', function() {
		if(success) {
			success();
		} else {
			location.href = location.href;
		}
	});
}

/*
 * 监听回退按钮    flag为false时不执行正常的回退按钮
 */
COM.back = function(flag) {
	if(DEBUG) console.log('==执行 COM.back');
	var tag = 1;
	var oldBack = mui.back;
	if(typeof flag === 'function') {
		mui.back = flag;
		return;
	}

	mui.back = function() {
		console.log('返回事件已执行');
		if(DOC_ELEM.mark) { //如果当前有蒙层 返回按钮执行的是 关闭蒙层
			COM.closeMark();
			return;
		} else {
			console.log('mark 不存在');
		}
		if(flag !== false) {
			if(tag == 1) {
				mui.toast('再按一次退出应用');
				tag++;
				setTimeout(function() {
					tag = 1;
				}, 1000);
			} else if(tag == 2) {
				plus.runtime.quit();
			}
		} else {
			CONSTANT.oldBack();
		}
	}
}

/**
 * 打开一个窗口
 * @param {Object} id 窗口唯一标识
 * @param {Object} url 为窗口地址,如果为空则通过id + '.html'打开窗口
 * @param {Object} flag 打开前是否刷新 true刷新
 */
COM.openWindow = function(id, url, flag) {
	if(DEBUG) console.log('==执行 COM.openWindow;id====' + id);
	url = url || id + '.html';
	if(flag === true) {
		var tmp = plus.webview.getWebviewById(id);
		tmp && mui.fire(tmp, 'reload');
	}
	mui.openWindow({
		url: url,
		id: id,
		waiting: {
			show: true,
			title: '正在加载...'
		}
	});
}

/**
 * 动态添加顶部导航栏和底部选项卡
 * @param {Boolean || String} back 返回标识  传入false时不显示 , string时要显示并放置返回的文字
 * @param {String} title 中间显示内容
 * @param {Boolean} menu 右边菜单 true显示  数据在COMMON对象
 * @param {Boolean} nav 底部导航栏 true显示  数据在COMMON对象
 */
COM.addHN = function(back, title, menu, nav) {
	if(DEBUG) console.log('==执行 COM.addHN;参数====' + JSON.stringify(arguments));

	title = title || '未传递头部文字';

	//头部
	var header = COM.createElem('header', {
		'id': CONSTANT.headerId,
		'class': 'mui-bar mui-bar-nav'
	}, DOC_ELEM.body);

	COM.createElem('h1', {
		'class': 'mui-title'
	}, header).innerHTML = title;

	if(typeof back === 'string') { //如果是字符串 则显示带有文字的返回按钮
		var tmpBtn = COM.createElem('button', {
			'class': 'mui-action-back mui-btn mui-btn-blue mui-btn-link mui-btn-nav mui-pull-left'
		}, header);
		COM.createElem('span', {
			'class': 'mui-icon mui-icon-left-nav'
		}, tmpBtn).innerHTML = back;
		mui.init({
			swipeBack: true //启用右滑关闭功能
		});

	} else if(back === false) { //如果是false 则不显示返回按钮

	} else { //其他 仅仅显示返回按钮
		COM.createElem('a', {
			'class': 'mui-action-back mui-icon mui-icon-left-nav mui-pull-left'
		}, header);
		mui.init({
			swipeBack: true //启用右滑关闭功能
		});
	}
	if(menu === true) { //需要显示弹出菜单按钮
		var menuDoc = COM.createElem('a', {
			'class': 'mui-icon mui-icon-bars mui-pull-right'
		}, header);
		menuDoc.onclick = function() {
			var p = COM.countPosition(this, "fixed");
			var list = NOW.menu;
			var offset = {
				top: (p.top - 11) + 'px',
				height: (43 * list.length + 14) + 'px',
				width: '140px',
				right: '5px'
			}
			var arrow = {
				left: '109px'
			};
			COM.createPopover(list, offset, arrow);
		}
	} else if(typeof menu === 'object') {
		var buttonDoc = COM.createElem('button', {
			'title': menu.id || 'home',
			'class': 'mui-btn mui-btn-blue mui-btn-link mui-pull-right'
		}, header);
		buttonDoc.innerHTML = menu.text;
		buttonDoc.onclick = COMMON.menuClick;
	}

	if(nav === true) { //需要显示底部导航
		var id = NOW.nav.id; //当前显示的id
		var links = NOW.nav.links; //页面路径
		var ids = NOW.nav.ids; //页面对应的id
		var texts = NOW.nav.texts; //显示的文字
		var icons = NOW.nav.icons; //图标的class
		//底部
		var nav = COM.createElem('nav', {
			'id': CONSTANT.navId,
			'class': 'mui-bar mui-bar-tab'
		}, DOC_ELEM.body);

		var navHtml = '';
		for(var i = 0; i < links.length; i++) {
			if(ids[i] === id) {
				var hover = 'class="nav-hover"';
			} else {
				var hover = '';
			}
			navHtml += '<a ' + hover + ' href="' + links[i] + '" title="' + ids[i] +
				'"><span class="' + icons[i] + '"></span><span class="mui-tab-label">' + texts[i] + '</span></a>'
		}
		nav.innerHTML = navHtml;
		mui('#' + CONSTANT.navId).on('tap', 'a', function() {
			window.Y_MONITOR && Y_MONITOR.clear();
			var id = this.getAttribute('title');
			var href = '../' + this.getAttribute('href');
			console.log('正在打开 => ' + href + ' 页面');
			COM.openWindow(id, href, true);
		});
	}
	//COM.addPullDownRefresh();
}

/**
 * 动态创建蒙层
 */
COM.createMark = function(flag) {
	if(DOC_ELEM.mark) {
		DOC_ELEM.mark.markNum++;
		DOC_ELEM.mark.style.zIndex = 900 + DOC_ELEM.mark.markNum * 2 - 1;
	} else {
		DOC_ELEM.mark = COM.createElem('div', {
			'id': CONSTANT.markId
		}, DOC_ELEM.body);
		DOC_ELEM.mark.style.zIndex = 900;
		DOC_ELEM.mark.markNum = 1;
	}
	if(!CONSTANT.markFlag) {
		mui('#' + CONSTANT.bodyId).on('tap', '#' + CONSTANT.markId, function() {
			COM.closeMark();
		});
	}
}

/**
 * 创建一个蒙层的显示内容
 * @param {Object} list 是一个数组 包含的是需要创建的内容 
 * @param {Object} sureFuc 确定点击回调函数 可不传
 * @param {Object} cancelFuc 关闭点击回调函数 可不传
 */
COM.createMarkBody = function(list, sureFuc, cancelFuc) {
	if(DEBUG)console.log('====执行 COM.createMarkBody');
	COM.createMark();

	var markBody = null;
	DOC_ELEM.markBody = markBody = COM.createElem('div', {
		'id': CONSTANT.markBody
	}, DOC_ELEM.body);
	DOC_ELEM.markBody.style.zIndex = 900 + DOC_ELEM.mark.markNum * 2;
	DOC_ELEM.list.push('markBody');

	mui('#' + CONSTANT.markBody).on('tap', 'button', function() {
		var title = this.getAttribute('title');
		if(DEBUG)console.log('=按钮已点击 title====' + title);
		if(title === 'cancel') {
			COM.closeMark();
			cancelFuc && cancelFuc();
		} else if(title === 'sure') {
			var lis = DOC_ELEM.markBody.getElementsByTagName('li');
			var obj = [];
			mui.each(lis, function() {
				var id = this.getAttribute('id');
				var type = this.getAttribute('title');
				var tmp = {
					id: id,
					type: type
				};
				if(type === 'input') {
					tmp.value = this.getElementsByTagName('input')[0].value;
					obj.push(tmp);
				} else if(type === 'radio') {
					var imgs = this.getElementsByTagName('img');
					mui.each(imgs, function() {
						if(this.getAttribute('class') !== 'mui-hidden') { //当前选中的
							tmp.text = this.prev().innerText;
							tmp.value = this.parentNode.getAttribute('title');
						}
					});
					obj.push(tmp);
				}
			});
			sureFuc && sureFuc(obj);
		}
	});

	var ulDoc = document.createElement('ul');
	for(var i = 0; i < list.length; i++) {
		var obj = list[i];
		var liDoc = document.createElement('li');
		liDoc.setAttribute('title', obj.type);
		liDoc.setAttribute('id', obj.id);

		if(obj.type === 'input') { //输入框
			liDoc.setAttribute('class', 'li-input');
			liDoc.innerHTML = '<label>' + obj.text +
				'：</label><input type="text" value="' + obj.value + '"  placeholder="请输入' + obj.text + '" />';
		} else if(obj.type === 'radio') { //单选
			var child = obj.child;
			for(var j = 0; j < child.length; j++) {
				var childJ = child[j];
				var divDoc = document.createElement('div');
				divDoc.setAttribute('class', 'div-radio');
				divDoc.setAttribute('title', childJ.value);
				divDoc.setAttribute('data', 'hidden');
				var hidden = 'class="mui-hidden"';
				if(childJ.value == obj.value) {
					hidden = '';
					divDoc.setAttribute('data', 'show');
				}
				var src = '../../img/other/right.png';
				if(NOW !== COMMON){
					src = '../../../com/img/other/right.png';
				}
				divDoc.innerHTML = '<span>' + childJ.text + '</span><img ' + hidden + ' src="' + src + '" />';
				divDoc.onclick = function() {
					var data = this.getAttribute('data');
					console.log('data ====>' + data);
					if(data === 'hidden') {
						var siblings = this.siblings();
						this.setAttribute('data', 'show');
						this.getElementsByTagName('img')[0].setAttribute('class', '');
						for(var i = 0; i < siblings.length; i++) {
							siblings[i].getElementsByTagName('img')[0].setAttribute('class', 'mui-hidden');
							siblings[i].setAttribute('data', 'hidden');
						}
					}
				}
				liDoc.appendChild(divDoc);
			}
		} else {
			console.log('COM.createMark 发现未匹配的type');
		}
		ulDoc.appendChild(liDoc);
	}
	var liDoc = document.createElement('li');
	liDoc.setAttribute('class', 'li-btn');
	liDoc.innerHTML = '<button title="cancel" type="button" class="mui-btn mui-btn-danger">取消</button><button title="sure" type="button" class="mui-btn mui-btn-primary">确定</button>';
	ulDoc.appendChild(liDoc);

	markBody.appendChild(ulDoc);
	markBody.style.marginTop = -(markBody.clientHeight / 2) + 'px';
}

/**
 * 创建弹出菜单
 * @param {Object} list 显示列表
 * @param {Object} offset 元素的位置 必须传递
 * @param {Object} arrow 箭头的位置 必须传递
 */
COM.createPopover = function(list, offset, arrow) {
	console.log('COM.createPopover 已执行');
	COM.createMark();

	var popover = DOC_ELEM.popover = COM.createElem('div', {
		'class': 'mui-popover',
		'id': CONSTANT.popoverId
	}, DOC_ELEM.body);
	DOC_ELEM.popover.style.zIndex = 900 + DOC_ELEM.mark.markNum * 2;
	popover.setStyle(offset);
	DOC_ELEM.list.push('popover');

	var divArrow = COM.createElem('div', {
		'class': 'mui-popover-arrow'
	}, popover);
	divArrow.setStyle(arrow);

	var divWrapper = COM.createElem('div', {
		'class': 'mui-scroll-wrapper'
	}, popover);
	var divScroll = COM.createElem('div', {
		'class': 'mui-scroll'
	}, divWrapper);
	var ulView = COM.createElem('div', {
		'class': 'mui-table-view'
	}, divScroll);

	for(var i = 0; i < list.length; i++) {
		var obj = list[i];
		var id = obj.id;
		if(obj.icon) {
			var liDoc = COM.createElem('li', {
				'class': 'mui-table-view-cell com-popover-li', //如果有按钮 则添加按钮
				'title': id
			}, ulView);
			liDoc.innerHTML = '<span class="' + obj.icon + '"></span>' + obj.text + '';
		} else {
			var liDoc = COM.createElem('li', {
				'class': 'mui-table-view-cell',
				'title': id
			}, ulView);
			liDoc.innerHTML = obj.text;
		}
		liDoc.onclick = obj.onclick;
	}
}

/**
 * 创建正在加载
 */
COM.createLoading = function(txt) {
	//	console.log('COM.createLoading 已执行 如果想关闭 请执行COM.closeLoading');
	if(DOC_ELEM.loading) {
		DOC_ELEM.loading.getElementsByTagName('div')[0].innerHTML = txt || '正在获取数据...';
	} else {
		COM.createMark();
		txt = txt || '正在获取数据...';
		DOC_ELEM.loading = COM.createElem('div', {
			'id': CONSTANT.loadingId
		}, DOC_ELEM.body);
		DOC_ELEM.loading.innerHTML = '<span class="mui-spinner"></span><div>' + txt + '</div>';
		DOC_ELEM.loading.style.zIndex = 900 + DOC_ELEM.mark.markNum * 2;
		DOC_ELEM.list.push('loading');
	}
}
/**
 * 关闭正在加载
 */
COM.closeLoading = function() {
	COM.closeMark(true);
}
/**
 * 创建二维码窗口 并打开
 */
COM.createQrcode = function(success, error) {
	console.log('COM.createQrcode 已执行');
	COM.createMark();

	DOC_ELEM.qrcode = COM.createElem('div', {
		'id': CONSTANT.qrcodeId
	}, DOC_ELEM.body);
	DOC_ELEM.qrcode.style.zIndex = 900 + DOC_ELEM.mark.markNum * 2;
	DOC_ELEM.list.push('qrcode');

	//扫描成功的回调函数
	var _onMarked = function(type, result, file) {
		switch(type) {
			case plus.barcode.QR:
				type = 'QR';
				break;
			case plus.barcode.EAN13:
				type = 'EAN13';
				break;
			case plus.barcode.EAN8:
				type = 'EAN8';
				break;
			default:
				type = '其它' + type;
				break;
		}
		COM.closeMark();
		result = result.replace(/\n/g, '');
		if(DEBUG) console.log('扫描结果 === >' + result);
		success && success(type, result, file);
	};

	DOC_ELEM.qrcode.innerHTML = '<div id="' + CONSTANT.qrcodeId + '_box"></div><ul id="' + CONSTANT.qrcodeId + '_btn"><li title="cancle">取消</li><li title="camera">从相册中选择</li></ul>';
	mui('#' + CONSTANT.qrcodeId).on('tap', 'li', function() {
		if(DEBUG) console.log('二维码点击事件');
		var t = this.getAttribute('title');
		if(t === 'cancle') {
			COM.closeMark();
		} else {
			plus.gallery.pick(function(path) {
				plus.barcode.scan(path, _onMarked, function() {
					mui.toast('无法识别此图片');
					error && error();
				});
			}, function(err) {
				//plus.nativeUI.alert('Failed: ' + err.message);
			});
		}
	});

	//创建窗口
	DOC_ELEM.qrcodeScan = new plus.barcode.Barcode(CONSTANT.qrcodeId + '_box');
	//二维码扫描成功
	DOC_ELEM.qrcodeScan.onmarked = _onMarked;
	//扫描出错
	DOC_ELEM.qrcodeScan.onerror = function() {
		mui.toast('无法识别二维码');
		COM.closeMark();
		error && error();
	};
	DOC_ELEM.qrcodeScan.start({
		conserve: true
	});
}

/**
 * 隐藏蒙层
 */
COM.closeMark = function(flag) {
	var key = DOC_ELEM.list.pop();
	var _doMark = function() {
		if(--DOC_ELEM.mark.markNum === 0) {
			DOC_ELEM.mark.remove();
			DOC_ELEM.mark = null;
		} else {
			DOC_ELEM.mark.style.zIndex = 900 + DOC_ELEM.mark.markNum * 2 - 1;
		}
	}
	if(DEBUG) console.log("=====执行 COM.closeMark key====" + key);
	if(key) {
		if(key === "loading") { //是正在加载
			if(flag === true) {
				DOC_ELEM.loading.remove();
				DOC_ELEM.loading = null;
				_doMark();
			} else {
				if(DEBUG) console.log('=正在加载时返回按钮失效...');
				DOC_ELEM.list.push(key);
			}
		} else {
			if(key === "qrcode") { //是二维码
				DOC_ELEM.qrcodeScan.close();
				DOC_ELEM.qrcodeScan = null;
			}
			DOC_ELEM[key].remove();
			DOC_ELEM[key] = null;
			_doMark();
		}
	}
}
/**
 * 创建一个元素 并给元素设置属性
 * @param {Object} tag 标签类型
 * @param {Object} obj 属性集合
 * @param {Object} father 父级元素
 */
COM.createElem = function(tag, obj, father) {
	var tmp = document.createElement(tag);
	for(var key in obj) {
		tmp.setAttribute(key, obj[key]);
	}
	father && father.appendChild(tmp);
	return tmp;
}

/**
 * 计算元素位置
 */
COM.countPosition = function(elem, type) {
	var obj = {};
	if(type === 'fixed') {
		var offsetTop = elem.offsetTop;
		var offsetHeight = elem.offsetHeight;
		obj.top = offsetTop + offsetHeight + 13;
		if(DEBUG) console.log('offsetTop:' + offsetTop + ';offsetHeight:' + offsetHeight);
	}
	return obj;
}

/**
 * ajax统一请求方法
 * @param {Object} obj 是传递参数
 * obj.url 请求网址 没有http前缀时加上前缀(必须)
 * obj.type 请求类型 默认为 POST(可传)
 * obj.data 请求参数(不传则为{})
 * obj.success 成功回调函数 (可传)
 * obj.error 错误回调函数 (可传)
 * obj.async 异步标识 ,默认为true代表异步(可传)
 * obj.dataType 返回类型,默认为json (可传)
 * obj.cache 缓存标识,默认为false 不缓存(可传)
 * obj.otherArgs 其他参数,传递给成功回调函数 (可传)
 * obj.errorText 错误提示文字,错误回调函数中使用(可传)
 * obj.sign 签名标识,为false时不签名,默认要签名 (可传)
 * obj.timeout 超时设置,默认5秒(可传)
 */
COM.ajax = function(obj) {
	//处理参数
	var url = obj.url || ''; //处理网址 如果没有传入则不进行
	if(url.length === 0) {
		console.log('未传入url参数');
		return;
	}
	if(obj.type) {
		obj.type = obj.type.toUpperCase();
		var type = obj.type === 'GET' ? obj.type : 'POST';
	} else {
		var type = 'POST';
	}
	if(typeof(obj.data) === 'object') {
		var data = obj.data;
	} else {
		var data = {};
	}
	var success = obj.success; //成功回调函数
	var async = typeof(obj.async) === 'boolean' ? obj.async: true; //异步标识 默认异步
	var dataType = obj.dataType ? obj.dataType : 'json'; //传递回来的参数类型 默认json
	var error = obj.error; //发生错误时的回调函数
	var cache = typeof(obj.cache) === 'boolean' ? obj.cache : false; //缓存标识 默认不缓存
	var otherArgs = obj.otherArgs; //其他参数 传回到回调函数
	var errorText = obj.errorText || ''; //错误提示文字 在发生错误时提示
	var sign = obj.sign; //计算机前面标识 为false不签名  其他时候要签名
	var timeout = obj.timeout || 5000; //超时设置 默认5秒
	if(sign !== false) { //开始生成签名
		var timestamp = Math.floor(new Date().getTime() / 1000);
		var token = COM.getStorage(STORAGE.token);
		var account = COM.getStorage(STORAGE.account);
		var sign = CryptoJS.MD5(
			url + '?account=' + account +
			'&timestamp=' + timestamp + '&token=' + token) + '';
		// 生成安全URL
		data.account = account;
		data.token = token;
		data.timestamp = timestamp;
		data.sign = sign;
	}
	if(!url.startsWith('http')) {
		url = URL.https + url; //没有网址前缀 加上前缀
	}
	if(DEBUG) console.log('====请求网址：' + url);
	if(DEBUG) console.log('====请求数据：' + JSON.stringify(data));
	try {
		mui.ajax(url, {
			type: type,
			data: data,
			async: async,
			dataType: dataType,
			cache: cache,
			timeout: timeout,
			success: function(data, textStatus, xhr) {
				if(DEBUG) console.log('=返回数据：'+JSON.stringify(data));
				if(!(data && data.flag)) {
					if(DEBUG) console.log('||||||||||'+ERR_TEXT[data.err_code]); 
					if(data.err_code != 64) {
						mui.toast(ERR_TEXT[data.err_code]);
					}
					if(data.err_code == 2 || data.err_code == 17) {
						if(NOW === COMMON) {
							COM.openWindow('LR');
						} else {
							COM.openWindow('LR', '../../../com/html/other/LR.html');
						}
						return;
					}
				} else {
					COM.closeLoading();
				}
				success && success(data, otherArgs, obj);
			},
			error: function(xhr, type, errorThrown) {
				//console.log('获取网址：' + url + ' 失败');
				//console.log('错误原因:' + ERR_OBJ[type]);
				COM.closeLoading();
				if(DEBUG) console.log('==== COM.ajax请求出错;type===>' + type); 
				if(type === 'timeout') {
					if(!AlertFlag){
						AlertFlag = true;
						mui.alert('请求超时,请确认网络是否可用', '提示' ,function(){
							AlertFlag = false;
						});
					}
				} else if(type === 'abort') {
					if(!AlertFlag){
						AlertFlag = true;
						mui.alert('无法连接服务器,请确认是否已经连入网络', '提示' ,function(){
							AlertFlag = false;
						});
					}
				} else {
					errorText && mui.toast(errorText);
				}
				error && error(xhr, type, errorThrown, obj);
			}
		});
	} catch(e) {
		console.log(e);
	}
}

/**
 * 图片上传 此方法需要修改
 * @param {Object} imgId
 */
COM.imgUpload = function(imgId) {
	plus.nativeUI.actionSheet({
		cancel: '取消',
		buttons: [{
				title: '拍照'
			},
			{
				title: '从相册中选择'
			}
		]
	}, function(e) { //1 是拍照  2 从相册中选择  
		switch(e.index) {
			case 1:
				appendByCamera();
				break;
			case 2:
				appendByGallery();
				break;
		}
	});
	// 拍照添加文件
	var appendByCamera = function() {
		plus.camera.getCamera().captureImage(function(e) {
			plus.io.resolveLocalFileSystemURL(e, function(entry) {
				var path = entry.toLocalURL();
				d[gId](imgId).src = path;
				COM.setLocalStorage(imgId, path);
			}, function(e) {
				mui.toast('读取拍照文件错误：' + e.message);
			});

		});
	}
	// 从相册添加文件
	var appendByGallery = function() {
		plus.gallery.pick(function(path) {
			d[gId](imgId).src = path;
			COM.setLocalStorage(imgId, path);
		});
	}
}
/**
 * 本地缓存的方法  这样方便以后可能会对数据进行处理而编写
 */
COM.clearStorage = function() { //清除缓存
	for(var key in STORAGE) {
		plus.storage.removeItem(key);
	}
	plus.storage.clear();
}
COM.setStorage = function(key, value) { //设置缓存
	if(DEBUG) {
		if(!STORAGE[key]) {
			console.log('缓存' + key + '时,STORAGE中没有此值，禁止缓存，请添加后在缓存。');
			return;
		}
	} else {
		//console.log('当前未非测试环境 请删除此代码')
	}
	if(window.plus) {
		plus.storage.setItem(key, value + '');
	} else {
		console.log('设置缓存失败');
	}
}
COM.getStorage = function(key) { //获取缓存
	if(window.plus) {
		return plus.storage.getItem(key);
	} else {
		return '{}';
	}
}
/**
 * 获取随机数
 * @param {Object} min 最小值
 * @param {Object} max 最大值 不传递时,以min为最大值
 */
COM.getRandom = function(min, max) {
	var base = 1000;
	var maxStr = max + '';
	if(maxStr.length > 3) {
		for(var i = 4; i <= maxStr.length; i++) {
			base *= 10;
		}
	}
	if(max) {
		var t = parseInt((Math.random() * base)) % (max - min + 1);
		return min + t;
	} else {
		max = min;
		return parseInt((Math.random() * base)) % (max + 1);
	}
}

/********************* 给内置对象添加方法  ***************************/
if(typeof Array.prototype.max === 'undefined') {
	Object.defineProperty(Array.prototype, "max", {
		value: function() {
			return Math.max.apply({}, this);
		}
	});
} else {
	console.log('Array.prototype.max 函数已存在');
}
if(typeof Array.prototype.min === 'undefined') {
	Object.defineProperty(Array.prototype, "min", {
		value: function() {
			return Math.min.apply({}, this);
		}
	});
} else {
	console.log('Array.prototype.min  函数已存在');
}

/**
 * 日期格式化
 * @param {Object} format yyyy-MM-dd hh:mm:ss
 */
Date.prototype.format = function(format) {
	var o = {
		'M+': this.getMonth() + 1, // month
		'd+': this.getDate(), // day
		'h+': this.getHours(), // hour
		'm+': this.getMinutes(), // minute
		's+': this.getSeconds(), // second
		'q+': Math.floor((this.getMonth() + 3) / 3), // quarter
		'S': this.getMilliseconds()
	}
	if(/(y+)/.test(format)) {
		format = format.replace(RegExp.$1, (this.getFullYear() + '')
			.substr(4 - RegExp.$1.length));
	}
	for(var k in o) {
		if(new RegExp('(' + k + ')').test(format)) {
			format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] :
				('00' + o[k]).substr(('' + o[k]).length));
		}
	}
	return format;
}
/**
 * 获取元素的所有兄弟元素
 */
if(typeof HTMLElement.prototype.siblings === 'undefined') {
	HTMLElement.prototype.siblings = function() {
		var a = [];
		var p = this.parentNode.children;
		for(var i = 0; i < p.length; i++) {
			if(p[i] !== this) {
				a.push(p[i]);
			}
		}
		return a;
	}
} else {
	console.log('HTMLElement.prototype.siblings 函数已存在');
}

/**
 * 给document 元素添加获取前一个兄弟节点元素
 */
if(typeof HTMLElement.prototype.prev === 'undefined') {
	HTMLElement.prototype.prev = function() {
		var p = this.parentNode.children;
		for(var i = 0; i < p.length; i++) {
			if(p[i] === this && i !== 0) {
				return p[i - 1];
			}
		}
		return null;
	}
} else {
	console.log('HTMLElement.prototype.prev 函数已存在');
}

/**
 * 给document 元素添加获取下一个兄弟节点元素
 */
if(typeof HTMLElement.prototype.next === 'undefined') {
	HTMLElement.prototype.next = function() {
		var p = this.parentNode.children;
		for(var i = 0; i < p.length; i++) {
			if(p[i] === this && i !== p.length - 1) {
				return p[i + 1];
			}
		}
		return null;
	}
} else {
	console.log('HTMLElement.prototype.next 函数已存在');
}
/**
 * 循环设置元素样式
 */
if(typeof HTMLElement.prototype.setStyle === 'undefined') {
	HTMLElement.prototype.setStyle = function(obj) {
		for(var key in obj) {
			this.style[key] = obj[key];
		}
	}
} else {
	console.log('HTMLElement.prototype.setStyle 函数已存在');
}
/**
 * 绑定remove函数
 */
if(typeof HTMLElement.prototype.remove === 'undefined') {
	HTMLElement.prototype.remove = function(obj) {
		this.parentNode.removeChild(this);
	}
} else {
	//	console.log('HTMLElement.prototype.remove 函数已存在');
}

/**
 * 字符串处理
 */
String.prototype.replaceAll = function(s1, s2) {
	return this.replace(new RegExp(s1, 'gm'), s2);
}
String.prototype.isEmpty = function() {
	return /^\s*$/.test(this);
}
String.prototype.trim = function() {
	return this.replace(/(^\s*)|(\s*$)/g, '');
}
String.prototype.ltrim = function() {
	return this.replace(/(^\s*)/g, '');
}
String.prototype.rtrim = function() {
	return this.replace(/(\s*$)/g, '');
}
if(typeof(String.prototype.startsWith) !== 'function') {
	String.prototype.startsWith = function(str) {
		var reg = new RegExp('^' + str);
		return reg.test(this);
	}
}
if(typeof(String.prototype.endsWith) !== 'function') {
	String.prototype.endsWith = function(str) {
		var reg = new RegExp(str + '$');
		return reg.test(this);
	}
}