//
//  WTFMeViewController.m
//  SmartMattress
//
//  Created by William Cai on 2016/11/22.
//  Copyright © 2016年 lesmarthome. All rights reserved.
//

#import "WTFMeViewController.h"
#import "WTFDeviceManagementController.h"
#import "WTFLoginViewController.h"
#import "WTFPersonInfoController.h"

#import "WTFFlagModel.h"
#import "WTFPersonModel.h"
#import "WTFFlagDModel.h"
#import "WTFDeviceInfoModel.h"

#import "WTFMeBodyModel.h"
#import "WTFMeParamsModel.h"
#import "WTFMeInfoModel.h"

#import <MJExtension/MJExtension.h>
#import <AFNetworking/AFNetworking.h>
#import <SVProgressHUD/SVProgressHUD.h>

@interface WTFMeViewController ()

@property (weak, nonatomic) IBOutlet UIImageView *userImage;
@property (weak, nonatomic) IBOutlet UILabel *userNameLabel;
@property (weak, nonatomic) IBOutlet UITableView *userSettingTableView;

@property (strong , nonatomic) WTFPersonModel *model1;
@property (strong, nonatomic) NSDate *date;

@end

@implementation WTFMeViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view from its nib.
    
    [self initUserInfo];
    [self initTableView];
    
    // 设置HUD
    [SVProgressHUD setMinimumDismissTimeInterval:1];
    
}

- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:YES];
    
    [self getInfoData];
    
    // 修改状态栏颜色
    [[UIApplication sharedApplication] setStatusBarStyle:UIStatusBarStyleDefault];
    
}

- (void)initUserInfo {
    
    self.view.backgroundColor = GlobalBackground;
    
    self.userImage.image = [UIImage imageNamed:@"default_image"];
    self.userImage.layer.masksToBounds = YES;
    self.userImage.layer.cornerRadius = 50.0f;
    self.userImage.layer.borderWidth = 4.0f;
    self.userImage.layer.borderColor = [UIColor whiteColor].CGColor;
    
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    NSString *name = [defaults objectForKey:@"name"];
    
    if (name != nil) {
        self.userNameLabel.text = name;
    }
}

- (void)initTableView {
    self.userSettingTableView.scrollEnabled = NO;
    self.userSettingTableView.backgroundColor = [UIColor clearColor];
}

- (void)getInfoData {
    
    AFHTTPSessionManager *manager = [AFHTTPSessionManager manager];
    manager.responseSerializer.acceptableContentTypes = [NSSet setWithObjects:@"application/json", @"text/html", @"text/json", @"text/javascript", nil];
    
    manager.requestSerializer.timeoutInterval = 4.f;
    
    NSString *infoURL = @"/v1/user/get/base_info";
    NSString *secureURL = [infoURL getSecureUrl:infoURL];
    
    [manager GET:secureURL parameters:nil progress:nil success:^(NSURLSessionDataTask * _Nonnull task, id  _Nullable responseObject) {
        
        WTFMeInfoModel *infoModel = [WTFMeInfoModel mj_objectWithKeyValues:responseObject];
        
        NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
        [defaults setObject:infoModel.name forKey:@"name"];
        [defaults setInteger:infoModel.sex forKey:@"sex"];
        [defaults setObject:infoModel.birthday forKey:@"birthday"];
        
        self.userNameLabel.text = infoModel.name;
        
    } failure:^(NSURLSessionDataTask * _Nullable task, NSError * _Nonnull error) {
        [SVProgressHUD showErrorWithStatus:@"无网络连接"];
    }];
}

#pragma mark - Table view data source

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
    return 4;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath {
    
    static NSString *ProfileIdentifier = @"UserSettingCell";
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:ProfileIdentifier];
    if (cell == nil) {
        cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleValue1 reuseIdentifier:ProfileIdentifier];
    }
    
    // Configure the cell...
    
    cell.accessoryType = UITableViewCellAccessoryDisclosureIndicator;
    
    switch (indexPath.row) {
        case 0:
            
            cell.imageView.image = [UIImage imageNamed:@"user_info_icon"];
            cell.textLabel.text = @"个人设置";
            
            break;
            
        case 1:
            
            cell.imageView.image = [UIImage imageNamed:@"devices_setting_icon"];
            cell.textLabel.text = @"管理设备";
            
            break;
            
        case  2:
            
            cell.imageView.image = [UIImage imageNamed:@"logout_icon"];
            cell.textLabel.text = @"登出";
        default:
            break;
    }
    
    return cell;
}

#pragma mark - Table view delegate

// In a xib-based application, navigation from a table can be handled in -tableView:didSelectRowAtIndexPath:
- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
    
    if(indexPath.row == 0) {
        
        WTFPersonInfoController *infoVC = [[WTFPersonInfoController alloc] init];
        [self.navigationController pushViewController:infoVC animated:YES];
        
    }
    
    if (indexPath.row == 1) {
        WTFDeviceManagementController *deviceManagementViewController = [[WTFDeviceManagementController alloc] init];
        
        [self.navigationController pushViewController:deviceManagementViewController animated:YES];
        // 点击此处返回的是绑定设备的信息 params内数组元素的个数是已绑定的设备数 如果没有绑定设备params为空 可以根据这个来确定cell数 各个参数意思可以看model的说明
    }
    
    if (indexPath.row == 2) {
        
        UIAlertController *alertController = [UIAlertController alertControllerWithTitle:@"通知" message:@"确定要退出吗?" preferredStyle:UIAlertControllerStyleAlert];
        
        UIAlertAction *noAction = [UIAlertAction actionWithTitle:@"取消" style:UIAlertActionStyleCancel handler:^(UIAlertAction * _Nonnull action) {
            nil;
        }];
        
        UIAlertAction *yesAction = [UIAlertAction actionWithTitle:@"确定" style:UIAlertActionStyleDestructive handler:^(UIAlertAction * _Nonnull action) {
            
            NSString *appDomain = [[NSBundle mainBundle] bundleIdentifier];
            [[NSUserDefaults standardUserDefaults] removePersistentDomainForName:appDomain];
            
            WTFLoginViewController *loginVC = [[WTFLoginViewController alloc] init];
            UINavigationController *loginNav = [[UINavigationController alloc] initWithRootViewController:loginVC];
            [UIApplication sharedApplication].keyWindow.rootViewController = loginNav;
            
//            AFHTTPSessionManager *manager = [AFHTTPSessionManager manager];
//            manager.responseSerializer.acceptableContentTypes = [NSSet setWithObjects:@"application/json", @"text/html", @"text/json", @"text/javascript", nil];
//            
//            manager.requestSerializer.timeoutInterval = 5.f;
//            
//            NSString *logoutURL = @"/v1/user/logout";
//            NSString *secureURL = [logoutURL getSecureUrl:logoutURL];
//            
//            [SVProgressHUD show];
//            [manager GET:secureURL parameters:nil progress:nil success:^(NSURLSessionDataTask * _Nonnull task, id  _Nullable responseObject) {
//                
//                [SVProgressHUD dismiss];
//                
//                WTFFlagModel *flagModel = [WTFFlagModel mj_objectWithKeyValues:responseObject];
//                
//                if (flagModel.flag) {
//                    
//                    NSString *appDomain = [[NSBundle mainBundle] bundleIdentifier];
//                    [[NSUserDefaults standardUserDefaults] removePersistentDomainForName:appDomain];
//                    
//                    WTFLoginViewController *loginVC = [[WTFLoginViewController alloc] init];
//                    UINavigationController *loginNav = [[UINavigationController alloc] initWithRootViewController:loginVC];
//                    
//                    [UIApplication sharedApplication].keyWindow.rootViewController = loginNav;
//                    
//                }
//            } failure:^(NSURLSessionDataTask * _Nullable task, NSError * _Nonnull error) {
//                [SVProgressHUD showErrorWithStatus:@"无网络连接"];
//            }];
            
        }];
        
        [alertController addAction:noAction];
        [alertController addAction:yesAction];
        
        [self presentViewController:alertController animated:YES completion:nil];
    }
    
    [tableView deselectRowAtIndexPath:indexPath animated:YES];
}

- (CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath {
    return 50;
}

@end
