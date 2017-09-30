//
//  WTFHelpHeaderView.m
//  SmartMattress
//
//  Created by William Cai on 2017/1/7.
//  Copyright © 2017年 lesmarthome. All rights reserved.
//

#import "WTFHelpHeaderView.h"

#import "WTFHelpContentController.h"

#import "WTFHelpButton.h"

#import "WTFHelpModel.h"

#import <MJExtension/MJExtension.h>

#define helpBaseURL @"http://help.lesmarthome.com/smartmattress/content/"

@implementation WTFHelpHeaderView

- (instancetype)initWithFrame:(CGRect)frame
{
    if (self = [super initWithFrame:frame]) {
        self.backgroundColor = [UIColor clearColor];
        
        NSArray *dictArray = @[
                               @{
                                   @"title" : @"远程控制",
                                   @"image" : @"temperature_setting",
                                   @"label" : @"远程控制帮助",
                                   @"URL"   : @"%E8%BF%9C%E7%A8%8B%E6%8E%A7%E5%88%B6.html"
                                   },
                               @{
                                   @"title" : @"加热预约",
                                   @"image" : @"time_setting",
                                   @"label" : @"加热预约帮助",
                                   @"URL"   : @"%E5%8A%A0%E7%83%AD%E9%A2%84%E7%BA%A6.html"
                                   },
                               @{
                                   @"title" : @"理疗预约",
                                   @"image" : @"mode_setting",
                                   @"label" : @"理疗预约帮助",
                                   @"URL"   : @"%E7%90%86%E7%96%97%E9%A2%84%E7%BA%A6.html"
                                   },
                               @{
                                   @"title" : @"添加新设备",
                                   @"image" : @"ic_control",
                                   @"label" : @"添加新设备的流程",
                                   @"URL"   : @"%E6%B7%BB%E5%8A%A0%E6%96%B0%E8%AE%BE%E5%A4%87%E7%9A%84%E6%B5%81%E7%A8%8B.html"
                                   },
                               @{
                                   @"title" : @"功能优先级",
                                   @"image" : @"ic_heating",
                                   @"label" : @"各功能优先级说明",
                                   @"URL"   : @"%E5%90%84%E5%8A%9F%E8%83%BD%E5%92%8C%E4%BC%98%E5%85%88%E7%BA%A7%E8%AF%B4%E6%98%8E.html"
                                   },
                               @{
                                   @"title" : @"常见问题",
                                   @"image" : @"ic_problem",
                                   @"label" : @"常见问题及解决办法",
                                   @"URL"   : @"%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98%E5%8F%8A%E8%A7%A3%E5%86%B3%E5%8A%9E%E6%B3%95.html"
                                   },
                               ];
        
        NSArray *sqaures = [WTFHelpModel mj_objectArrayWithKeyValuesArray:dictArray];
        
        [self createHelpButtons:sqaures];
        
    }
    return self;
}

- (void)createHelpButtons:(NSArray *)helpButton
{
    // 一行最多4列
    int maxCols = 3;
    
    // 宽度和高度
    CGFloat buttonW = ScreenWidth / maxCols;
    CGFloat buttonH = 1.5 * buttonW;
    
    for (int i = 0; i<helpButton.count; i++) {
        // 创建按钮
        WTFHelpButton *button = [WTFHelpButton buttonWithType:UIButtonTypeCustom];
        // 监听点击
        [button addTarget:self action:@selector(buttonClick:) forControlEvents:UIControlEventTouchUpInside];
        // 传递模型
        button.helpBtnModel = helpButton[i];
        [self addSubview:button];
        
        // 计算frame
        int col = i % maxCols;
        int row = i / maxCols;
        
        button.x = col * buttonW;
        button.y = row * buttonH;
        button.width = buttonW;
        button.height = buttonH;
    }
    
    // 8个方块, 每行显示4个, 计算行数 8/4 == 2 2
    // 9个方块, 每行显示4个, 计算行数 9/4 == 2 3
    // 7个方块, 每行显示4个, 计算行数 7/4 == 1 2
    
    // 总行数
    //    NSUInteger rows = sqaures.count / maxCols;
    //    if (sqaures.count % maxCols) { // 不能整除, + 1
    //        rows++;
    //    }
    
    // 总页数 == (总个数 + 每页的最大数 - 1) / 每页最大数
    
    NSUInteger rows = (helpButton.count + maxCols - 1) / maxCols;
    
    // 计算footer的高度
    self.height = rows * buttonH;
    
    // 重绘
    [self setNeedsDisplay];
}

- (void)buttonClick:(WTFHelpButton *)button
{
    //if (![button.helpBtnModel.URL hasPrefix:@"http"]) return;
    
    WTFHelpContentController *helpVC = [[WTFHelpContentController alloc] init];
    helpVC.helpURL = [helpBaseURL stringByAppendingString:button.helpBtnModel.URL];
    helpVC.title = button.helpBtnModel.title;
    
    // 取出当前的导航控制器
    UITabBarController *tabBarVc = (UITabBarController *)[UIApplication sharedApplication].keyWindow.rootViewController;
    UINavigationController *nav = (UINavigationController *)tabBarVc.selectedViewController;
    [nav pushViewController:helpVC animated:YES];
}

@end
