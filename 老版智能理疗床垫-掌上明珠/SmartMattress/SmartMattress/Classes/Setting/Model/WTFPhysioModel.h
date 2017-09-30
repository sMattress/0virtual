//
//  WTFPhysioModel.h
//  SmartMattress
//
//  Created by William Cai on 2016/11/22.
//  Copyright © 2016年 lesmarthome. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface WTFPhysioModel : NSObject

@property (assign, nonatomic) NSInteger msgId;
@property (assign, nonatomic) NSInteger state;

@property (assign, nonatomic) NSInteger flag;

@property (assign, nonatomic) NSInteger modeSwitch;
@property (assign, nonatomic) NSInteger side;
@property (assign, nonatomic) NSInteger workTime;
@property (assign, nonatomic) NSInteger startTime;
@property (assign, nonatomic) NSInteger overTime;

@end
