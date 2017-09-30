//
//  WTFDeviceModel.m
//  SmartMattress
//
//  Created by William Cai on 2016/11/22.
//  Copyright © 2016年 lesmarthome. All rights reserved.
//

#import "WTFDeviceModel.h"

@implementation WTFDeviceModel

/*
 将某个对象写入文件时候会调用
 在这个方法中说清楚哪些属性需要存储
 */
- (void)encodeWithCoder:(NSCoder *)encoder {
    [encoder encodeObject:self.deviceName forKey:@"deviceName"];
    [encoder encodeObject:self.deviceNumber forKey:@"deviceNumber"];
}
/*
 解析对象会调用这个方法
 需要解析哪些属性
 */
- (id)initWithCoder:(NSCoder *)decoder {
    if (self = [super init]) {
        self.deviceName = [decoder decodeObjectForKey:@"deviceName"];
        self.deviceNumber = [decoder decodeObjectForKey:@"deviceNumber"];
    }
    return self;
}

@end
