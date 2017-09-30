var blue_test = function() {
	var address = COM.getStorage(STORAGE.blueAddress);
	//引入包
	var BluetoothAdapter = plus.android.importClass('android.bluetooth.BluetoothAdapter');
	var BluetoothDevice = plus.android.importClass('android.bluetooth.BluetoothDevice');
	var BluetoothGattService = plus.android.importClass('android.bluetooth.BluetoothGattService');
	var BluetoothManager = plus.android.importClass('android.bluetooth.BluetoothManager');
	var BluetoothLeScanner = plus.android.importClass('android.bluetooth.le.BluetoothLeScanner');
	var ScanResult = plus.android.importClass('android.bluetooth.le.ScanResult');
	var BroadcastReceiver = plus.android.importClass('android.content.BroadcastReceiver');
	var Context = plus.android.importClass('android.content.Context');
	var Intent = plus.android.importClass('android.content.Intent');
	var Runnable = plus.android.importClass('java.lang.Runnable');

	//获取蓝牙控制
	var main = plus.android.runtimeMainActivity();
	var bluetoothManager = main.getSystemService(Context.BLUETOOTH_SERVICE);
	var bluetoothAdapter = bluetoothManager.getAdapter();
	
	//蓝牙搜索回调
    var leScanCallback = plus.android.implements("android.bluetooth.BluetoothAdapter$LeScanCallback", {
        "onLeScan": function(device, rssi, scanRecord) {
        	console.log('device===>'+device.getName());
            // 可通过 scanRecord 获取Ble设备的uuid，major，minor
        }
    });
	
	console.log('已执行'+JSON.stringify(leScanCallback));
//	bluetoothAdapter.startLeScan(leScanCallback);
	setTimeout(function() {
		console.log('已执行');
//		bluetoothAdapter.stopLeScan(leScanCallback);
	}, 1000);

}