//
//  WTFEditNameController.m
//  SmartMattress
//
//  Created by William Cai on 2016/12/14.
//  Copyright © 2016年 lesmarthome. All rights reserved.
//

#import "WTFEditNameController.h"

#import "AFNetworking.h"
#import "MJExtension.h"
#import "SVProgressHUD.h"

@interface WTFEditNameController ()

@property (weak, nonatomic) IBOutlet UITextField *nameField;

@end

@implementation WTFEditNameController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view from its nib.
    
    [self setupView];
}

- (void)setupView {
    
    // 设置UI
    self.title = @"名字";
    
    self.view.backgroundColor = GlobalBackground;
    
    // 设置HUD
    [SVProgressHUD setMinimumDismissTimeInterval:1];
    
    // 设置placeholder
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    self.nameField.placeholder = [defaults objectForKey:@"name"];
    
    // 设置右侧按钮
    self.navigationController.navigationBar.tintColor = RGBColor(111, 206, 27);
    self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:@"确认" style:UIBarButtonItemStyleDone target:self action:@selector(confirmAction)];
}

- (void)confirmAction {
    if (self.nameField.text.length) {
        [self updateInfo:self.nameField.text];
    } else {
        [SVProgressHUD showErrorWithStatus:@"请输入新的名字"];
    }
}

- (void)updateInfo:(NSString *)name {
    
    AFHTTPSessionManager *manager = [AFHTTPSessionManager manager];
    manager.responseSerializer.acceptableContentTypes = [NSSet setWithObjects:@"application/json", @"text/html", @"text/json", @"text/javascript", nil];
    
    manager.requestSerializer.timeoutInterval = 5.f;
    
    NSDictionary *paramDic = @{@"name": name};
    
    NSString *updateInfoURL = @"/v1/user/update/base_info";
    NSString *secureURL = [updateInfoURL getSecureUrl:updateInfoURL];
    
    [SVProgressHUD show];
    
    [manager POST:secureURL parameters:paramDic progress:nil success:^(NSURLSessionDataTask * _Nonnull task, id  _Nullable responseObject) {
        
        [SVProgressHUD dismiss];
        
        if ([responseObject[@"flag"] integerValue]) {
            
            [self.navigationController popViewControllerAnimated:YES];
            [SVProgressHUD showSuccessWithStatus:@"更改成功"];
        } else {
            
            [SVProgressHUD showErrorWithStatus:@"更改失败，请重试"];
        }
        
    } failure:^(NSURLSessionDataTask * _Nullable task, NSError * _Nonnull error) {
        [SVProgressHUD showErrorWithStatus:@"无网络连接"];
    }];
}

@end
