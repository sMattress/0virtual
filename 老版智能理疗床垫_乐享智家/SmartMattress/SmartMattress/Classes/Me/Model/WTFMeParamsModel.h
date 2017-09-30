//
//  WTFMeParamsModel.h
//  SmartMattress
//
//  Created by William Cai on 2016/12/13.
//  Copyright © 2016年 lesmarthome. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface WTFMeParamsModel : NSObject

/* 获取用户基本信息 */
@property (assign, nonatomic) NSInteger user_id;
@property (copy, nonatomic)   NSString  *name;
@property (strong, nonatomic) NSString  *birthday;
@property (assign, nonatomic) NSInteger sex;
@property (copy, nonatomic)   NSString  *img_url;

/*  */
@property (assign, nonatomic) NSInteger device_id;
@property (copy, nonatomic) NSString *device_name;
@property (copy, nonatomic) NSString *alias;

@end
