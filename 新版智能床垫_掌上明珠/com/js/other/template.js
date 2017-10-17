/**
 * template.js是对com.js中提供的公用方法进行测试
 */
var T1 = 1; //测试 addHN         创建头部和底部
var T2 = 2; //测试 createMarkBody创建蒙层及内容
var T3 = 3; //测试 createPopover 创建正常弹出菜单
var T7 = 7; //测试 createPopover 右上角弹出菜单
var T4 = 4; //测试 createLoading 创建正在加载
var T5 = 5; //测试 createQrcode  创建打开二维码扫描
var T6 = 6; //测试2-5方法重叠 
var T7 = 7; //测试addPullDownRefresh

var T_DEBUG = T4; //修改此值 测试对应方法

if(T_DEBUG === T1) {
	COM.addHN(true, "睡眠记录", CONST_MENU.home);
}

var _go2 = function() {
	var objInput = {
		id: "name",
		text: "姓名",
		type: "input",
		value: ""
	};
	var objRadio = {
		id: "sex",
		type: "radio",
		value: 0,
		child: [{
			text: "男",
			value: 1
		}, {
			text: "女",
			value: 0
		}]
	}
	var _cancelFuc = function() {
		console.log("取消点击函数已执行 可不传入");
	}
	var _sureFuc = function(obj) {
		console.log("返回值：" + JSON.stringify(obj));
		console.log("确定点击函数运行成功，需要自行关闭蒙层");
		COM.closeMark();
	}
	COM.createMarkBody([objRadio], _sureFuc, _cancelFuc);
}
if(T_DEBUG === T2) {
	COM.back();
	_go2();
}

var _go3 = function() {
	var btn = document.createElement("button");
	btn.setAttribute("class", "mui-btn mui-btn-danger");
	btn.innerHTML = "点击";
	btn.style.marginLeft = '200px';
	mui("#" + CONSTANT.comBody)[0].appendChild(btn);
	var _click = function() {
		var id = this.getAttribute('title'); //id存在title 不然有可能页面中id重复
		var text = this.innerText;
		console.log('id=' + id + ";text=" + text + '===>已点击 需要手动关闭蒙层');
		COM.closeMark();
	}

	var tmp = function(elem) {
		var list = [{
			id: "deviceSet",
			text: "设备控制",
			onclick: _click
		}, {
			id: "qrCode",
			text: "生成二维码",
			onclick: _click
		}];
		var p = COM.countPosition(elem, "fixed");
		var offset = {
			top: p.top + 'px',
			height: (43 * list.length + 14) + 'px',
			width: '140px',
			right: '10px'
		}
		console.log(p.arrowLeft);
		var arrow = {
			left: '10px'
		}

		COM.createPopover(list, offset, arrow);

	}
	tmp(btn);
	btn.onclick = function() {
		tmp(this);
	}
}

if(T_DEBUG === T3) {
	COM.back();
	_go3();
}
if(T_DEBUG === T4) {
	COM.back();
	COM.createLoading();
	setTimeout(function(){
		COM.createLoading('2秒后改变文字');
	},2000)
}
if(T_DEBUG === T5) {

	mui.plusReady(function() {
		COM.back();
		COM.createQrcode();
		//		DOC_ELEM.body.onclick = function(){
		//			COM.createQrcode();
		//		}
	});
}

if(T_DEBUG === T6) {
	COM.back();
	_go2();
	_go3();
	COM.createLoading();
	//	COM.createQrcode();
}

var _go7 = function() {
	var btn = document.createElement("button");
	btn.setAttribute("class", "mui-btn mui-btn-danger");
	btn.innerHTML = "点击";
	btn.style.marginLeft = '200px';
	mui("#" + CONSTANT.comBody)[0].appendChild(btn);
	var _click = function() {
		var id = this.getAttribute('id');
		var text = this.innerText;
		console.log('id=' + id + ";text=" + text + '===>已点击 需要手动关闭蒙层');
		COM.closeMark();
	}

	var tmp = function(elem) {
		var list = [{
			id: "deviceSet",
			text: "设备控制",
			onclick: _click
		}, {
			id: "qrCode",
			text: "生成二维码",
			onclick: _click
		}];
		var p = COM.countPosition(elem, "fixed");
		var offset = {
			top: p.top + 'px',
			height: (43 * list.length + 14) + 'px',
			width: '140px',
			right: '10px'
		}
		console.log(p.arrowLeft);
		var arrow = {
			left: '10px'
		}

		COM.createPopover(list, offset, arrow);

	}
	tmp(btn);
	btn.onclick = function() {
		tmp(this);
	}
}
if(T_DEBUG === T7) {
	var flag = true;
	NOW = YOUNG;
	COM.addHN(true, "睡眠记录", CONST_MENU.home, true);
	COM.addPullDownRefresh(function() {
		//this.endPullDownToRefresh();
	}, function() {
		var self = this;
		console.log('上拉刷新已触发');
		if(flag){
			setTimeout(function(){
				self.endPullUpToRefresh();
			})
		}else{
			self.endPullUpToRefresh();
		}
	});
}