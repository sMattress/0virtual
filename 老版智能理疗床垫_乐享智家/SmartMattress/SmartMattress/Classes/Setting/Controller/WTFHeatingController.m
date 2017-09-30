//
//  WTFHeatingController.m
//  SmartMattress
//
//  Created by William Cai on 2016/11/22.
//  Copyright © 2016年 lesmarthome. All rights reserved.
//

#import "WTFHeatingController.h"

#import "WTFTransModel.h"
#import "WTFBodyModel.h"
#import "WTFParamsModel.h"
#import "WTFHeatingModel.h"

#import <MJExtension/MJExtension.h>
#import <AFNetworking/AFNetworking.h>
#import <SVProgressHUD/SVProgressHUD.h>

/*
 tag:
 注册本界面tag=60
 */

@interface WTFHeatingController ()

@property (weak, nonatomic) IBOutlet UIButton *bedChooseButton;

//模式开关 左右侧 保存按钮 自动开关模式
@property (weak, nonatomic) IBOutlet UISwitch *heatingModeSwitch;
@property (weak, nonatomic) IBOutlet UIButton *sideSwitchButton;
@property (weak, nonatomic) IBOutlet UIButton *changeConfirmButton;
@property (weak, nonatomic) IBOutlet UISwitch *autoTemSwich;
- (IBAction)SwichBedBtnClick:(id)sender;

// 加热温度 控件
@property (weak, nonatomic) IBOutlet UILabel *heatingTempLabel;
@property (weak, nonatomic) IBOutlet UIButton *heatingChangeCancelButton;
@property (weak, nonatomic) IBOutlet UIStepper *heatingTempStepper;

// 预约开机时间 控件
@property (weak, nonatomic) IBOutlet UIDatePicker *datePicker;

//一些标志位及存储属性等
@property (assign, nonatomic) NSInteger modeSwitch;
@property (assign, nonatomic) NSInteger side;
@property (assign, nonatomic) NSInteger time;
@property (assign, nonatomic) NSInteger temp;

@property (assign, nonatomic) NSInteger HH;
@property (assign, nonatomic) NSInteger MM;
@property (assign, nonatomic) NSInteger proMM;
@property (assign, nonatomic) NSInteger AP;//am / pm
@property (strong, nonatomic) NSDate *date;
@property (strong, nonatomic) NSDate *todayDate;

@end

@implementation WTFHeatingController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view from its nib.
    
    [self setupView];
}

- (void)setupView {
    
    // 设置UI布局
    self.sideSwitchButton.layer.borderColor = [UIColor whiteColor].CGColor;
    
    // 设置HUD
    [SVProgressHUD setMinimumDismissTimeInterval:1];
    
    // 设置确认更改按钮
    self.changeConfirmButton.enabled = NO;
    
    // 设置撤销按钮
    self.heatingChangeCancelButton.hidden = YES;
    
    // 设置监听事件
    [self.heatingTempStepper addTarget:self action:@selector(heatingTempAdjusting:) forControlEvents:UIControlEventValueChanged];
    
    // DatePicker设置
    NSDateFormatter *formatt = [[NSDateFormatter alloc] init];
    [formatt setDateFormat:@"HH:mm"];
    
    [self.datePicker setValue:[UIColor whiteColor] forKey:@"textColor"];
    
    //获得当前日期
    NSCalendar *calendar = [NSCalendar currentCalendar];
    NSDate *now = [NSDate date];
    NSDateComponents *components = [calendar components:NSCalendarUnitYear|NSCalendarUnitMonth|NSCalendarUnitDay fromDate:now];
    self.todayDate = [calendar dateFromComponents:components];
    
}

// stepper 方法
- (void)heatingTempAdjusting:(UIStepper *)stepper {
    self.heatingChangeCancelButton.hidden = NO;
    NSString *temp = [NSString stringWithFormat:@"%1.0f °C", [stepper value]];
    self.heatingTempLabel.textColor = [UIColor whiteColor];
    self.heatingTempLabel.text = temp;
    [self confirmButtonState:YES];
}

- (IBAction)cancelTempChange:(UIButton *)sender {
    
    self.heatingTempStepper.value = self.temp;
    
    self.heatingChangeCancelButton.hidden = YES;
    self.heatingTempLabel.textColor = [UIColor grayColor];
    self.heatingTempLabel.text = [NSString stringWithFormat:@"%ld °C", (long)self.temp];
    
    self.changeConfirmButton.enabled = NO;
    
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    [defaults setObject:@"0" forKey:@"save"];
    [defaults synchronize];
}

// 选择器方法
- (IBAction)select:(id)sender {
    NSDateFormatter *formatt = [[NSDateFormatter alloc] init];
    [formatt setDateFormat:@"HH:mm"];
    self.date = self.datePicker.date;
    [self confirmButtonState:YES];
}

- (IBAction)modeSwitchClick:(UISwitch *)sender {
    [self confirmButtonState:YES];
    if (sender.on) {
        self.modeSwitch = 1;
        [self setBtnEnable:YES];
    } else {
        self.modeSwitch = 0;
        [self setBtnEnable:NO];
        
        NSString *confirmStr = [self changeToStringWithMsgID:63];
        [self writeAndReadSocketData:confirmStr tag:63];
    }
}

- (IBAction)SwichBedBtnClick:(id)sender {
    
    self.side = !self.side;
    
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    NSNumber *side = [NSNumber numberWithInteger:self.side];
    [defaults setObject:side forKey:@"side"];
    [defaults synchronize];
    
    [self sideStateQuerying:self.side messageId:61 tag:61];
}

- (IBAction)changeConfirm:(UIButton *)sender {
    NSString *confirmStr = [self changeToStringWithMsgID:62];
    [self writeAndReadSocketData:confirmStr tag:62];
}

- (IBAction)autoTemSwich:(id)sender {
    [self confirmButtonState:YES];
}

- (void)confirmButtonState:(BOOL)enable {
    self.changeConfirmButton.enabled = enable;
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    [defaults setObject:@"1" forKey:@"save"];
    [defaults synchronize];
}

// 设置所有页面是否能点击
- (void)setBtnEnable:(BOOL)state {
    self.heatingTempStepper.enabled = state;
    self.datePicker.enabled = state;
    self.autoTemSwich.enabled = state;
}

#pragma mark - 时间换算

- (void)intToHHMM:(NSInteger)x {
    _HH = x / 3600;
    _MM = x % 3600;
}

- (void)intToMMSS:(NSInteger)x {
    _proMM = x / 60;
}

- (NSInteger)HHSSToInt:(NSInteger)x {
    NSInteger y = x * 60;
    return y;
}

- (NSInteger)HHMMToInt:(NSInteger)HH and:(NSInteger)MM {
    NSInteger z = HH * 3600 + MM;
    return z;
}

#pragma mark - view加载方法

- (void)viewWillAppear:(BOOL)animated {
    [self.bedChooseButton setTitle:HardwareName forState:UIControlStateNormal];
    [self registToServer];
    [self sideStateQuerying:self.side messageId:61 tag:61];
}

- (void)viewWillDisappear:(BOOL)animated {
    _connection.delegate = nil;
    [self closeConnection];
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    [defaults setObject:@"0" forKey:@"save"];
    [defaults synchronize];
}

#pragma mark - RHSocketConnection

// socket连接方法： 连接、注册、数据传输、基本方法、代理
// 连接，注册

- (void)registToServer {
    NSDictionary *paramDict = @{@"deviceType":@"iOS"};
    
    [WTFBodyModel mj_setupAllowedPropertyNames:^NSArray *{
        return @[@"version", @"cmd", @"params"];
    }];
    
    WTFBodyModel *body = [[WTFBodyModel alloc] init];
    body.version = @"1.0";
    body.cmd = 64;
    body.params = @[paramDict];
    
    WTFTransModel *regist = [[WTFTransModel alloc] init];
    regist.from = userDevice;
    regist.to = @"server";
    regist.msgId = 60;
    regist.msgType = 1;
    regist.version = @"2.0";
    regist.state = 1;
    regist.body = body;
    
    NSString *registString = regist.mj_JSONString;
    
    [self writeAndReadSocketData:registString tag:60];
}

// 传入side msgId tag来查询某个side的信息
- (void)sideStateQuerying:(NSInteger)side messageId:(NSInteger)msgId tag:(long)tag{
    
    self.side = side;
    
    NSDictionary *paramDict = @{@"side":@(self.side)};
    
    [WTFBodyModel mj_setupAllowedPropertyNames:^NSArray *{
        return @[@"version", @"cmd", @"params"];
    }];
    
    WTFBodyModel *body = [[WTFBodyModel alloc] init];
    body.version = @"1.0";
    body.cmd = 33;
    body.params = @[paramDict];
    
    WTFTransModel *stateQuerying = [[WTFTransModel alloc] init];
    stateQuerying.from = userDevice;
    stateQuerying.to = HardwareID;
    stateQuerying.msgId = msgId;
    stateQuerying.msgType = 1;
    stateQuerying.version = @"2.0";
    stateQuerying.state = 1;
    stateQuerying.body = body;
    
    NSString *stateQueryingString = stateQuerying.mj_JSONString;
    
    [self writeAndReadSocketData:stateQueryingString tag:tag];
}

// 传入msgId来拼接某个side的信息
- (NSString *)changeToStringWithMsgID:(NSInteger)msgId {
    
    int start = self.date.timeIntervalSinceReferenceDate - self.todayDate.timeIntervalSinceReferenceDate;
    
    [WTFParamsModel mj_setupAllowedPropertyNames:^NSArray *{
        return @[@"modeSwitch", @"side", @"targetTemperature", @"protectTime", @"startTime", @"autoTemperatureControl"];
    }];
    
    WTFParamsModel *changeParam = [[WTFParamsModel alloc] init];
    changeParam.modeSwitch = self.modeSwitch;
    changeParam.side = self.side;
    changeParam.targetTemperature = self.heatingTempStepper.value;
    changeParam.protectTime = 30 * 60;
    changeParam.startTime = start;
    changeParam.autoTemperatureControl = self.autoTemSwich.isOn;
    
    NSDictionary *paramDict = changeParam.mj_keyValues;
    
    [WTFBodyModel mj_setupAllowedPropertyNames:^NSArray *{
        return @[@"version", @"cmd", @"params"];
    }];
    
    WTFBodyModel *body = [[WTFBodyModel alloc] init];
    body.version = @"1.0";
    body.cmd = 17;
    body.params = @[paramDict];
    
    WTFTransModel *changeConfirm = [[WTFTransModel alloc] init];
    changeConfirm.from = userDevice;
    changeConfirm.to = HardwareID;
    changeConfirm.msgId = msgId;
    changeConfirm.msgType = 1;
    changeConfirm.version = @"2.0";
    changeConfirm.state = 1;
    changeConfirm.body = body;
    
    NSString *changeString = changeConfirm.mj_JSONString;
    
    return changeString;
}

// socket连接
- (void)writeAndReadSocketData:(NSString *)jsonString tag:(long)tag {
    _serverHost = serverHost;
    _serverPort = serverPort;
    
    NSString *content = [jsonString stringByAppendingString:@"\r\n"];
    NSData *data = [content dataUsingEncoding:NSUTF8StringEncoding];
    
    if (tag == 60) {
        [self openConnection];
        [_connection writeData:data timeout:-1 tag:tag];
        [_connection readDataWithTimeout:-1 tag:tag];
    } else {
        [_connection writeData:data timeout:-1 tag:tag];
        [_connection readDataWithTimeout:-1 tag:tag];
    }
}

#pragma mark - RHSocketConnection method

- (void)openConnection {
    [self closeConnection];
    _connection = [RHSocketConnection ShareRHSocketConnection] ;
    _connection.delegate = self;
    //_connection.delegate = _connection;
    //[_connection connectWithHost:_serverHost port:_serverPort];
}

- (void)closeConnection {
    if (_connection) {
        _connection.delegate = nil;
        [_connection disconnect];
        _connection = nil;
    }
}

#pragma mark - delegate method

- (void)didDisconnectWithError:(NSError *)error {
    //RHSocketLog(@"[RHSocketConnection Heating] didDisconnectWithError:%@", error);
    if (error) {
        [self viewDidLoad];
        //[SVProgressHUD showErrorWithStatus:@"连接断开请点击加热预约刷新"];
    }
}

- (void)didConnectToHost:(NSString *)host port:(UInt16)port {
    //RHSocketLog(@"[RHSocketConnection Heating] didConnectToHost.");
}

- (void)didReceiveData:(NSData *)data tag:(long)tag {
    NSString *dataStr = [[NSString alloc]initWithData:data encoding:NSUTF8StringEncoding];
    RHSocketLog(@"[RHSocketConnection Heating] didReceiveData--tag: %ld, data: %@", tag, dataStr);
    
    WTFHeatingModel *currentState = [WTFHeatingModel mj_objectWithKeyValues:dataStr];
    
    switch (currentState.state) {
        case 1:
            
            if (currentState.msgId == 61) {
                
                [SVProgressHUD showSuccessWithStatus:@"获取数据成功"];
                
                if (self.side) {
                    [self.sideSwitchButton setTitle:@"左侧" forState:UIControlStateNormal];
                } else {
                    [self.sideSwitchButton setTitle:@"右侧" forState:UIControlStateNormal];
                }
                
                // 模式开关
                self.modeSwitch = currentState.modeSwitch;
                if (self.modeSwitch) {
                    self.heatingModeSwitch.on = YES;
                    [self setBtnEnable:YES];
                } else {
                    self.heatingModeSwitch.on = NO;
                    [self setBtnEnable:NO];
                }
                
                NSDateFormatter *dateFormatter = [[NSDateFormatter alloc] init];
                [dateFormatter setDateFormat:@"HH:mm"];
                
                self.date = [self.todayDate dateByAddingTimeInterval:currentState.startTime];
                [self.datePicker setDate:self.date];
                
                if (currentState.targetTemperature < 25 || currentState.targetTemperature > 45) {
                    self.heatingTempStepper.value = 25;
                } else {
                    self.heatingTempStepper.value = currentState.targetTemperature;
                }
                self.temp = currentState.targetTemperature;
                self.heatingTempLabel.textColor = [UIColor grayColor];
                self.heatingTempLabel.text = [NSString stringWithFormat:@"%ld °C",(long)self.heatingTempStepper.value];
                
                // 智能控温
                if (currentState.autoTemperatureControl) {
                    self.autoTemSwich.on = YES;
                } else {
                    self.autoTemSwich.on = NO;
                }
            }
            
            if (currentState.msgId == 62 || currentState.msgId == 63) {
                
                [self sideStateQuerying:self.side messageId:61 tag:61];
                
                self.heatingChangeCancelButton.hidden = YES;
                [self confirmButtonState:NO];
                
                NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
                [defaults setObject:@"0" forKey:@"save"];
                [defaults synchronize];
                
                [SVProgressHUD showSuccessWithStatus:@"更改成功"];
            }
            
            break;
            
        case 16:
            [SVProgressHUD showErrorWithStatus:@"设备未在线，请检查设备"];
            break;
            
        case 17:
            [SVProgressHUD showErrorWithStatus:@"目标连接中断"];
            break;
            
        default:
            break;
    }
}

@end
