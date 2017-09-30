//
//  WTFMeInfoModel.h
//  SmartMattress
//
//  Created by William Cai on 2016/12/14.
//  Copyright © 2016年 lesmarthome. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface WTFMeInfoModel : NSObject

@property (assign, nonatomic) NSInteger flag;

@property (assign, nonatomic) NSInteger err_code;
@property (copy, nonatomic) NSString *cause;

@property (assign, nonatomic) NSInteger user_id;
@property (copy, nonatomic)   NSString  *name;
@property (strong, nonatomic) NSString  *birthday;
@property (assign, nonatomic) NSInteger sex;
@property (copy, nonatomic)   NSString  *img_url;

@end
