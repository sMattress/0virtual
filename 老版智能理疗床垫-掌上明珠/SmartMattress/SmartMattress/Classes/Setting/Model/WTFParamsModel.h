//
//  WTFParamsModel.h
//  SmartMattress
//
//  Created by William Cai on 2016/11/22.
//  Copyright © 2016年 lesmarthome. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface WTFParamsModel : NSObject

/* 设备类型 */
@property (copy, nonatomic) NSString *deviceType;

/* 远程控制参数 */
@property (assign, nonatomic) NSInteger side;
@property (assign, nonatomic) NSInteger mode;
@property (assign, nonatomic) NSInteger targetTemperature;
@property (assign, nonatomic) NSInteger currentTemperature;
@property (assign, nonatomic) NSInteger powerOn;

/* 加热预约参数 */
@property (assign, nonatomic) NSInteger modeSwitch;
//@property (assign, nonatomic) NSInteger side;
//@property (assign, nonatomic) NSInteger targetTemperature;
@property (assign, nonatomic) NSInteger protectTime;
@property (assign, nonatomic) NSInteger startTime;
@property (assign, nonatomic) NSInteger autoTemperatureControl;

/* 理疗预约参数 */
//@property (assign, nonatomic) NSInteger modeSwitch;
//@property (assign, nonatomic) NSInteger side;
@property (assign, nonatomic) NSInteger workTime;
//@property (assign, nonatomic) NSInteger startTime;
@property (assign, nonatomic) NSInteger overTime;

@end
