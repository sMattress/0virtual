//
//  WTFFlagDModel.h
//  SmartMattress
//
//  Created by William Cai on 2016/12/3.
//  Copyright © 2016年 lesmarthome. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface WTFFlagDModel : NSObject

@property (assign, nonatomic) NSInteger flag;
@property (assign, nonatomic) NSInteger err_code;
@property (strong, nonatomic) NSArray *params;

@end
