//DEBUG = false;
/**
 * 青少年
 */
window.Y_COM = {};
URL.https = 'http://service.young.lesmarthome.com:8080/';
URL.getSleepMonitor = 'sleep/monitor';
URL.getSleepStage = 'sleep/stage';
URL.getSleepEfficiency = 'sleep/efficiency';
URL.getSleepFullstage = 'sleep/fullstage';

//Y_COM.debug_device = 'd8b04cb5929c'; //杨礼
Y_COM.debug_device = 'd8b04cdc84aa'; //我的
//Y_COM.debug_device = 'd8b04cdc849e'; //彬哥的
Y_COM.debug_device =  '';
Y_COM.stateObj = {
	'6': ['努力入睡中', 'waking','c35652'],
	'7': ['已入睡', 'sleeping','77a9ae'],
	'8': ['努力入睡中', 'movement','9dc6b3'],
	'9': ['不在床', 'leaving','51626e']
};


/*
 睡眠结果状态对照  颜色与stateObj一样
 * */
Y_COM.sleepOverState = {
	
	'1': ['深睡眠', 'sleeping','77a9ae'] ,
	'2': ['浅睡眠', 'waking','c35652'],
	'3': ['REM', 'movement','9dc6b3'],
	'4': ['觉醒', 'leaving','51626e']
}

/**
 * 解析
 */
Y_COM.anasStateStr = function(){
	
}
