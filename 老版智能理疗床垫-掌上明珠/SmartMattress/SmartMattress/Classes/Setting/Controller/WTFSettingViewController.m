//
//  WTFSettingViewController.m
//  SmartMattress
//
//  Created by William Cai on 2016/11/22.
//  Copyright © 2016年 lesmarthome. All rights reserved.
//

#import "WTFSettingViewController.h"
#import "WTFRealTimeController.h"
#import "WTFHeatingController.h"
#import "WTFPhysioController.h"
#import "WTFDeviceManagementController.h"
#import "CustomNavigationController.h"

#import <AFNetworking/AFNetworking.h>
#import <SVProgressHUD/SVProgressHUD.h>

@interface WTFSettingViewController ()

@property (weak, nonatomic) IBOutlet UIButton *button0;
@property (weak, nonatomic) IBOutlet UIButton *button1;
@property (weak, nonatomic) IBOutlet UIButton *button2;

@property (weak, nonatomic) IBOutlet UIView *titlesView;

//正在显示的控制器
@property (weak, nonatomic) UIViewController *showingVC;

// ScrollView的内容部分
@property (weak, nonatomic) UIScrollView *contentView;

// 当前选中的标题按钮
@property (weak, nonatomic) UIButton *selectedButton;

// saveFlag: 1为未保存, 0为已保存
@property (assign, nonatomic) NSInteger saveFlag;

@property (strong, nonatomic) WTFRealTimeController *realTimeVC;
@property (strong, nonatomic) WTFHeatingController *heatingVC;
@property (strong, nonatomic) WTFPhysioController *physiotherapyVC;

@property (strong, nonatomic) WTFDeviceManagementController *deviceVC;

@end

@implementation WTFSettingViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view from its nib.
    
    [self setupView];
    [self setChildViewController];
}

- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:YES];
    
    [self getNetworkState];
    
    if (HardwareID == nil) {
        
        [[UIApplication sharedApplication] setStatusBarStyle:UIStatusBarStyleDefault];
        
        [self.showingVC.view removeFromSuperview];
        [self.titlesView removeFromSuperview];
        
        self.deviceVC.view.frame = CGRectMake(0, 64, self.view.width, self.view.height - 49 - 64);
        [self.view addSubview:self.deviceVC.view];
        
    } else {
        
        // 隐藏导航栏
        [self.navigationController setNavigationBarHidden:YES animated:NO];
        [[UIApplication sharedApplication] setStatusBarStyle:UIStatusBarStyleLightContent];
        
        [self.deviceVC.view removeFromSuperview];
        
        self.showingVC.view.frame = CGRectMake(0, 0, self.view.width, self.view.height);
        [self.view addSubview:self.showingVC.view];
        
        [self.view bringSubviewToFront:self.titlesView];
        [self setupTitlesView];
        
    }
}

- (void)viewWillDisappear:(BOOL)animated {
    [super viewWillDisappear:YES];
    
    [self.navigationController setNavigationBarHidden:NO animated:YES];
}

- (void)setupView {
    
    // 设置HUD
    [SVProgressHUD setMinimumDismissTimeInterval:1];
    
}

- (void)setupTitlesView {
    [self.button0 addTarget:self action:@selector(titleClick:) forControlEvents:UIControlEventTouchUpInside];
    [self.button1 addTarget:self action:@selector(titleClick:) forControlEvents:UIControlEventTouchUpInside];
    [self.button2 addTarget:self action:@selector(titleClick:) forControlEvents:UIControlEventTouchUpInside];
    
    _button0.enabled = NO;
    self.selectedButton = _button0;
}

- (void)setChildViewController {
    
    self.realTimeVC = [[WTFRealTimeController alloc] init];
    self.heatingVC = [[WTFHeatingController alloc] init];
    self.physiotherapyVC = [[WTFPhysioController alloc] init];
    
    self.deviceVC = [[WTFDeviceManagementController alloc] init];
    
    [self addChildViewController:self.realTimeVC];
    [self addChildViewController:self.heatingVC];
    [self addChildViewController:self.physiotherapyVC];
    [self addChildViewController:self.deviceVC];
    
    self.showingVC = self.realTimeVC;
    
}

- (void)titleClick:(UIButton *)button {
    
    /*
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    NSString *i = [defaults objectForKey:@"save"];
    
    self.saveFlag = [i intValue];
    
    if (self.saveFlag == 1) {
        [SVProgressHUD showInfoWithStatus:@"请确认更改"];
    } else if (self.saveFlag == 0){}
     */
        
    // 修改按钮状态
    self.selectedButton.enabled = YES;
    button.enabled = NO;
    self.selectedButton = button;
    
    // 移除其他控制器的view
    [self.showingVC.view removeFromSuperview];
    
    // 获得控制器的位置（索引)
    //NSUInteger index = [button.superview.subviews indexOfObject:button];
    
    // 添加控制器的view
    self.showingVC = self.childViewControllers[button.tag - 10];
    self.showingVC.view.frame = CGRectMake(0, 0, self.view.width, self.view.height);
    [self.view addSubview:self.showingVC.view];
    [self.view bringSubviewToFront:self.titlesView];
    
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
            UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"无网络连接"
                                                            message:@"请在良好的网络条件下使用"
                                                           delegate:self
                                                  cancelButtonTitle:@"确定"
                                                  otherButtonTitles:nil, nil];
            alert.delegate = self;
            [alert show];
        }
    }];
}

@end
