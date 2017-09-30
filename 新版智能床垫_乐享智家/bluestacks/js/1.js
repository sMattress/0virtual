function openBluetooth() {
	if(!BAdapter.isEnabled()) {
		BAdapter.enable();
	}
}

function closeBluetooth() {
	if(BAdapter.isEnabled()) {
		BAdapter.disable();
	}
}

function bluetooth_list() {
	var table = document.body.querySelector('.mui-table-view');
	var LeScanCallback = plus.android.importClass('android.bluetooth.BluetoothAdapter.LeScanCallback', {
		onLeScan: function(device, rssi, scanRecord) {
			var li = document.createElement('li');
			li.className = 'mui-table-view-cell';
			li.innerHTML = device.getAddress();
			table.insertBefore(li, table.firstChild);
			console.log(device.getAddress());
		}
	});
	plus.android.importClass(LeScanCallback);
	BAdapter.startLeScan(mLeScanCallback);
	/*
	var lists = BAdapter.getBondedDevices();
	plus.android.importClass(lists);
	var iterator = lists.iterator();
	plus.android.importClass(iterator);
	while (iterator.hasNext()) {
	var d = iterator.next();
	plus.android.importClass(d);
	console.log(d.getAddress());
	var li = document.createElement('li');
	li.className = 'mui-table-view-cell';
	li.innerHTML =d.getAddress();
	table.insertBefore(li, table.firstChild)
	}
	*/
}

function connectBluetooth() {
	var addres_mac = COM.getStorage(STORAGE.blueAddress);
	Callback = plus.android.importClass('android.bluetooth.BluetoothGattCallback', {
		onConnectionStateChange: function(gatt, status,
			newState) {
			console.log(' 连接成功 ');
			BGatt.discoverServices();
			if(status == 0) {
				BGatt.discoverServices();
				plus.nativeUI.toast(' 连接成功 ');
			}
		}

	}, {
		onServicesDiscovered: function(gatt, status) {
			Bservice = gatt.getService(Suuid);
			plus.android.importClass(Bservice);
			Wcharacteristic = Bservice.getCharacteristic(Wuuid);
			plus.android.importClass(Wcharacteristic);
			Rcharacteristic = Bservice.getCharacteristic(Ruuid);
			BGatt.readCharacteristic(Rcharacteristic);
			var a = new array();
			a[0] = 0x02;
			a[1] = 0x00;
			descriptor = reccharacteristic.getDescriptors().get(0);
			plus.android.importClass(descriptor);
			if(descriptor != null) {
				descriptor
					.setValue(a);
				if(BGatt.writeDescriptor(descriptor)) {
					BGatt.setCharacteristicNotification(
						Rcharacteristic, true);
					console.log(' 注册成功 ');
				}
			}
		}
	}, {
		onCharacteristicRead: function(gatt,
			characteristic, status) {
			var data = characteristic.getValue();
			plus.nativeUI.toast(data);
			console.log(' 读成功 ');
		}
	}, {
		onCharacteristicChanged: function(gatt, characteristic) {
			var data = characteristic.getValue();
			plus.nativeUI.toast(data);
			console.log(' 读成功 ');
		}
	});
	console.log(JSON.stringify(Callback));

	Bdevice = BAdapter.getRemoteDevice(addres_mac);
	plus.android.importClass(Bdevice);

	plus.android.importClass(Callback);
	BGatt = Bdevice.connectGatt(main,
		false, Callback);
	plus.android.importClass(BGatt);
}

function sendTxt() {
	var txt = document.getElementById(' send - text ').value;
	Wcharacteristic.setValue(txt);
	if(BGatt.readCharacteristic(Wcharacteristic)) {
		plus.nativeUI.toast(' 发送成功 ');
	}
}
