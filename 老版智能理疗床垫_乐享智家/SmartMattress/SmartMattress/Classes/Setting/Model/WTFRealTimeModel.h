//
//  WTFRealTimeModel.h
//  SmartMattress
//
//  Created by William Cai on 2016/11/22.
//  Copyright © 2016年 lesmarthome. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface WTFRealTimeModel : NSObject

@property (assign, nonatomic) NSInteger msgId;
@property (assign, nonatomic) NSInteger state;

@property (assign, nonatomic) NSInteger flag;

@property (strong, nonatomic) NSArray *params;

@property (assign, nonatomic) NSInteger side0;
@property (assign, nonatomic) NSInteger mode0;
@property (assign, nonatomic) NSInteger targetTemperature0;
@property (assign, nonatomic) NSInteger currentTemperature0;

@property (assign, nonatomic) NSInteger side1;
@property (assign, nonatomic) NSInteger mode1;
@property (assign, nonatomic) NSInteger targetTemperature1;
@property (assign, nonatomic) NSInteger currentTemperature1;

@property (assign, nonatomic) NSInteger powerOn;

/*
 side: 0为右边, 1为左边
 mode: 0为待机, 1为加热, 2为理疗
 targetTemperature: mode=1时有效，取值范围25-45
 currentTemperature: 当前温度, 不允许省略
 powerOn: 0为关闭, 1为开启
 */

@end
