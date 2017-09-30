//
//  WTFFlagModel.m
//  SmartMattress
//
//  Created by William Cai on 2016/11/30.
//  Copyright © 2016年 lesmarthome. All rights reserved.
//

#import "WTFFlagModel.h"
#import "WTFPersonModel.h"

@implementation WTFFlagModel

+ (NSDictionary *)mj_objectClassInArray {
    return @{
             @"params" : @"WTFPersonModel"
             };
}

@end
