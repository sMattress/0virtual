//
//  WTFLoginViewController.m
//  SmartMattress
//
//  Created by William Cai on 2016/11/25.
//  Copyright © 2016年 lesmarthome. All rights reserved.
//

#import "WTFLoginViewController.h"
#import "WTFMainViewController.h"
#import "WTFForgetPasswordController.h"
#import "WTFDeviceManagementController.h"
#import "CustomNavigationController.h"

#import "WTFLoginCodeModel.h"
#import "WTFLoginTokenModel.h"

#import "WTFFlagDModel.h"

#import <MJExtension/MJExtension.h>
#import <AFNetworking/AFNetworking.h>
#import <SVProgressHUD/SVProgressHUD.h>

@interface WTFLoginViewController ()

@property (weak, nonatomic) IBOutlet UITextField *loginPhoneField;
@property (weak, nonatomic) IBOutlet UITextField *loginPasswordField;
@property (weak, nonatomic) IBOutlet UITextField *registPhoneField;
@property (weak, nonatomic) IBOutlet UITextField *registPasswordField;

@property (weak, nonatomic) IBOutlet UIButton *loginButton;
@property (weak, nonatomic) IBOutlet UIButton *registButton;

@property (weak, nonatomic) IBOutlet UILabel *loginWarningLabel;
@property (weak, nonatomic) IBOutlet UILabel *registWarningLabel;

@property (weak, nonatomic) IBOutlet UIButton *loginViewSwitchButton;
@property (weak, nonatomic) IBOutlet UIButton *registViewSwitchButton;
@property (weak, nonatomic) IBOutlet NSLayoutConstraint *loginViewLeftMargin;

@property (weak, nonatomic) UIButton *selectedButton;

@property (strong, nonatomic) UIWindow *window;

@end

@implementation WTFLoginViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view from its nib.
    
    [self setupView];
}

- (void)setupView {
    
    // 设置UI布局
    
    self.loginViewSwitchButton.enabled = NO;
    
    [self.loginPhoneField setValue:[UIColor colorWithWhite:1 alpha:0.7] forKeyPath:@"_placeholderLabel.textColor"];
    [self.loginPasswordField setValue:[UIColor colorWithWhite:1 alpha:0.7] forKeyPath:@"_placeholderLabel.textColor"];
    [self.registPhoneField setValue:[UIColor colorWithWhite:1 alpha:0.7] forKeyPath:@"_placeholderLabel.textColor"];
    [self.registPasswordField setValue:[UIColor colorWithWhite:1 alpha:0.7] forKeyPath:@"_placeholderLabel.textColor"];
    
    // 设置HUD
    [SVProgressHUD setMinimumDismissTimeInterval:1];
    
    // 设置警告框
    self.loginWarningLabel.hidden = YES;
    self.registWarningLabel.hidden = YES;
    
}

- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];
    
    // 修改状态栏颜色
    [[UIApplication sharedApplication] setStatusBarStyle:UIStatusBarStyleLightContent];
    
    [self.navigationController setNavigationBarHidden:YES animated:YES];
}

- (void)viewWillDisappear:(BOOL)animated {
    [super viewWillDisappear:animated];
    
    // 修改状态栏颜色
    [[UIApplication sharedApplication] setStatusBarStyle:UIStatusBarStyleDefault];
    
    [self.navigationController setNavigationBarHidden:NO animated:YES];
    
}

/*
- (void)touchesBegan:(NSSet<UITouch *> *)touches withEvent:(nullable UIEvent *)event{
    
    if(!([_cellphoneField isExclusiveTouch] || [_passwordField isExclusiveTouch]) ) {
        [self.view endEditing:YES];
        [_cellphoneField resignFirstResponder];
        [_passwordField resignFirstResponder];
        self.disablesAutomaticKeyboardDismissal = NO;
    }
}*/

- (IBAction)loginViewSwitch:(UIButton *)sender {
    
    self.registWarningLabel.hidden = YES;
    
    self.loginViewSwitchButton.enabled = NO;
    self.registViewSwitchButton.enabled = YES;
    
    self.loginViewLeftMargin.constant = 0;
    
    [UIView animateWithDuration:0.25 animations:^{
        [self.view layoutIfNeeded];
    }];
}

- (IBAction)registViewSwitch:(UIButton *)sender {
    
    self.loginWarningLabel.hidden = YES;
    
    self.registViewSwitchButton.enabled = NO;
    self.loginViewSwitchButton.enabled = YES;
    
    self.loginViewLeftMargin.constant = -self.view.width;
    
    [UIView animateWithDuration:0.25 animations:^{
        [self.view layoutIfNeeded];
    }];
}

- (IBAction)loginButtonClick:(UIButton *)sender {
    
    if ([self.loginPhoneField.text isValidatePhone]) {
        if ([self.loginPasswordField.text isValidatePassword]) {
            [SVProgressHUD show];
            AFHTTPSessionManager *manager = [AFHTTPSessionManager manager];
            manager.responseSerializer.acceptableContentTypes = [NSSet setWithObjects:@"application/json", @"text/html", @"text/json", @"text/javascript", nil];
            
            manager.requestSerializer.timeoutInterval = 5.f;
            
            NSString *verificationCodeURL = @"https://smartmattress.lesmarthome.com/v1/user/code";
            
            NSMutableDictionary *paramDict = [NSMutableDictionary dictionary];
            [paramDict setObject:self.loginPhoneField.text forKey:@"account"];
            
            [manager GET:verificationCodeURL parameters:paramDict progress:nil success:^(NSURLSessionDataTask * _Nonnull task, id  _Nullable responseObject) {
                
                //已经忘了mj系列怎么用了 所以使用了最原始的办法 希望后来的同志们再进行优化
                WTFLoginCodeModel *codeModel = [WTFLoginCodeModel mj_objectWithKeyValues:responseObject];
                
                if (codeModel.flag == 1) {
                    
                    // 对密码加密
                    NSString *securePassword = [self.loginPasswordField.text getSecurePassword:self.loginPasswordField.text code:codeModel.code];
                    
                    NSString *loginURL = @"https://smartmattress.lesmarthome.com/v1/user/login";
                    NSDictionary *paramDic = @{@"account": self.loginPhoneField.text, @"password": securePassword};
                    
                    [manager GET:loginURL parameters:paramDic progress:nil success:^(NSURLSessionDataTask * _Nonnull task, id  _Nullable responseObject) {
                        
                        WTFLoginTokenModel *tokenModel = [WTFLoginTokenModel mj_objectWithKeyValues:responseObject];
                        
                        if (tokenModel.flag) {
                            
                            NSDate *loginDate = [NSDate date];
                            
                            NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
                            [defaults setObject:loginDate forKey:@"loginTime"];
                            [defaults setObject:tokenModel.token forKey:@"token"];
                            [defaults setInteger:tokenModel.expires_in forKey:@"tokenTime"];
                            [defaults setObject:self.loginPhoneField.text forKey:@"account"];
                            [defaults synchronize];
                            
                            WTFMainViewController *MainVC = [[WTFMainViewController alloc]  init];
                            [UIApplication sharedApplication].keyWindow.rootViewController = MainVC;
                            
                        } else {
                            [SVProgressHUD dismiss];
                            self.loginWarningLabel.hidden = NO;
                            self.loginWarningLabel.text = @"账号或密码错误";
                        }
                        
                    } failure:^(NSURLSessionDataTask * _Nullable task, NSError * _Nonnull error) {
                        //[SVProgressHUD showErrorWithStatus:@"无网络连接"];
                    }];
                } else if (codeModel.flag == 0) {
                    switch (codeModel.err_code) {
                        case 17:
                            self.loginWarningLabel.hidden = NO;
                            self.loginWarningLabel.text = @"账号不存在";
                            break;
                            
                        default:
                            break;
                    }
                }
                
                [SVProgressHUD dismiss];
                
            } failure:^(NSURLSessionDataTask * _Nullable task, NSError * _Nonnull error) {
                NSLog(@"Error: %@", error);
                [SVProgressHUD showErrorWithStatus:@"无网络连接"];
            }];
        } else {
            self.loginWarningLabel.hidden = NO;
            self.loginWarningLabel.text = @"密码必须以字母开头，且长度大于8位";
        }
    } else {
        self.loginWarningLabel.hidden = NO;
        self.loginWarningLabel.text = @"请输入正确的手机号";
    }
}

- (IBAction)registButtonClick:(UIButton *)sender {
    
    if ([self.registPhoneField.text isValidatePhone]) {
        if ([self.registPasswordField.text isValidatePassword]) {
            
            [SVProgressHUD show];
            AFHTTPSessionManager *manager = [AFHTTPSessionManager manager];
            manager.responseSerializer.acceptableContentTypes = [NSSet setWithObjects:@"application/json", @"text/html", @"text/json", @"text/javascript", nil];
            
            manager.requestSerializer.timeoutInterval = 5.f;
            
            NSString *registerURL = @"https://smartmattress.lesmarthome.com/v1/user/register";
            NSDictionary *paramDict = @{@"account": self.registPhoneField.text, @"password": self.registPasswordField.text};
            
            [manager POST:registerURL parameters:paramDict progress:nil success:^(NSURLSessionDataTask * _Nonnull task, id  _Nullable responseObject) {
                
                WTFLoginCodeModel *backModel = [WTFLoginCodeModel mj_objectWithKeyValues:responseObject];
                
                if (backModel.flag == 1) {
                    
                    // 注册成功 将页面移到登录
                    self.loginViewSwitchButton.enabled = NO;
                    self.registViewSwitchButton.enabled = YES;
                    
                    self.loginViewLeftMargin.constant = 0;
                    
                    [UIView animateWithDuration:0.25 animations:^{
                        [self.view layoutIfNeeded];
                    }];
                    
                    // 自动填充注册的账号密码
                    self.loginPhoneField.text = self.registPhoneField.text;
                    self.loginPasswordField.text = self.registPasswordField.text;
                    
                    [SVProgressHUD showSuccessWithStatus:@"注册成功"];
                    
                } else if (backModel.flag == 0) {
                    
                    switch (backModel.err_code) {
                        case 16:
                            self.registWarningLabel.hidden = NO;
                            self.registWarningLabel.text = @"账号已存在";
                            break;
                            
                        default:
                            break;
                    }
                }
                
                [SVProgressHUD dismiss];
                
            } failure:^(NSURLSessionDataTask * _Nullable task, NSError * _Nonnull error) {
                [SVProgressHUD showErrorWithStatus:@"无网络连接"];
            }];
        } else {
            self.registWarningLabel.hidden = NO;
            self.registWarningLabel.text = @"密码必须以字母开头，且长度大于8位";
        }
    } else {
        self.registWarningLabel.hidden = NO;
        self.registWarningLabel.text = @"请输入正确的手机号";
    }
}


- (IBAction)forgetPwdButtonClick:(UIButton *)sender {
    WTFForgetPasswordController *forgetPwdVC = [[WTFForgetPasswordController alloc] init];
    
    UIBarButtonItem *backButton = [[UIBarButtonItem alloc] init];
    backButton.title = @"返回登录";
    self.navigationItem.backBarButtonItem = backButton;
    self.navigationController.navigationBar.tintColor = [UIColor whiteColor];
    
    [self.navigationController.navigationBar setBackgroundImage:[UIImage new] forBarMetrics:0];
    self.navigationController.navigationBar.shadowImage = [UIImage new];
    
    [self.navigationController pushViewController:forgetPwdVC animated:YES];
}

@end
