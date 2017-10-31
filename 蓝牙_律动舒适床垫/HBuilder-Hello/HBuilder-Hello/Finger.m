//
//  Finger.m
//  HBuilder
//
//  Created by 李科 on 2017/10/19.
//  Copyright © 2017年 DCloud. All rights reserved.
//

#import "Finger.h"
#import <LocalAuthentication/LocalAuthentication.h>
@implementation Finger
-(void)can:(PGMethod*)command{
    if(command) {
        NSString* cbId = [command.arguments objectAtIndex:0];
        LAContext *lacontent = [[LAContext alloc] init];
        NSError *error = nil;
        if([lacontent canEvaluatePolicy:LAPolicyDeviceOwnerAuthenticationWithBiometrics error:&error]){
            [self toSucessCallback:cbId withInt:1];
        } else {
            [self toSucessCallback:cbId withInt:0];
        }
        
    }
}
-(void)use:(PGMethod*)command{
    if(command) {
        NSString* cbId = [command.arguments objectAtIndex:0];
        NSString* pArgument1 = [command.arguments objectAtIndex:1];
        LAContext *lacontent = [[LAContext alloc] init];
        NSError *error = nil;
        if([lacontent canEvaluatePolicy:LAPolicyDeviceOwnerAuthenticationWithBiometrics error:&error]){
            [lacontent evaluatePolicy:LAPolicyDeviceOwnerAuthenticationWithBiometrics localizedReason:pArgument1 reply:^(BOOL success, NSError * _Nullable error) {
                NSMutableDictionary *result = [NSMutableDictionary dictionary];
                if(success){
                    [result setValue:@"" forKey:@"error"];
                } else {
                    NSString *errorMsg;
                    switch (error.code) {
                        case LAErrorSystemCancel:
                        {
                            errorMsg = @"切换到其他APP，系统取消验证Touch ID";
                            break;
                        }
                        case LAErrorUserCancel:
                        {
                            errorMsg = @"用户取消验证Touch ID";
                            break;
                        }
                        case LAErrorUserFallback:
                        {
                            errorMsg = @"用户选择输入密码，切换主线程处理";
                            break;
                        }
                        default:
                        {
                            errorMsg = @"其他情况，切换主线程处理";
                            break;
                        }
                    }
                    [result setValue:errorMsg forKey:@"error"];
                }
                NSData *data=[NSJSONSerialization dataWithJSONObject:result options:NSJSONWritingPrettyPrinted error:nil];
                NSString *jsonStr=[[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
                [self toSucessCallback:cbId withString:jsonStr];
            }];
        } else {
            [self toSucessCallback:cbId withInt:0];
        }
    }
    
}
@end
