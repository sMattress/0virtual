//
//  WTFPersonModel.h
//  SmartMattress
//
//  Created by William Cai on 2016/11/30.
//  Copyright © 2016年 lesmarthome. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface WTFPersonModel : NSObject

@property (assign, nonatomic) unsigned int user_id;
@property (copy, nonatomic) NSString *name;
@property (copy, nonatomic) NSString *imgUrl;
@property (assign, nonatomic) NSInteger sex;
@property (strong, nonatomic) NSDate *birthday;

@end
