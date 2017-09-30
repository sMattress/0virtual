//
//  WTFMainViewController.m
//  SmartMattress
//
//  Created by William Cai on 2016/11/22.
//  Copyright © 2016年 lesmarthome. All rights reserved.
//

#import "WTFMainViewController.h"
#import "WTFSettingViewController.h"
#import "WTFHelpViewController.h"
#import "WTFMeViewController.h"
#import "WTFDeviceManagementController.h"

#import "CustomNavigationController.h"

#import "AFNetworking.h"

@interface WTFMainViewController ()

@end

@implementation WTFMainViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.
    
    [self addChildViewController];
    //self.navigationController.navigationItem.backBarButtonItem.accessibilityElementsHidden = YES;
    
}

- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:YES];
    
    [self versionChanged];
    
    self.navigationController.navigationBar.hidden = YES;
}

- (void)addChildViewController {
    
    self.tabBar.tintColor = RGBColor(20, 40, 90);
    /*
    if (HardwareID == nil) {
        WTFDeviceManagementController *deviceVC = [[WTFDeviceManagementController alloc] init];
        CustomNavigationController *deviceNav = [[CustomNavigationController alloc] initWithRootViewController:deviceVC];
        [self addChildViewController:deviceNav];
        deviceNav.view.frame = CGRectMake(0, 0, ScreenWidth, ScreenHeight - 49);
        [self.view addSubview:deviceNav.view];
    } else {
        [self setChildViewController:[[WTFSettingViewController alloc] init] title:@"设置" image:@"setting_unselect" selectedImage:@"setting_selected"];
    }*/
    
    [self setChildViewController:[[WTFSettingViewController alloc] init] title:@"设置" image:@"setting_unselect" selectedImage:@"setting_selected"];
    
    [self setChildViewController:[[WTFHelpViewController alloc] init] title:@"帮助" image:@"help_unselect" selectedImage:@"help_selected"];
    
    [self setChildViewController:[[WTFMeViewController alloc] init] title:@"我" image:@"me_selected" selectedImage:@"me_selected"];
    
}

- (void)setChildViewController:(UIViewController *)childController title:(NSString *)title image:(NSString *)image selectedImage:(NSString *)selectedImage {
    // 设置文字和图片
    //vc.navigationItem.title = title;
    //vc.tabBarItem.title = title;
    childController.title = title;
    childController.tabBarItem.image = [UIImage imageNamed:image];
    childController.tabBarItem.selectedImage = [UIImage imageNamed:selectedImage];
    
    // 包装一个导航控制器, 添加导航控制器为tabbarcontroller的子控制器
    CustomNavigationController *nav = [[CustomNavigationController alloc] initWithRootViewController:childController];
    [self addChildViewController:nav];
    
}

#pragma mark - 版本更新

- (void)versionChanged {
    
    NSString *versionURL = @"https://itunes.apple.com/cn/lookup?id=1178654680";
    
    AFHTTPSessionManager *manager = [AFHTTPSessionManager manager];
    manager.responseSerializer.acceptableContentTypes = [NSSet setWithObjects:@"application/json", @"text/html", @"text/json", @"text/javascript", nil];
    
    [manager POST:versionURL parameters:nil progress:nil success:^(NSURLSessionDataTask * _Nonnull task, id  _Nullable responseObject) {
        
        NSArray *resultArray = responseObject[@"results"];
        NSDictionary *appInfo = [resultArray objectAtIndex:0];
        NSString *version = appInfo[@"version"];
        
        NSString *onlineVersion = version;
        NSString *localVersion = [self getCurrentVersion];
        
        if ([onlineVersion isEqualToString:localVersion]) {
            return;
        } else {
            BOOL needUpdate = [self needUpdate:onlineVersion compareCurrentVersion:localVersion];
            if (needUpdate) {
                [self showAlertViewToRemindUserUpdateApp];
            } else {
                return;
            }
        }
        
    } failure:^(NSURLSessionDataTask * _Nullable task, NSError * _Nonnull error) {
        
    }];
    
}

// 获取当前版本
- (NSString *)getCurrentVersion {
    
    NSString *version = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"CFBundleShortVersionString"];
    return  version;
}

// 判断版本号
- (BOOL)needUpdate:(NSString *)serverVersion compareCurrentVersion:(NSString *)currentVersion {
    
    NSArray *arrayNewVersion = [serverVersion componentsSeparatedByString:@"."];
    NSArray *arrayOldVersion = [currentVersion componentsSeparatedByString:@"."];
    
    NSInteger count = arrayOldVersion.count > arrayNewVersion.count ? arrayNewVersion.count : arrayOldVersion.count;
    
    for (int i = 0; i < count; i ++) {
        NSString *newVersionStr = arrayNewVersion[i];
        NSString *oldVersionStr = arrayOldVersion[i];
        
        if ([newVersionStr integerValue] > [oldVersionStr integerValue]) {
            return YES;
        } else if ([newVersionStr integerValue] < [oldVersionStr integerValue]) {
            return NO;
        }
    }
    
    if (arrayOldVersion.count < arrayNewVersion.count) {
        return YES;
    }
    
    return NO;
}

// 更新提示弹框
- (void)showAlertViewToRemindUserUpdateApp {
    
    UIAlertController *alertVC = [UIAlertController alertControllerWithTitle:@"发现新版本" message:@"新的客户端已经上线，请及时更新以免影响床垫的使用" preferredStyle:UIAlertControllerStyleAlert];
    
    UIAlertAction *cancelAction = [UIAlertAction actionWithTitle:@"暂不更新" style:UIAlertActionStyleDefault handler:nil];
    
    UIAlertAction *updateAction = [UIAlertAction actionWithTitle:@"立即更新" style:UIAlertActionStyleDefault handler:^(UIAlertAction * _Nonnull action) {
        
        NSString *trackURL = @"https://itunes.apple.com/cn/app/zhi-neng-chuang-dian-le-xiang/id1178654680?mt=8&uo=4";
        
        [[UIApplication sharedApplication] openURL:[NSURL URLWithString:trackURL]];
        
    }];
    
    [alertVC addAction:cancelAction];
    [alertVC addAction:updateAction];
    
    [self presentViewController:alertVC animated:YES completion:nil];
}

@end
