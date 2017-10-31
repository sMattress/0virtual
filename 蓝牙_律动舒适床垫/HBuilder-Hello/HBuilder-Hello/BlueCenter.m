//
//  BlueCenter.m
//  HBuilder
//
//  Created by 李科 on 2017/10/20.
//  Copyright © 2017年 DCloud. All rights reserved.
//

#import "BlueCenter.h"
#import <LocalAuthentication/LocalAuthentication.h>
@interface BlueCenter()<CBCentralManagerDelegate,CBPeripheralDelegate>{
    
}
@end

@implementation BlueCenter

//初始化函数
-(void)init:(PGMethod*)command{
    NSLog(@"正在执行init");
    NSString* cbId =  [command.arguments objectAtIndex:0];
    _devices = [[NSMutableArray alloc] init];
    _dArr = [[NSMutableArray alloc] init];
    _cnectState = @"0";//代表蓝牙连接状态 初始状态
    _cbcReadStr = @"";//读取蓝牙返回消息
    _readState = @"0";
    _writeState = @"0";
    if(self = [super init]){
        _centralManager = [[CBCentralManager alloc]initWithDelegate:self queue:nil];
    }
    [self toSucessCallback:cbId withString:@"1"];
 
 }
//获取蓝牙状态
-(void)getBlueState:(PGMethod*)command{
    NSLog(@"正在执行 getBlueState");
    NSString* cbId = [command.arguments objectAtIndex:0];
    [self toSucessCallback:cbId withInt:_centralManager.state];
}
//获取蓝牙数组
-(void)getBlueList:(PGMethod*)command{
    NSLog(@"正在执行 getBlueList");
    NSString* cbId = [command.arguments objectAtIndex:0];

    [self toSucessCallback:cbId withString:[self objArrayToJSON:_dArr]];
}//扫描蓝牙
-(void)startScan:(PGMethod*)command{
    NSLog(@"正在执行 startScan");
    [_centralManager scanForPeripheralsWithServices:nil options:nil];
    NSString* cbId = [command.arguments objectAtIndex:0];
    [self toSucessCallback:cbId withInt:1];
}
//停止扫描蓝牙
-(void)stopScan:(PGMethod*)command{
    NSLog(@"正在执行 stopScan");
    [_centralManager stopScan];
    NSString* cbId = [command.arguments objectAtIndex:0];
    [self toSucessCallback:cbId withInt:1];
}
//链接蓝牙
-(void)contBlue:(PGMethod*)command{
    NSLog(@"正在执行 contBlue");
    NSString* cbId = [command.arguments objectAtIndex:0];
    NSString *index = [command.arguments objectAtIndex:1];
    NSInteger i = [index integerValue];
    _peripheral = [_devices objectAtIndex:i];
    _cnectState = @"1";
    [_centralManager connectPeripheral:_peripheral options:nil];
    [self toSucessCallback:cbId withInt:1];
    
}
//断开蓝牙连接
-(void)disContBlue:(PGMethod *)commond{
    NSLog(@"正在执行 disContBlue");
    NSString* cbId = [commond.arguments objectAtIndex:0];
    [_centralManager cancelPeripheralConnection:_peripheral];
    [self toSucessCallback:cbId withInt:1];
}
//蓝牙连接成功
- (void)centralManager:(CBCentralManager *)central didConnectPeripheral:(CBPeripheral *)peripheral{
    NSLog(@">>>蓝牙连接成功");
    _cnectState = @"2";
    peripheral.delegate = self;
    [peripheral discoverServices:nil];//扫描服务
}
//扫描到Services
-(void)peripheral:(CBPeripheral *)peripheral didDiscoverServices:(NSError *)error{
    NSLog(@">>>扫描到服务：%@",peripheral.services);
    if (error)
    {
        _cnectState = @"-97";
        return;
    }
    _cnectState = @"3";
    for (CBService *service in peripheral.services) {
        if([@"0003cdd0-0000-1000-8000-00805f9b0131" isEqualToString:[service.UUID.UUIDString lowercaseString]]){
            _cnectState = @"4";
            [peripheral discoverCharacteristics:nil forService:service];//扫描service的Characteristics
            break;
        }
    }
}
//扫描到Characteristics
-(void)peripheral:(CBPeripheral *)peripheral didDiscoverCharacteristicsForService:(CBService *)service error:(NSError *)error{
    if (error)
    {
        _cnectState = @"-96";
        NSLog(@"error Discovered characteristics for %@ with error: %@", service.UUID, [error localizedDescription]);
        return;
    }
    _cnectState = @"5";
    NSString *read = @"0003cdd1-0000-1000-8000-00805f9b0131";
    NSString *write = @"0003cdd2-0000-1000-8000-00805f9b0131";
    for (CBCharacteristic *characteristic in service.characteristics)
    {
        NSString *uuid = [characteristic.UUID.UUIDString lowercaseString];
        NSLog(@"uuid===%@",uuid);
        if([read isEqualToString:uuid]){
            if([@"7" isEqualToString: _cnectState]){
                _cnectState = @"8";
            }else{
                _cnectState = @"6";
            }
            _cbcRead = characteristic;
            
        }
        if([write isEqualToString:uuid]){
            if([@"6" isEqualToString: _cnectState]){
                _cnectState = @"8";
            }else{
                _cnectState = @"7";
            }
            _cbcWrite = characteristic;
        }
    }
    if([@"8" isEqualToString: _cnectState]){
        [peripheral setNotifyValue:YES forCharacteristic:_cbcRead];
        [peripheral readValueForCharacteristic:_cbcRead];//监听读数据
    }
    
}
//读取到数据时进入此函数
-(void)peripheral:(CBPeripheral *)peripheral didUpdateValueForCharacteristic:(CBCharacteristic *)characteristic error:(NSError *)error{
    if(error){
        _readState = @"-95";
    }else{
        _cbcReadStr = [[NSString alloc] initWithData:characteristic.value encoding:NSUTF8StringEncoding] ;
        NSLog(@"读取到数据：%@",_cbcReadStr);
    }
}
//发送信息到蓝牙
-(void)writeValue:(PGMethod*)command{
    NSLog(@"正在执行 writeValue");
    NSString* cbId = [command.arguments objectAtIndex:0];
    NSString* writeValue = [command.arguments objectAtIndex:1];
    writeValue = [writeValue stringByAppendingString:@"\r\n"];
    NSData *value = [writeValue dataUsingEncoding:NSUTF8StringEncoding];
    NSLog(@"send===%@",value);
    [_peripheral writeValue:value forCharacteristic:_cbcWrite
                           type:CBCharacteristicWriteWithoutResponse];
    [self toSucessCallback:cbId withString:@"消息已发送"];

}
//获取蓝牙连接状态
-(void)getContState:(PGMethod*)command{
    NSLog(@"正在执行 getContState");
    
    NSString* cbId = [command.arguments objectAtIndex:0];
    [self toSucessCallback:cbId withString:_cnectState];
}
//接收蓝牙发送到信息
-(void)readValue:(PGMethod*)command{
    NSLog(@"正在执行 readValue");
    NSString* cbId = [command.arguments objectAtIndex:0];
    [self toSucessCallback:cbId withString:_cbcReadStr];
    _cbcReadStr = @"";
}
//获取写入数据的状态
-(void)getWriteState:(PGMethod*)commond{
    NSLog(@"正在执行 getWriteState");
    NSString* cbId = [commond.arguments objectAtIndex:0];
    [self toSucessCallback:cbId withString:_writeState];
}
//获取读取数据的状态
-(void)getReadState:(PGMethod*)commond{
    NSLog(@"正在执行 getReadState");
    NSString* cbId = [commond.arguments objectAtIndex:0];
    [self toSucessCallback:cbId withString:_readState];
}

//扫描到设备会进入方法
-(void)centralManager:(CBCentralManager *)central didDiscoverPeripheral:(CBPeripheral *)peripheral advertisementData:(NSDictionary *)advertisementData RSSI:(NSNumber *)RSSI{
    //接下连接我们的测试设备，如果你没有设备，可以下载一个app叫lightbule的app去模拟一个设备
    //这里自己去设置下连接规则，我设置的是P开头的设备
    if([peripheral.name containsString:@"USR"] && ![_devices containsObject:peripheral]){
        NSLog(@"扫描到一个新设备");
        [_devices addObject:peripheral];
        NSString *jsObj = [[NSString alloc] initWithFormat:@"%@%@%@%@%@",@"{\"name\":\"",peripheral.name,@"\",\"address\":\"",peripheral.identifier,@"\"}"];
        [_dArr addObject:jsObj];
    }
    
        /*
         一个主设备最多能连7个外设，每个外设最多只能给一个主设备连接,连接成功，失败，断开会进入各自的委托
         - (void)centralManager:(CBCentralManager *)central didConnectPeripheral:(CBPeripheral *)peripheral;//连接外设成功的委托
         - (void)centralManager:(CBCentralManager *)central didFailToConnectPeripheral:(CBPeripheral *)peripheral error:(NSError *)error;//外设连接失败的委托
         - (void)centralManager:(CBCentralManager *)central didDisconnectPeripheral:(CBPeripheral *)peripheral error:(NSError *)error;//断开外设的委托
         */
        //连接设备
        //[_centralManager connectPeripheral:peripheral options:nil];
}

//蓝牙连接失败
- (void)centralManager:(CBCentralManager *)central didFailToConnectPeripheral:(CBPeripheral *)peripheral error:(NSError *)error{
    _cnectState = @"-98";
}
//蓝牙断开链接
- (void)centralManager:(CBCentralManager *)central didDisconnectPeripheral:(CBPeripheral *)peripheral error:(NSError *)error{
    _cnectState = @"-99";
}
//把多个json字符串转为一个json字符串
- (NSString *)objArrayToJSON:(NSArray *)array {
    
    NSString *jsonStr = @"[";
    
    for (NSInteger i = 0; i < array.count; ++i) {
        if (i != 0) {
            jsonStr = [jsonStr stringByAppendingString:@","];
        }
        jsonStr = [jsonStr stringByAppendingString:array[i]];
    }
    jsonStr = [jsonStr stringByAppendingString:@"]"];
    
    return jsonStr;
}  //蓝牙状态改变委托
- (void) centralManagerDidUpdateState:(CBCentralManager *)central
{
    switch (central.state) {
        case 0:
            NSLog(@"CBCentralManagerStateUnknown");
            break;
        case 1:
            NSLog(@"CBCentralManagerStateResetting");
            break;
        case 2:
            NSLog(@"CBCentralManagerStateUnsupported");//不支持蓝牙
            break;
        case 3:
            NSLog(@"CBCentralManagerStateUnauthorized");
            break;
        case 4:
            NSLog(@"CBCentralManagerStatePoweredOff");//蓝牙未开启
            break;
        case 5:
            NSLog(@"CBCentralManagerStatePoweredOn");//蓝牙已开启
            // 在中心管理者成功开启后再进行一些操作
            // 搜索外设
            //[_centralManager scanForPeripheralsWithServices:nil // 通过某些服务筛选外设
                                              //options:nil]; // dict,条件
            // 搜索成功之后,会调用我们找到外设的代理方法
            // - (void)centralManager:(CBCentralManager *)central didDiscoverPeripheral:(CBPeripheral *)peripheral advertisementData:(NSDictionary *)advertisementData RSSI:(NSNumber *)RSSI; //找到外设
            break;
        default:
        break;
    }
}

@end
