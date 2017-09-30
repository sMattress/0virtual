//
//  WTFBodyModel.h
//  SmartMattress
//
//  Created by William Cai on 2016/11/22.
//  Copyright © 2016年 lesmarthome. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface WTFBodyModel : NSObject

@property (copy, nonatomic) NSString *version;
@property (assign, nonatomic) NSInteger cmd;
@property (assign, nonatomic) NSInteger flag;
@property (assign, nonatomic) NSInteger errCode;
@property (strong, nonatomic) NSArray *params;

@end
