//
//  WTFMJExtensionConfig.m
//  SmartMattress
//
//  Created by William Cai on 2016/11/22.
//  Copyright © 2016年 lesmarthome. All rights reserved.
//

#import "WTFMJExtensionConfig.h"

// 控制模型
#import "WTFTransModel.h"
#import "WTFBodyModel.h"
#import "WTFParamsModel.h"

#import "WTFRealTimeModel.h"
#import "WTFHeatingModel.h"
#import "WTFPhysioModel.h"

// 登录模型
#import "WTFLoginBodyModel.h"
#import "WTFLoginParamsModel.h"

#import "WTFLoginCodeModel.h"
#import "WTFLoginTokenModel.h"

// 个人设置 设备管理模型
#import "WTFMeBodyModel.h"
#import "WTFMeParamsModel.h"

#import "WTFMeInfoModel.h"

#import "MJExtension.h"

@implementation WTFMJExtensionConfig

+ (void)load {
    
    [WTFBodyModel mj_setupObjectClassInArray:^NSDictionary *{
        return @{
                 @"params" : @"ParamsModel"
                 };
    }];
    
    [WTFRealTimeModel mj_setupReplacedKeyFromPropertyName:^NSDictionary *{
        return @{
                 @"msgId"               : @"msgId",
                 @"state"               : @"state",
                 @"flag"                : @"body.flag",
                 @"params"              : @"body.params",
                 @"side0"               : @"body.params[0].side",
                 @"mode0"               : @"body.params[0].mode",
                 @"targetTemperature0"  : @"body.params[0].targetTemperature",
                 @"currentTemperature0" : @"body.params[0].currentTemperature",
                 @"side1"               : @"body.params[1].side",
                 @"mode1"               : @"body.params[1].mode",
                 @"targetTemperature1"  : @"body.params[1].targetTemperature",
                 @"currentTemperature1" : @"body.params[1].currentTemperature",
                 @"powerOn"             : @"body.params[2].powerOn"
                 };
    }];
    
    [WTFHeatingModel mj_setupReplacedKeyFromPropertyName:^NSDictionary *{
        return @{
                 @"msgId"                  : @"msgId",
                 @"state"                  : @"state",
                 @"flag"                   : @"body.flag",
                 @"modeSwitch"             : @"body.params[0].modeSwitch",
                 @"side"                   : @"body.params[0].side",
                 @"targetTemperature"      : @"body.params[0].targetTemperature",
                 @"protectTime"            : @"body.params[0].protectTime",
                 @"startTime"              : @"body.params[0].startTime",
                 @"autoTemperatureControl" : @"body.params[0].autoTemperatureControl"
                 };
    }];
    
    [WTFPhysioModel mj_setupReplacedKeyFromPropertyName:^NSDictionary *{
        return @{
                 @"msgId"      : @"msgId",
                 @"state"      : @"state",
                 @"flag"       : @"body.flag",
                 @"modeSwitch" : @"body.params[0].modeSwitch",
                 @"side"       : @"body.params[0].side",
                 @"workTime"   : @"body.params[0].workTime",
                 @"startTime"  : @"body.params[0].startTime",
                 @"overTime"   : @"body.params[0].overTime"
                 };
    }];
    
    [WTFLoginBodyModel mj_setupObjectClassInArray:^NSDictionary *{
        return @{
                 @"params" : @"WTFLoginParamsModel"
                 };
    }];
    
    [WTFLoginCodeModel mj_setupReplacedKeyFromPropertyName:^NSDictionary *{
        return @{
                 @"flag"    : @"flag",
                 @"err_code" : @"err_code",
                 @"cause"   : @"cause",
                 @"code"    : @"params[0].code"
                 };
    }];
    
    [WTFLoginTokenModel mj_setupReplacedKeyFromPropertyName:^NSDictionary *{
        return @{
                 @"flag"       : @"flag",
                 @"err_code"   : @"err_code",
                 @"cause"      : @"cause",
                 @"token"      : @"params[0].token",
                 @"user_id"    : @"params[0].user_id",
                 @"expires_in" : @"params[0].expires_in"
                 };
    }];
    
    [WTFMeBodyModel mj_setupObjectClassInArray:^NSDictionary *{
        return @{
                 @"params" : @"WTFMeParamsModel"
                 };
    }];
    
    [WTFMeInfoModel mj_setupReplacedKeyFromPropertyName:^NSDictionary *{
        return @{
                 @"flag"     : @"flag",
                 @"err_code" : @"err_code",
                 @"cause"    : @"cause",
                 @"user_id"  : @"params[0].user_id",
                 @"name"     : @"params[0].name",
                 @"birthday" : @"params[0].birthday",
                 @"sex"      : @"params[0].sex",
                 @"img_url"  : @"params[0].img_url"
                 };
    }];
    
}

@end
