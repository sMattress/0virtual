//通过socket连接服务器
/*
Mysocket(websocket地址，发送方标志名)

Mysocket.openSocket(成功回调,失败回调);
Mysocket.Msg(接收方标志名,body);
Mysocket.sendMsg(Mysocket.Msg(接收方标志名,body),成功回调,失败回调);
**/
function Mysocket(url, myName, version, debug) {
	debug = true;
	var msgId = 0; //0为注册回调id号
	var callbackArray = new Array();
	var errbackArray = new Array();
	var cacheArray = new Array();
	var intervalArray = new Array(); //设置超时操作
	var isConnected = true;
	var tS = null;
	var tE = null;
	var readyCheck = 0;
	var socket = new WebSocket(url);
	//注册socket
	function openSocket(callback, errback) {
		isConnected = true;
		tE = callback;
		te = errback;
		register(callback, errback);
	};
	//创建Msg
	function Msg(to, body) {
		if(to === '') throw "目标名不可为空";
		if(!body.version === undefined || !body.cmd === undefined || !body.params instanceof Array) throw 'body格式不正确';
		var msg = {
			"from": myName, // @necessary - head
			"to": to, // @necessary - head
			"msgId": msgId++, // @necessary - head
			"msgType": 1, // @necessary - head
			"version": version, // @necessary - head
			"state": 1, // @necessary - head
			"body": body
		};
		return msg;
	};
	//发送socket信息
	function sendMsg(msg, callback, errback) {
		var msgStr = JSON.stringify(msg);
		var msgId = msg.msgId;
		if(isConnected != true) {
			cacheArray.push(msgStr)
		} else {
			var i = 0;
			intervalArray[msgId] = setInterval(function() {
				if(i++ > 3) {
					clearInterval(intervalArray[msgId]);
					intervalArray[msgId] = null;
					callbackArray[msgId] = null;
					errbackArray[msgId] && errbackArray[msgId]();
				}
			}, 1000);
			socket.send(msgStr);
		}
		callbackArray[msgId] = callback;
		errbackArray[msgId] = errback;
	}

	function waitForConnection(callback, errback, interval) {
		if(readyCheck > 5) {
			isConnected =false;
			errbackArray[0] && errbackArray[0](false);
			return;
		}
		if(socket.readyState === 1) {
			callback();
		} else {
			readyCheck++;
			var that = this;
			setTimeout(function() {
				waitForConnection(callback, interval);
			}, interval);
		}
	};

	/*分析返回数据
	成功=>"body":{"version": 1.0,"flag": 1,}
	失败=>"body":{"version": 1.0,"flag": 0,"errCode": 16}
	*/
	var checkBody = function(body) {
		if(body.flag == 1) return true;
		return false;
	};
	//注册方法
	var register = function(callback, errback) {
		//		console.log('register 已运行..');
		waitForConnection(function() {
			var msg = {
				"from": myName, // @necessary - head
				"to": 'server', // @necessary - head
				"msgId": msgId++, // @necessary - head
				"msgType": 1, // @necessary - head
				"version": version, // @necessary - head
				"state": 1, // @necessary - head
				"body": {
					"version": "1.0",
					"cmd": 64,
					"params": [{
						"deviceType": "Web"
					}]
				}
			};
			sendMsg(msg,callback, errback);
		}, errback, 1000);

		callbackArray[0] = function(body) {
			//			console.log("websocket register success");
			isConnected = true;
			callback(body);
			for(var i = 0; i < cacheArray.length; i++) {
				socket.send(cacheArray[i]);
			}
		};
		errbackArray[0] = errback;
	};
	// 监听消息
	socket.onmessage = function(event) {
		var msgData = event.data;
		console.log('onmessage已执行===>' + JSON.stringify(event));
		var msgJson = JSON.parse(msgData);
		var getmsgId = msgJson.msgId;
		if(checkBody(msgJson.body)) {
			intervalArray[getmsgId] && clearInterval(intervalArray[getmsgId]);
			//信息返回正确
			if(callbackArray[getmsgId] != null) {
				callbackArray[getmsgId](msgJson.body);
			}
		} else {
			intervalArray[getmsgId] && clearInterval(intervalArray[getmsgId]);
			//信息返回错误
			if(errbackArray[getmsgId] != null) {
				errbackArray[getmsgId](msgJson.body);
			}
		}
	};
	// 监听Socket的关闭
	socket.onclose = function(event) {
		isConnected = false;
	};

	this.url = url;
	this.myName = myName;
	this.openSocket = openSocket;
	this.Msg = Msg;
	this.sendMsg = sendMsg;
	this.getConnect = function() {
		return isConnected;
	}
}