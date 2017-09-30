//
//  WTFKnowledgeModel.h
//  SmartMattress
//
//  Created by William Cai on 2017/1/7.
//  Copyright © 2017年 lesmarthome. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface WTFKnowledgeModel : NSObject

/** 图片 */
@property (copy, nonatomic) NSString *image;
/** 内容标题 */
@property (copy, nonatomic) NSString *title;
/** 知识内容 */
@property (copy, nonatomic) NSString *content;
/** 链接 */
@property (copy, nonatomic) NSString *URL;

@end
