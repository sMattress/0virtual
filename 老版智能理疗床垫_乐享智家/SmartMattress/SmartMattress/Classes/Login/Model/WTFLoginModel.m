//
//  WTFLoginModel.m
//  SmartMattress
//
//  Created by William Cai on 2016/11/30.
//  Copyright © 2016年 lesmarthome. All rights reserved.
//

#import "WTFLoginModel.h"
#import "WTFTokenModel.h"

@implementation WTFLoginModel

+ (NSDictionary *)mj_objectClassInArray {
    return @{
             @"params" : @"WTFTokenModel"
             };
}

@end
