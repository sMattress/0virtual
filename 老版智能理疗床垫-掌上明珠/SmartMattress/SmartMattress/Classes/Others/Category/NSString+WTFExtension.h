//
//  NSString+WTFExtension.h
//  SmartMattress
//
//  Created by William Cai on 2016/12/9.
//  Copyright © 2016年 lesmarthome. All rights reserved.
//

#import <Foundation/Foundation.h>

#define SERVER_URL "https://smartmattress.lesmarthome.com"

@interface NSString (WTFExtension)

- (NSString *)stringByMD5Encryption:(NSString *)inputString;

- (NSString *)getSecurePassword:(NSString *)password code:(NSInteger)code;

//- (NSString *)getSignWithURL:(NSString *)actionUrl account:(NSString *)account;

- (NSString *)getSecureUrl:(NSString *)actionURL;

- (BOOL)isValidatePhone;

- (BOOL)isValidatePassword;

- (BOOL)isValidateWiFiPassword;

@end
