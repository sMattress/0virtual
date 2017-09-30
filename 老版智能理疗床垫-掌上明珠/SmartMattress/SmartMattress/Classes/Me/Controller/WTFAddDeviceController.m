//
//  WTFAddDeviceController.m
//  SmartMattress
//
//  Created by William Cai on 2016/11/22.
//  Copyright © 2016年 lesmarthome. All rights reserved.
//

#import "WTFAddDeviceController.h"


@interface WTFAddDeviceController ()

@property (weak, nonatomic) IBOutlet UITextField *deviceNameField;
@property (weak, nonatomic) IBOutlet UITextField *deviceNumberField;
@property (weak, nonatomic) IBOutlet UIButton *addButton;

@end

@implementation WTFAddDeviceController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view from its nib.
    
    self.title = @"添加设备";
    
    // 添加观察者
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(textChange) name:UITextFieldTextDidChangeNotification object:self.deviceNameField];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(textChange) name:UITextFieldTextDidChangeNotification object:self.deviceNumberField];
}

- (void)textChange{
    self.addButton.enabled = (self.deviceNameField.text.length && self.deviceNumberField.text.length);
}

- (void)viewDidAppear:(BOOL)animated{
    [super viewDidAppear:animated];
    // 让姓名文本框成为第一响应者（叫出键盘）
    [self.deviceNameField becomeFirstResponder];
}

- (IBAction)addDevice:(UIButton *)sender {
    // 关闭当前视图控制器
    [self.navigationController popViewControllerAnimated:YES];
    //代理传值
    if ([self.delegate respondsToSelector:@selector(addDevice:didAddDevice:)]) {
        WTFDeviceModel *deviceModel = [[WTFDeviceModel alloc] init];
        deviceModel.deviceName = self.deviceNameField.text;
        deviceModel.deviceNumber = self.deviceNumberField.text;
        [self.delegate addDevice:self didAddDevice:deviceModel];
    }
}

@end
