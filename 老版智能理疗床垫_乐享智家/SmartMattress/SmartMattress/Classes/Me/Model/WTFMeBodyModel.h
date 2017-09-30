//
//  WTFMeBodyModel.h
//  SmartMattress
//
//  Created by William Cai on 2016/12/13.
//  Copyright © 2016年 lesmarthome. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface WTFMeBodyModel : NSObject

@property (assign, nonatomic) NSInteger flag;
@property (strong, nonatomic) NSArray *params;

@property (assign, nonatomic) NSInteger err_code;
@property (copy, nonatomic) NSString *cause;

@end
