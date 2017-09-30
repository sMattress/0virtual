//
//  WTFTransModel.h
//  SmartMattress
//
//  Created by William Cai on 2016/11/22.
//  Copyright © 2016年 lesmarthome. All rights reserved.
//

#import <Foundation/Foundation.h>

@class WTFBodyModel;

@interface WTFTransModel : NSObject

@property (copy, nonatomic) NSString *from;
@property (copy, nonatomic) NSString *to;

@property (assign, nonatomic) NSInteger msgId;
@property (assign, nonatomic) NSInteger msgType;

@property (copy, nonatomic) NSString *version;
@property (assign, nonatomic) NSInteger state;

@property (strong, nonatomic) WTFBodyModel *body;

@end
