//
//  WTFWiFiConfigController.m
//  SmartMattress
//
//  Created by William Cai on 2016/12/13.
//  Copyright © 2016年 lesmarthome. All rights reserved.
//

#import "WTFWiFiConfigController.h"
#import "WTFLoadingViewController.h"

#import "LiteSimpleConfig.h"
#import "SVProgressHUD.h"

@interface WTFWiFiConfigController ()

@property (weak, nonatomic) IBOutlet UITextField *wifiPwdField;

@end

@implementation WTFWiFiConfigController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view from its nib.
    
    [self setupView];
}

- (void)setupView {
    
    self.title = @"配置新设备";
    
    self.view.backgroundColor = GlobalBackground;
    
    // 设置HUD
    [SVProgressHUD setMinimumDismissTimeInterval:1];
    
    // 设置placeholder
    self.wifiPwdField.placeholder = [NSString stringWithFormat:@"请输入WiFi: %@ 的密码", [LiteSimpleConfig getWiFiSSID]];
    
    // 设置右侧按钮
    self.navigationController.navigationBar.tintColor = RGBColor(111, 206, 27);
    self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:@"确认" style:UIBarButtonItemStyleDone target:self action:@selector(confirmAction)];
    
    if (![LiteSimpleConfig isEnableWiFi]) {
        [SVProgressHUD showErrorWithStatus:@"当前WiFi不可用"];
    }
    
}

- (void)confirmAction {
    

        
        // 传入WiFi密码
        [LiteSimpleConfig setWiFiPassword:self.wifiPwdField.text];
        
        if (![LiteSimpleConfig isEnableWiFi]) {
            
            [SVProgressHUD showErrorWithStatus:@"当前WiFi不可用"];
        } else {
            
            WTFLoadingViewController *loadingVC = [[WTFLoadingViewController alloc] init];
            [self.navigationController pushViewController:loadingVC animated:YES];
        }

    
}

@end
