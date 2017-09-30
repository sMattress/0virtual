//
//  WTFEditDeviceController.m
//  SmartMattress
//
//  Created by William Cai on 2016/11/22.
//  Copyright © 2016年 lesmarthome. All rights reserved.
//

#import "WTFEditDeviceController.h"

#import "WTFFlagDModel.h"

#import "AFNetworking.h"
#import "MJExtension.h"
#import "SVProgressHUD.h"

@interface WTFEditDeviceController ()

@property (weak, nonatomic) IBOutlet UITextField *deviceNameField;

@end

@implementation WTFEditDeviceController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view from its nib.
    
    [self setupView];
    
}

- (void)setupView {
    
    // 设置导航条的标题
    self.title = @"修改设备名";
    
    self.view.backgroundColor = GlobalBackground;
    
    // 设置导航条右边的按钮
    self.navigationController.navigationBar.tintColor = RGBColor(111, 206, 27);
    self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:@"确认" style:UIBarButtonItemStyleDone target:self action:@selector(confirmAction)];
    
    self.deviceNameField.placeholder = self.deviceModel.alias;
}

// 点击保存的时候调用
- (void)confirmAction {
    [self PostEditInfoWithDevice_name:self.deviceModel.device_name andAlias:self.deviceNameField.text];
}

/**
 * 控制器之间传值：一定要注意控制器的子控件有没有加载，一定要在子控件加载完成的时候才去给子控件赋值，一般在viewDidLoad给控件赋值。
 */

// 更新绑定设备的方法，注意device_name是设备名，alias是修改后的昵称 上传成功后需要在success的blcok返回上一个界面
- (void) PostEditInfoWithDevice_name:(NSString *)device_name andAlias:(NSString *)alias{
    
    [SVProgressHUD show];
    
    AFHTTPSessionManager *manager = [AFHTTPSessionManager manager];
    manager.responseSerializer.acceptableContentTypes = [NSSet setWithObjects:@"application/json", @"text/html", @"text/json", @"text/javascript", nil];
    
    manager.requestSerializer.timeoutInterval = 5.f;
    
    NSDictionary *paramDict = @{@"device_name": device_name, @"alias": alias};
    
    NSString *updateURL = @"/v1/user/device/update";
    NSString *secureURL = [updateURL getSecureUrl:updateURL];
    
    [manager POST:secureURL parameters:paramDict progress:nil success:^(NSURLSessionDataTask * _Nonnull task, id  _Nullable responseObject) {
        
        WTFFlagDModel *model1 = [WTFFlagDModel mj_objectWithKeyValues:responseObject];
        
        if (model1.flag) {
            
            [SVProgressHUD dismiss];
            
            [self.navigationController popViewControllerAnimated:YES];
        } else {
            [SVProgressHUD dismiss];
            [SVProgressHUD showErrorWithStatus:@"修改失败"];
        }
    } failure:^(NSURLSessionDataTask * _Nullable task, NSError * _Nonnull error) {
        [SVProgressHUD dismiss];
        [SVProgressHUD showErrorWithStatus:@"无网络连接"];
    }];
}

@end
