//
//  WTFDeviceInfoModel.h
//  SmartMattress
//
//  Created by William Cai on 2016/12/3.
//  Copyright © 2016年 lesmarthome. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface WTFDeviceInfoModel : NSObject

@property (assign, nonatomic) unsigned int device_id; // 没卵用
@property (copy, nonatomic) NSString *device_name;    // 设备名称
@property (copy, nonatomic) NSString *alias;          // 昵称 有昵称的情况就显示昵称

@end
