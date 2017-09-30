//
//  WTFHeatingModel.h
//  SmartMattress
//
//  Created by William Cai on 2016/11/22.
//  Copyright © 2016年 lesmarthome. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface WTFHeatingModel : NSObject

@property (assign, nonatomic) NSInteger msgId;
@property (assign, nonatomic) NSInteger state;

@property (assign, nonatomic) NSInteger flag;

@property (assign, nonatomic) NSInteger modeSwitch;
@property (assign, nonatomic) NSInteger side;
@property (assign, nonatomic) NSInteger targetTemperature;
@property (assign, nonatomic) NSInteger protectTime;
@property (assign, nonatomic) NSInteger startTime;
@property (assign, nonatomic) NSInteger autoTemperatureControl;

/*
 参数说明:
 switch: 0为关闭，1为开启；只有在switch==1时，其后参数才存在
 side: 0为右边，1为左边
 targetTemperature: 取值范围25-45
 protectTime: 单位为秒，取值范围30min-3h
 startTime: 从0点至此刻的总秒数
 autoTemperatureControl: 0为关闭，1为开启
 */

@end
