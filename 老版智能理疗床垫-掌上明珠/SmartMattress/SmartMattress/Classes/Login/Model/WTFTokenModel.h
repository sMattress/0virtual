//
//  WTFTokenModel.h
//  SmartMattress
//
//  Created by William Cai on 2016/11/30.
//  Copyright © 2016年 lesmarthome. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface WTFTokenModel : NSObject

@property (assign, nonatomic) NSInteger user_id;
@property (assign, nonatomic) NSInteger expires_in;
@property (copy, nonatomic) NSString *token;

@end
