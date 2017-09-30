/**
 * data.js是存储整个项目需要的配置参数
 */

/**
 * 提供公用方法 在com.js
 */
window.COM = {};

/**
 * 临时存储中转对象
 */
window.TRANSFER = {};

/**
 * home.html 主页的方法 在home.js
 */
window.HOME = {};

/**
 * 注册和登录方法 在LR.js
 */
window.LR = {};

/**
 * 设备管理 方法 在device.js
 */
window.DEVICE = {};

/**
 * 个人信息 方法 在self.js
 */
window.SELF = {};

/**
 * 记录当前项目  是否为调试   ture代表是
 */
window.DEBUG = false;

/**
 * 存储当前版本数据
 */
window.VERSION = {}; //版本数据
VERSION.value = 20; //版本值 每次确定版本时都将增加1
VERSION.name = '1.0.0'; //版本号 
VERSION.liliao = '2.0';//理疗的版本号

/**
 * 存储缓存到本地的key 没在此元素的缓存键值禁止缓存
 */
window.STORAGE = {
	imgId: "imgId", //用户头像id
	account: 'account', //用户账户(手机号)
	token: 'token', //用户注册码
	device:'device',//当前缓存的设备信息
	deviceList: 'deviceList', //设备列表
	name: 'name', //用户姓名
	sex: 'sex', //用户性别  汉字
	sex_v: 'sex_v', //用户性别 标识
	birthday: 'birthday', //用户出生
	y_record_detaile:'y_record_detaile',//睡眠记录详情 缓存
	net_work_id:'net_work_id',//缓存已连接的wifi设备 添加新设备完成后还原
	liliaoNotUse:'liliaoNotUse',//缓存是否可以使用理疗
	blueAddress:'blueAddress',//缓存蓝牙mac地址
};

/**
 * 存储所有需求请求数据的网址
 */
window.URL = {};
//URL.https = 'http://www.lesmarthome.com'; //请求网址前缀
URL.https = 'http://www.lesmarthome.com'; //请求网址前缀
URL.loginCode = '/v1/user/code'; //登录接口
URL.login = '/v1/user/login'; //登录校验
URL.register = '/v1/user/register'; //注册接口
URL.bindDevice = '/v1/user/device/bind'; //绑定设备接口
URL.updateDevice = '/v1/user/device/update'; //设备重命名
URL.getDeivceList = '/v1/user/device/list'; //获取设备列表 在device.js中使用
URL.unbindDevice = '/v1/user/device/unbind'; //解除绑定
URL.userBaseInfo = '/v1/user/get/base_info'; //获取用户基本信息
URL.appUpdate = '/v1/sys/apps/update'; //app更新检查
URL.userUpdate = '/v1/user/update/base_info'; //用户信息更新接口
URL.socket = 'ws://www.lesmarthome.com:4321';//socket的服务地址
/**
 * 存储一些静态变量 方便统一使用
 */
window.CONSTANT = {};
CONSTANT.oldBack = mui.back;
CONSTANT.markId = 'com_mark'; //蒙层的id 此值请勿改变 与css挂钩
CONSTANT.markBody = 'com_mark_body'; //蒙层中的 显示内容id  此值请勿改变 与css挂钩
CONSTANT.markFlag = false;//标识mark是否创建过
CONSTANT.bodyId = 'body_id'; //每个页面的 body元素的id 此值请勿改变 与css挂钩
CONSTANT.comBody = 'com_body'; //每个页面 放置内容的元素id 此值请勿改变 与css挂钩
CONSTANT.headerId = 'com_header'; //头部元素的显示 id 
CONSTANT.navId = 'com_nav'; //底部元素的导航id
CONSTANT.popoverId = 'com_popover'; //弹出菜单 id 此值请勿改变 与css挂钩
CONSTANT.loadingId = 'com_loading'; //正在加载 id 此值请勿改变 与css挂钩
CONSTANT.qrcodeId = 'com_qrcode'; //二维码  id 此值请勿改变 与css挂钩
CONSTANT.confirmBtn = ['取消','确认']; //mui.confirm的按钮
CONSTANT.confirmSure = 1; //此值对应上方“确认”的下标
CONSTANT.ssid = 'lesmarthome';//硬件wifi名
//CONSTANT.ssid = 'test1';//硬件wifi名
CONSTANT.pwd = 'lxzj2017';//硬件wifi密码
CONSTANT.blueName = 'USR-BLE101';//蓝牙版的连接名
CONSTANT.bluePwd = '000000';//蓝牙版的配对密码

/**
 * 缓存一些document 元素
 */
window.DOC_ELEM = {};
DOC_ELEM.mark = null; //蒙层
DOC_ELEM.markBody = null; //蒙层显示内容
DOC_ELEM.popover = null; //弹出菜单元素
DOC_ELEM.loading = null; //正在加载元素
DOC_ELEM.qrcode = null; //二维码元素
DOC_ELEM.qrcodeScan = null; //二维码 扫描框
DOC_ELEM.list = []; //数组 存储的上面元素的创建顺序
DOC_ELEM.body = mui('#' + CONSTANT.bodyId)[0]; //获取body元素

/**
 * 错误提示 根据err_code取值
 */
window.ERR_TEXT = {
	0: '无错误',
	1: '缺失必要参数',
	2: '登录已失效',
	16: '账号已存在',
	17: '账号不存在',
	18: '设备已存在',
	19: '设备不存在',
	20: '账号格式错误',
	21: '密码格式错误',
	22: '密码无效',
	23: '性别取值超出范围',
	24: '生日取值超出范围',
	25: '图像连接格式错误',
	26: '第三方平台已绑定',
	27: '无效的第三方平台',
	28: '错误的第三方信息',
	64: '未开放的接口'
}

/**
 * ajax发生错误的时候调用
 */
window.ERR_OBJ = {
	'timeout': '链接超时',
	'error': '程序出错',
	'abort': '请求拒绝',
	'parsererror': '解析错误',
	'null': 'null'
}
//定义常用的右上角菜单

window.CONST_MENU = {
//	home:{id:'home',text:'主页'},
	home:{id:'home',text:''},
	self:{id:'self',text:'我'}
}

window.NOW = null; //记录当前访问的文件夹 默认为COMMON 在每个页面都会设置NOW

/**
 * 公用的文件夹
 */
window.COMMON = {};
COMMON.menuClick = function() {
	var id = this.getAttribute('title');
	console.log('id===>'+id)
	//COM.closeMark();
	if(NOW === COMMON) { //当前html属于com文件夹下边
		COM.openWindow(id);
	} else {
		COM.openWindow(id, '../../../com/html/other/' + id + '.html');
	}
}
COMMON.model = 'com'; //此值 指向的是文件夹(代表的是模块 com代表公用模块)
COMMON.menu = [{
	id: 'com_home_3',
	icon: 'mui-icon mui-icon-home',
	text: '主页',
	onclick: COMMON.click
},{
	id: 'com_self_1',
	icon: 'mui-icon mui-icon-person',
	text: '我',
	onclick: COMMON.click
},{
	id: 'com_device_2',
	icon: 'mui-icon mui-icon-gear',
	text: '设备管理',
	onclick: COMMON.click
}];
COMMON.nav = null;//底部导航对象

NOW = COMMON; //默认访问的是当前文件夹

/**
 * 青少年的 对象存储 用于young文件夹
 * 设置路径  young/js/
 */
window.YOUNG = {};
YOUNG.model = 'young';
YOUNG.nav = {};
YOUNG.nav.links = ['monitor/young_monitor.html', 'record/young_record.html', 'report/young_report.html'];
YOUNG.nav.ids = ['young_monitor', 'young_record', 'young_report'];
YOUNG.nav.texts = ['睡眠监控', '睡眠记录', '睡眠统计'];
YOUNG.nav.icons = ['mui-icon mui-icon-gear', 'mui-icon mui-icon-paperplane', 'mui-icon-extra mui-icon-extra-trend'];
YOUNG.nav.id = 'monitor';//当前显示的id

/**
 * 理疗床垫的对象村粗 用于liliao文件夹
 */
window.LILIAO = {};
LILIAO.model = 'liliao';
LILIAO.nav = {};
LILIAO.nav.links = ['device/liliao_device_list.html', 'help/liliao_help.html','self/self.html'];
LILIAO.nav.ids = ['liliao_device_list', 'liliao_help','self'];
LILIAO.nav.texts = ['设备列表', '帮助','我'];
LILIAO.nav.icons = ['mui-icon mui-icon-gear', 'mui-icon mui-icon-help','mui-icon mui-icon-contact'];
LILIAO.nav.id = 'liliao_device_list';//当前显示的id
