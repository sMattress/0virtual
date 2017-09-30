//
//  AppDelegate.m
//  SmartMattress
//
//  Created by William Cai on 2016/11/22.
//  Copyright © 2016年 lesmarthome. All rights reserved.
//

#import "AppDelegate.h"
#import "WTFLoginViewController.h"
#import "WTFMainViewController.h"

#import "LiteSimpleConfig.h"
#import <SMS_SDK/SMSSDK.h>
#import <AFNetworking/AFNetworking.h>
#import <SVProgressHUD/SVProgressHUD.h>

#define appkey @"1b7e634a3263c"
#define app_secrect @"0ac383a16068625a260d0abf83bd8c55"

@interface AppDelegate ()

@end

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    // Override point for customization after application launch.
    
    // 创建窗口
    self.window = [[UIWindow alloc] init];
    self.window.frame = [UIScreen mainScreen].bounds;
    
    [SMSSDK registerApp:appkey
             withSecret:app_secrect];
    
    // 获取本地token
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    NSInteger tokenTime = [defaults integerForKey:@"tokenTime"];
    NSString *token = [defaults objectForKey:@"token"];
    NSDate *loginDate = [defaults objectForKey:@"loginTime"];
    
    WTFMainViewController *mainVC = [[WTFMainViewController alloc] init];
    
    WTFLoginViewController *loginVC = [[WTFLoginViewController alloc] init];
    UINavigationController *loginNav = [[UINavigationController alloc] initWithRootViewController:loginVC];
    
    if (token == nil) {
        
        //设置窗口的根控制器
        self.window.rootViewController = loginNav;
        
    } else {
        
        if ((tokenTime + loginDate.timeIntervalSinceNow) > 0) {
            
            //self.window.rootViewController = mainVC;
            
            AFHTTPSessionManager *manager = [AFHTTPSessionManager manager];
            manager.responseSerializer.acceptableContentTypes = [NSSet setWithObjects:@"application/json", @"text/html", @"text/json", @"text/javascript", nil];
            
            manager.requestSerializer.timeoutInterval = 4.f;
            
            NSString *validateURL = @"/v1/sys/validate/token";
            NSString *secureURL = [validateURL getSecureUrl:validateURL];
            
            self.window.rootViewController = mainVC;
            
            [manager GET:secureURL parameters:nil progress:nil success:^(NSURLSessionDataTask * _Nonnull task, id  _Nullable responseObject) {
                
                if (![responseObject[@"flag"] integerValue]) {
                    
                    self.window.rootViewController = loginNav;
                    
                }
                
            } failure:^(NSURLSessionDataTask * _Nullable task, NSError * _Nonnull error) {
                
                [SVProgressHUD showErrorWithStatus:@"无法连接到网络"];
                
            }];
            
        } else {
            
            self.window.rootViewController = loginNav;
            
        }
    }
    
    [LiteSimpleConfig init:self];
    
    //显示窗口
    [self.window makeKeyAndVisible];
    
    return YES;
}

- (void)applicationWillResignActive:(UIApplication *)application {
    // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
    // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
}


- (void)applicationDidEnterBackground:(UIApplication *)application {
    // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
    // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
}


- (void)applicationWillEnterForeground:(UIApplication *)application {
    // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
}


- (void)applicationDidBecomeActive:(UIApplication *)application {
    // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
}


- (void)applicationWillTerminate:(UIApplication *)application {
    // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    [defaults setObject:@"0" forKey:@"save"];
    [defaults synchronize];
}

- (void)getNetworkState {
    [[AFNetworkReachabilityManager sharedManager] startMonitoring];
    [[AFNetworkReachabilityManager sharedManager] setReachabilityStatusChangeBlock:^(AFNetworkReachabilityStatus status) {
        switch (status) {
            case -1:
                NSLog(@"网络状态: 未知网络");
                break;
                
            case 0:
                NSLog(@"网络状态: 网络不可达");
                break;
                
            case 1:
                NSLog(@"网络状态: GPRS网络");
                break;
                
            case 2:
                NSLog(@"网络状态: wifi网络");
                break;
                
            default:
                break;
        }
        if (status == AFNetworkReachabilityStatusReachableViaWWAN || status == AFNetworkReachabilityStatusReachableViaWiFi) {
            NSLog(@"网络状态: 有网");
        } else {
            NSLog(@"网络状态: 没有网");
            UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"网络失去连接"
                                                            message:nil
                                                           delegate:self
                                                  cancelButtonTitle:@"取消"
                                                  otherButtonTitles:nil, nil];
            alert.delegate = self;
            [alert show];
        }
    }];
}

@end
