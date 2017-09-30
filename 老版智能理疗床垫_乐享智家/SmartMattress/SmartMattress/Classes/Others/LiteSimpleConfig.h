//
//  RTKViewController.h
//  SimpleConfig
//
//  Created by realtek on 6/16/14.
//  Copyright (c) 2014 Realtek. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "Reachability.h"
#include "SimpleConfig.h"

/**
 * 错误代码
 */
typedef enum {
    CONFIG_ERR,         // 配置信息错误
    TIMEOUT,            // 执行超时
    WIFI_UNAVAILABLE    // Wi-Fi不可用
}LiteSimpleConfigErrCode;

@interface LiteSimpleConfig : NSObject

/**
 * @brief 初始化模块
 *
 * @ param appDelegete
 */
+ (void) init:(id) appDelegete;

/**
 * @brief 反初始化模块
 *
 */
+ (void) deInit;

/**
 * @brief 判断Wi-Fi是否可用
 *
 * @return Wi-Fi可用返回 YES，否则返回 NO
 */
+ (BOOL) isEnableWiFi;

/**
 * @brief 获取当前连接的Wi-Fi的SSID
 *
 * @return Wi-Fi的SSID
 */
+ (NSString*) getWiFiSSID;

/**
 * @brief 设置当期Wi-Fi的密码
 *
 * 该密码会在配网开始后以广播的方式发送给硬件
 *
 * @param password Wi-Fi密码
 *
 */
+ (void) setWiFiPassword:(NSString*)password;

/**
 * @brief 开始执行Wi-Fi配网
 *
 * 该方法为异步之行，不会阻塞当期线程
 *
 * @param success 配网成功回调
 * @param failure 配网失败回调
 * @param timeout 超时
 *
 */
+ (void) startConfigure:(void(^)(NSMutableArray *))success failure:(void(^)(LiteSimpleConfigErrCode))failure timeout:(int)timeout;

/**
 * @brief 取消Wi-Fi配网
 */
+ (void) cancelConfigure;

@end
