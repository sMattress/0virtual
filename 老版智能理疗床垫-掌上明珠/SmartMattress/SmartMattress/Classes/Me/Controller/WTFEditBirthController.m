//
//  WTFEditBirthController.m
//  SmartMattress
//
//  Created by William Cai on 2016/12/14.
//  Copyright © 2016年 lesmarthome. All rights reserved.
//

#import "WTFEditBirthController.h"

#import "AFNetworking.h"
#import "MJExtension.h"
#import "SVProgressHUD.h"

@interface WTFEditBirthController ()

@property (weak, nonatomic) IBOutlet UIDatePicker *birthdayPicker;

@end

@implementation WTFEditBirthController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view from its nib.
    
    [self setupView];
}

- (void)setupView {
    
    // 设置UI
    self.title = @"出生日期";
    
    self.view.backgroundColor = GlobalBackground;
    
    // 设置HUD
    [SVProgressHUD setMinimumDismissTimeInterval:1];
    
    // 设置datepicker初始值
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    NSString *dateString = [defaults objectForKey:@"birthday"];
    
    NSDateFormatter *formatter = [[NSDateFormatter alloc] init] ;
    [formatter setDateFormat:@"yyyy-MM-dd"];
    
    self.birthdayPicker.date = [formatter dateFromString:dateString];
    
    // 设置右侧按钮
    self.navigationController.navigationBar.tintColor = RGBColor(111, 206, 27);
    self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:@"确认" style:UIBarButtonItemStyleDone target:self action:@selector(confirmAction)];
}

- (void)confirmAction {
    
    NSDateFormatter *dateFormatter = [[NSDateFormatter alloc] init];
    [dateFormatter setDateFormat:@"yyyy-MM-dd"];
    NSString *birthStr = [dateFormatter stringFromDate:self.birthdayPicker.date];
    
    [self updateInfo:birthStr];
}

- (void)updateInfo:(NSString *)birthday {
    
    AFHTTPSessionManager *manager = [AFHTTPSessionManager manager];
    manager.responseSerializer.acceptableContentTypes = [NSSet setWithObjects:@"application/json", @"text/html", @"text/json", @"text/javascript", nil];
    
    manager.requestSerializer.timeoutInterval = 5.f;
    
    NSDictionary *paramDic = @{@"birthday": birthday};
    
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
