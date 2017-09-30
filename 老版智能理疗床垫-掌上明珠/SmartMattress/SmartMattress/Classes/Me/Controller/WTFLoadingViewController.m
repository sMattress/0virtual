//
//  WTFLoadingViewController.m
//  SmartMattress
//
//  Created by William Cai on 2016/12/13.
//  Copyright © 2016年 lesmarthome. All rights reserved.
//

#import "WTFLoadingViewController.h"
#import "WTFDeviceManagementController.h"

#import "WTFFlagDModel.h"
#import "WTFDeviceInfoModel.h"

#import "LiteSimpleConfig.h"
#import "SVProgressHUD.h"
#import "MJExtension.h"
#import "AFNetworking.h"

#import "YLGIFImage.h"
#import "YLImageView.h"

@interface WTFLoadingViewController ()

@property (weak, nonatomic) IBOutlet UILabel *configStateLabel;

@end

@implementation WTFLoadingViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view from its nib.
    
    [self setupView];
    
}

- (void)setupView {
    
    self.title = @"配置新设备";
    
    // 设置右侧按钮
    self.navigationController.navigationBar.tintColor = RGBColor(111, 206, 27);
    self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:@"确认" style:UIBarButtonItemStyleDone target:self action:@selector(confirmAction)];
    
    // 设置gif
    YLImageView* imageView = [[YLImageView alloc] initWithFrame:CGRectMake(0, ScreenHeight * 0.19, ScreenWidth, ScreenWidth * 0.75)];
    [self.view addSubview:imageView];
    imageView.image = [YLGIFImage imageNamed:@"loading.gif"];
    
    [self WiFiConfig];
    
}

- (void)confirmAction {
    [LiteSimpleConfig cancelConfigure];
    
    for (UIViewController *controller in self.navigationController.viewControllers)
    {
        if([controller isKindOfClass:[WTFDeviceManagementController class]]) {
            [self.navigationController popToViewController:controller animated:YES];
            break;
        }
    }
    
    [self.navigationController popToRootViewControllerAnimated:YES];
    
}

- (void)WiFiConfig {
    
    [LiteSimpleConfig startConfigure:^(NSMutableArray *result) {
        
        if (result.count != 0) {
            
            NSString *macAddress = [result firstObject];
            
            NSMutableString *deviceID = [NSMutableString stringWithString:macAddress];
            [deviceID replaceOccurrencesOfString:@":" withString:@"" options:1 range:NSMakeRange(0, deviceID.length)];
            
            [self postBindWithDeviceName:deviceID];
            
            self.configStateLabel.text = [NSString stringWithFormat:@"设备初始化成功，等待设备重启\n请在听到嘀的一声后点击确认\n\n设备号: %@", deviceID];
        }
        
    } failure:^(LiteSimpleConfigErrCode code) {
        NSLog(@"Error code: %u", code);
        self.configStateLabel.text = @"设备好像出现了什么问题，请重试\n如果问题依然存在，请联系客服";
    } timeout:60];
    
}

// 绑定设备 配完网络要绑定设备 扫到二维码字符要绑定设备  只有一个参数device_name
- (void)postBindWithDeviceName:(NSString *)device_name {
    
    AFHTTPSessionManager *manager = [AFHTTPSessionManager manager];
    manager.responseSerializer.acceptableContentTypes = [NSSet setWithObjects:@"application/json", @"text/html", @"text/json", @"text/javascript", nil];
    
    manager.requestSerializer.timeoutInterval = 5.f;
    
    NSDictionary *paramDic = @{@"device_name": device_name};
    
    NSString *bindURL = @"/v1/user/device/bind";
    NSString *secureURL = [bindURL getSecureUrl:bindURL];
    
    [manager POST:secureURL parameters:paramDic progress:nil success:^(NSURLSessionDataTask * _Nonnull task, id  _Nullable responseObject) {
        
        WTFFlagDModel *model = [WTFFlagDModel mj_objectWithKeyValues:responseObject];
        
        if (model.flag){
            
            WTFDeviceInfoModel *deviceModel = [[WTFDeviceInfoModel alloc] init];
            
            deviceModel.device_name = device_name;
            deviceModel.alias = @"主卧室的床";
            
        }
        
    } failure:^(NSURLSessionDataTask * _Nullable task, NSError * _Nonnull error) {
        [SVProgressHUD showErrorWithStatus:@"无网络连接"];
    }];
    
}

@end
