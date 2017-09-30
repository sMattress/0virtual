//
//  WTFForgetPasswordController.m
//  SmartMattress
//
//  Created by William Cai on 2016/12/10.
//  Copyright © 2016年 lesmarthome. All rights reserved.
//

#import "WTFForgetPasswordController.h"

#import <SMS_SDK/SMSSDK.h>
#import <AFNetworking/AFNetworking.h>
#import <SVProgressHUD/SVProgressHUD.h>

@interface WTFForgetPasswordController ()

@property (weak, nonatomic) IBOutlet UITextField *phoneField;
@property (weak, nonatomic) IBOutlet UITextField *pwdField;
@property (weak, nonatomic) IBOutlet UITextField *smsField;
@property (weak, nonatomic) IBOutlet UIImageView *getSMSImage;
@property (weak, nonatomic) IBOutlet UIButton *getSMSBtn;
@property (weak, nonatomic) IBOutlet UILabel *warningLabel;
@property (weak, nonatomic) IBOutlet UIButton *confirmBtn;

@end

@implementation WTFForgetPasswordController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view from its nib.
    [self setupView];
}

- (void)setupView {
    self.warningLabel.hidden = YES;
    
    [self.phoneField setValue:[UIColor colorWithWhite:1 alpha:0.7] forKeyPath:@"_placeholderLabel.textColor"];
    [self.pwdField setValue:[UIColor colorWithWhite:1 alpha:0.7] forKeyPath:@"_placeholderLabel.textColor"];
    [self.smsField setValue:[UIColor colorWithWhite:1 alpha:0.7] forKeyPath:@"_placeholderLabel.textColor"];
    
    //[self.getSMSBtn setTitle:@"获取验证码" forState:UIControlStateNormal];
    //self.getSMSBtn.backgroundColor = RGBColor(25, 58, 107);
    
    // 设置HUD
    [SVProgressHUD setMinimumDismissTimeInterval:1];
    
    // 设置警告框
    self.warningLabel.hidden = YES;
}

- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];
    
    // 修改状态栏颜色
    [[UIApplication sharedApplication] setStatusBarStyle:UIStatusBarStyleLightContent];
}

- (void)viewWillDisappear:(BOOL)animated {
    [super viewWillDisappear:animated];
    
    // 修改状态栏颜色
    [[UIApplication sharedApplication] setStatusBarStyle:UIStatusBarStyleDefault];
}

- (IBAction)sendSMSClick:(UIButton *)sender {
    
    if ([self.phoneField.text isValidatePhone]) {
        
        [self timeCountDown];
        
    } else {
        
        self.warningLabel.hidden = NO;
        self.warningLabel.text = @"请输入正确的手机号";
    }
    
}

- (IBAction)confirmClick:(UIButton *)sender {
    
    if ([self.phoneField.text isValidatePhone]) {
        
        if ([self.pwdField.text isValidatePassword]) {
            
            if (self.smsField.text.length != 0) {
                
                AFHTTPSessionManager *manager = [AFHTTPSessionManager manager];
                manager.responseSerializer.acceptableContentTypes = [NSSet setWithObjects:@"application/json", @"text/html", @"text/json", @"text/javascript", nil];
                
                manager.requestSerializer.timeoutInterval = 5.f;
                
                NSDictionary *paramDic = @{@"new_password": self.pwdField.text, @"sms": self.smsField.text};
                
                NSString *resetPwdURL = [NSString stringWithFormat:@"https://smartmattress.lesmarthome.com/v1/user/forget/secure_info?account=%@&platform=ios", self.phoneField.text];
                
                [SVProgressHUD show];
                 
                [manager POST:resetPwdURL parameters:paramDic progress:nil success:^(NSURLSessionDataTask * _Nonnull task, NSDictionary * responseObject) {
                    
                    [SVProgressHUD dismiss];
                    
                    if ([responseObject[@"flag"] integerValue]) {
                        
                        [SVProgressHUD showSuccessWithStatus:@"更改成功"];
                        [self.navigationController popViewControllerAnimated:YES];
                    } else {
                        
                        [SVProgressHUD showErrorWithStatus:@"更改失败，请重试"];
                    }
                
                } failure:^(NSURLSessionDataTask * _Nullable task, NSError * _Nonnull error) {
                    [SVProgressHUD showErrorWithStatus:@"无网络连接"];
                    NSLog(@"%@", error);
                }];
                
            } else {
                
                self.warningLabel.hidden = NO;
                self.warningLabel.text = @"请输入验证码";
            }
        } else {
            
            self.warningLabel.hidden = NO;
            self.warningLabel.text = @"密码必须以字母开头，且长度大于8位";
        }
    } else {
        
        self.warningLabel.hidden = NO;
        self.warningLabel.text = @"请输入正确的手机号";
    }
}

- (void)timeCountDown {
    
    [SMSSDK getVerificationCodeByMethod:SMSGetCodeMethodSMS phoneNumber:self.phoneField.text zone:@"86" customIdentifier:nil result:^(NSError *error) {
        
        if (!error) {
            [SVProgressHUD showSuccessWithStatus:@"获取验证码成功"];
            NSLog(@"获取验证码成功");
        } else {
            [SVProgressHUD showErrorWithStatus:@"获取验证码失败"];
            NSLog(@"错误信息：%@",error);
        }
    }];
    
    __block int timeout = 60; //倒计时时间
    
    dispatch_queue_t queue = dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0);
    
    dispatch_source_t _timer = dispatch_source_create(DISPATCH_SOURCE_TYPE_TIMER, 0, 0,queue);
    
    dispatch_source_set_timer(_timer,dispatch_walltime(NULL, 0),1.0*NSEC_PER_SEC, 0); //每秒执行
    
    dispatch_source_set_event_handler(_timer, ^{
        
        if (timeout <= 0) { //倒计时结束，关闭
            
            dispatch_source_cancel(_timer);
            
            dispatch_async(dispatch_get_main_queue(), ^{
                
                //设置界面的按钮显示 根据自己需求设置
                
                [self.getSMSBtn setTitle:@"获取验证码" forState:UIControlStateNormal];
                
                self.getSMSImage.image = [UIImage imageNamed:@"validation_code_botton_unselect_background"];
                
                self.getSMSBtn.userInteractionEnabled = YES;
                
            });
            
        } else {
            
            int seconds = timeout % 61;
            
            NSString *strTime = [NSString stringWithFormat:@"%.2d", seconds];
            
            dispatch_async(dispatch_get_main_queue(), ^{
                
                //设置界面的按钮显示 根据自己需求设置
                
                NSLog(@"____%@",strTime);
                
                [self.getSMSBtn setTitle:[NSString stringWithFormat:@"%@ 秒",strTime] forState:UIControlStateNormal];
                
                self.getSMSImage.image = [UIImage imageNamed:@"validation_code_botton_selected_background"];
                
                
                self.getSMSBtn.userInteractionEnabled = NO;
                
            });
            
            timeout--;
            
        }
        
    });
    
    dispatch_resume(_timer);
}

@end
