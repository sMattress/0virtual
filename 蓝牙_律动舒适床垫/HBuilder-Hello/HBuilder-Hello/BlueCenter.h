//
//  BlueCenter.h
//  HBuilder
//
//  Created by 李科 on 2017/10/20.
//  Copyright © 2017年 DCloud. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <PGPlugin.h>
#import <PGMethod.h>
#import <CoreBluetooth/CoreBluetooth.h>
@interface BlueCenter : PGPlugin
@property (nonatomic,strong)CBCentralManager * centralManager;//管理中心
@property (nonatomic,strong)CBPeripheral     * peripheral;//蓝牙设备
@property (nonatomic,strong)CBCharacteristic * cbcRead;//读服务
@property (nonatomic,strong)CBCharacteristic * cbcWrite;//写服务
@property (nonatomic,strong)NSMutableArray   * devices;//蓝牙设备数组
@property (nonatomic,strong)NSMutableArray   * dArr;//返回给h5的蓝牙设备数组
@property (nonatomic,strong)NSString   *cnectState;//蓝牙设备连接状态

@property (nonatomic,strong)NSString   *cbcReadStr;//蓝牙读取字符串
@property (nonatomic,strong)NSString   *readState;//蓝牙读取状态
@property (nonatomic,strong)NSString   *writeState;//蓝牙写入

-(void)init:(PGMethod*)commond;//初始化
-(void)getBlueState:(PGMethod*)commond;//获取蓝牙状态
-(void)getBlueList:(PGMethod*)commond;//获取蓝牙列表
-(void)startScan:(PGMethod*)commond;//开始扫描
-(void)stopScan:(PGMethod*)commond;//停止扫描
-(void)contBlue:(PGMethod*)commond;//连接蓝牙设备
-(void)disContBlue:(PGMethod*)commond;//断开蓝牙设备
-(void)getContState:(PGMethod*)commond;//获取蓝牙设备连接状态
-(void)writeValue:(PGMethod*)commond;//发送消息
-(void)readValue:(PGMethod*)commond;//读取消息

-(void)getWriteState:(PGMethod*)commond;//获取蓝牙写入状态
-(void)getReadState:(PGMethod*)commond;//获取蓝牙读取状态

-(void)centralManager:(CBCentralManager *)central didDiscoverPeripheral:(CBPeripheral *)peripheral advertisementData:(NSDictionary *)advertisementData RSSI:(NSNumber *)RSSI;
-(void)peripheral:(CBPeripheral *)peripheral didDiscoverServices:(NSError *)error;
@end
