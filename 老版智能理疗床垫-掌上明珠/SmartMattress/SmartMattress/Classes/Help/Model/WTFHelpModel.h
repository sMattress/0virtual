//
//  WTFHelpModel.h
//  SmartMattress
//
//  Created by William Cai on 2017/1/7.
//  Copyright © 2017年 lesmarthome. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface WTFHelpModel : NSObject

/** 标题文字 */
@property (copy, nonatomic) NSString *title;
/** 按钮图片 */
@property (copy, nonatomic) NSString *image;
/** 按钮文字 */
@property (copy, nonatomic) NSString *label;
/** 链接 */
@property (copy, nonatomic) NSString *URL;

@end
