//
//  NSString+WTFExtension.m
//  SmartMattress
//
//  Created by William Cai on 2016/12/9.
//  Copyright © 2016年 lesmarthome. All rights reserved.
//

#import "NSString+WTFExtension.h"
#import <CommonCrypto/CommonCrypto.h>

#define CC_MD5_DIGEST_LENGTH 16

@implementation NSString (WTFExtension)


- (NSString *)stringByMD5Encryption:(NSString *)inputString {
    
    const char *cStr = [inputString UTF8String];
    
    unsigned char digest[CC_MD5_DIGEST_LENGTH];
    
    CC_MD5(cStr, (CC_LONG)strlen(cStr), digest);
    
    NSMutableString *output = [NSMutableString stringWithCapacity:CC_MD5_DIGEST_LENGTH * 2];
    
    for (int i = 0; i < CC_MD5_DIGEST_LENGTH; i++) {
        
        [output appendFormat:@"%02x", digest[i]];
        
    }
    
    return output;
}

- (NSString *)getSecurePassword:(NSString *)password code:(NSInteger)code {
    NSString* codeStr = [NSString stringWithFormat:@"%ld", (long)code];
    NSString* securePassword = [self stringByMD5Encryption:[password stringByAppendingString:codeStr]];
    return securePassword;
}

- (NSString *)getSignWithURL:(NSString *)actionUrl account:(NSString *)account {
    
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    NSString *token = [defaults objectForKey:@"token"];
    
    NSString *timestamp = [NSString stringWithFormat:@"%0.f", [[NSDate date] timeIntervalSince1970]];
    
    NSString *baseUrl = [NSString stringWithFormat:@"%@?account=%@&timestamp=%@&token=%@", actionUrl, account,timestamp,token];
    
    NSString *sign = [self stringByMD5Encryption:baseUrl];
    
    return sign;
}

- (NSString *)getSecureUrl:(NSString *)actionUrl {
    
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    NSString *account = [defaults objectForKey:@"account"];
    NSString *token = [defaults objectForKey:@"token"];
    
    NSString *timestamp = [NSString stringWithFormat:@"%0.f", [[NSDate date] timeIntervalSince1970]];
    
    NSString *baseUrl = [NSString stringWithFormat:@"%@?account=%@&timestamp=%@&token=%@", actionUrl, account,timestamp,token];
    NSString *sign = [self stringByMD5Encryption:baseUrl];
    
    NSString *secureUrl = [NSString stringWithFormat:@"%s%@?account=%@&timestamp=%@&sign=%@", SERVER_URL, actionUrl, account, timestamp, sign];
    
    return secureUrl;
}

- (BOOL)isValidateByRegex:(NSString *)regex {
    
    NSPredicate *predicate = [NSPredicate predicateWithFormat:@"SELF MATCHES %@", regex];
    
    return [predicate evaluateWithObject:self];
}

- (BOOL)isValidatePhone {
    
    NSString *cellphoneRegex = @"^1[345678]\\d{9}$";
    
    return [self isValidateByRegex:cellphoneRegex];
}

- (BOOL)isValidatePassword {
    
    NSString *passwordRegex = @"^[a-zA-Z][\\w/^]{7,32}$";
    
    return [self isValidateByRegex:passwordRegex];
}

- (BOOL)isValidateWiFiPassword {
    
    NSString *passwordRegex = @"^\\w{8,}$";
    
    return [self isValidateByRegex:passwordRegex];
}

@end
