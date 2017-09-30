//
//  WTFPhysioController.m
//  SmartMattress
//
//  Created by William Cai on 2016/11/22.
//  Copyright © 2016年 lesmarthome. All rights reserved.
//

#import "WTFPhysioController.h"

#import "WTFTransModel.h"
#import "WTFBodyModel.h"
#import "WTFParamsModel.h"
#import "WTFPhysioModel.h"

#import <MJExtension/MJExtension.h>
#import <AFNetworking/AFNetworking.h>
#import <SVProgressHUD/SVProgressHUD.h>
#import <TTRangeSlider/TTRangeSlider.h>

/*
 tag:
 注册本界面 tag=70
 查询side信息 tag=71
 提交修改 tag=72
 */

@interface WTFPhysioController ()

@property (weak, nonatomic) IBOutlet UIButton *bedChooseButton;

@property (weak, nonatomic) IBOutlet UIButton *sideSwitchButton;
@property (weak, nonatomic) IBOutlet UISwitch *physioModeSwitch;
@property (weak, nonatomic) IBOutlet UIButton *changeConfirmButton;

// 理疗时间控件
@property (weak, nonatomic) IBOutlet UILabel *timeLabel;
@property (weak, nonatomic) IBOutlet UIButton *cancelButton;
@property (weak, nonatomic) IBOutlet UIStepper *timeStepper;
@property (weak, nonatomic) IBOutlet UIButton *physioTimeButton;
@property (weak, nonatomic) IBOutlet UIButton *physioDurationButton;

// 滑竿控件
@property (weak, nonatomic) IBOutlet TTRangeSlider *timeRangeSlider;

// 属性
@property (assign, nonatomic) NSInteger modeSwitch;
@property (assign, nonatomic) NSInteger side;
@property (assign, nonatomic) NSInteger workTime;
@property (assign, nonatomic) NSInteger startTime;
@property (assign, nonatomic) NSInteger overTime;

@property (assign, nonatomic) NSInteger HH;
@property (assign, nonatomic) NSInteger mm;
@property (assign, nonatomic) NSInteger proMM;

@end

@implementation WTFPhysioController

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
    self.cancelButton.hidden = YES;
    
    // 设置滑竿控件
    self.timeRangeSlider.delegate = self;
    self.timeRangeSlider.lineHeight = 5;
    self.timeRangeSlider.handleColor = RGBColor(209, 73, 85);
    self.timeRangeSlider.tintColorBetweenHandles = RGBColor(209, 73, 85);
    self.timeRangeSlider.minLabelFont = [UIFont boldSystemFontOfSize:20];
    self.timeRangeSlider.maxLabelFont = [UIFont boldSystemFontOfSize:20];
    self.timeRangeSlider.minValue = 21600;
    self.timeRangeSlider.maxValue = 86399;
    self.timeRangeSlider.selectedMinimum = 21600;
    self.timeRangeSlider.selectedMaximum = 86399;
    
    // 设置监听事件
    [self.timeStepper addTarget:self action:@selector(timeAdjusting:) forControlEvents:UIControlEventValueChanged];
}

// 选边按钮方法
- (IBAction)sideSwitch:(UIButton *)sender {
    self.side = !self.side;
    
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    NSNumber *side = [NSNumber numberWithInteger:self.side];
    [defaults setObject:side forKey:@"side"];
    [defaults synchronize];
    
    [self sideStateQuerying:self.side messageId:71 tag:71];
}

// 确认按钮方法
- (IBAction)changeConfirm:(UIButton *)sender {
    
    NSString *confirmStr = [self changeToStringWithMsgID:72];
    
    [self writeAndReadSocketData:confirmStr tag:72];
}

- (void)confirmButtonState:(BOOL)enable {
    
    self.changeConfirmButton.enabled = enable;
    
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    [defaults setObject:@"1" forKey:@"save"];
    [defaults synchronize];
}

// 理疗时间 控件方法
- (void)timeAdjusting:(UIStepper *)stepper {
    self.cancelButton.hidden = NO;
    NSString *time = [NSString stringWithFormat:@"%1.0f min", [stepper value]];
    self.timeLabel.textColor = [UIColor whiteColor];
    self.timeLabel.text = time;
    [self confirmButtonState:YES];
}

- (IBAction)cancelChangeButton:(UIButton *)sender {
    
    self.timeStepper.value = self.workTime;
    
    self.cancelButton.hidden = YES;
    self.timeLabel.textColor = [UIColor grayColor];
    self.timeLabel.text = [NSString stringWithFormat:@"%ld min", (long)self.workTime];
    
    self.changeConfirmButton.enabled = NO;
    
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    [defaults setObject:@"0" forKey:@"save"];
    [defaults synchronize];
}

// 模式开关
- (IBAction)modeSwitchClick:(UISwitch *)sender {
    [self confirmButtonState:YES];
    if (sender.on) {
        self.modeSwitch = 1;
        [self setBtnEnable:YES];
    } else {
        self.modeSwitch = 0;
        [self setBtnEnable:NO];
        
        NSString *confirmStr = [self changeToStringWithMsgID:73];
        [self writeAndReadSocketData:confirmStr tag:73];
    }
}

// 模式关闭后 控件响应
- (void)setBtnEnable:(BOOL)state {
    self.timeStepper.enabled = state;
    self.timeRangeSlider.enabled = state;
}

#pragma mark - 时间换算

- (void)timeTommss:(NSInteger)x {
    _proMM = x / 60;
}

- (NSInteger)HHSSToInt:(NSInteger)x {
    NSInteger y = x * 60;
    return  y;
}

- (NSInteger)setTimeToHH:(NSInteger)time {
    if (time == 86399) {
        NSInteger HH = 24;
        return HH;
    } else {
        NSInteger HH = time / 3600;
        return HH;
    }
}

- (NSInteger)setHHToTime:(NSInteger)HH {
    if (HH == 24) {
        NSInteger time = HH * 3600 - 1;
        return time;
    } else {
        NSInteger time = HH * 3600;
        return time;
    }
}

#pragma mark - view加载

- (void)viewWillAppear:(BOOL)animated {
    [self.bedChooseButton setTitle:HardwareName forState:UIControlStateNormal];
    [self registToServer];
    [self sideStateQuerying:self.side messageId:71 tag:71];
}

- (void)viewWillDisappear:(BOOL)animated {
    _connection.delegate = nil;
    [self closeConnection];
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    [defaults setObject:@"0" forKey:@"save"];
    [defaults synchronize];
}

#pragma mark - TTRangeSliderView Delegate

- (void)rangeSlider:(TTRangeSlider *)sender didChangeSelectedMinimumValue:(float)selectedMinimum andMaximumValue:(float)selectedMaximum{
    
    [self confirmButtonState:YES];
    
    if (selectedMinimum >= 86399) {
        
        self.startTime = selectedMaximum;
        self.overTime = selectedMaximum;
        
    } else {
        
        self.startTime = selectedMinimum;
        self.overTime = selectedMaximum;
    }
}

#pragma mark - RHSocketConnection

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
    regist.msgId = 70;
    regist.msgType = 1;
    regist.version = @"2.0";
    regist.state = 1;
    regist.body = body;
    
    NSString *registString = regist.mj_JSONString;
    
    [self writeAndReadSocketData:registString tag:70];
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
    body.cmd = 34;
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
- (NSString *)changeToStringWithMsgID:(int)msgId {
    
    [WTFParamsModel mj_setupAllowedPropertyNames:^NSArray *{
        return @[@"modeSwitch", @"side", @"workTime", @"startTime", @"overTime"];
    }];
    
    WTFParamsModel *changeParam = [[WTFParamsModel alloc] init];
    changeParam.modeSwitch = self.modeSwitch;
    changeParam.side = self.side;
    changeParam.workTime = [self HHSSToInt:self.timeStepper.value];
    changeParam.startTime = self.startTime;
    changeParam.overTime = self.overTime;
    
    NSDictionary *paramDict = changeParam.mj_keyValues;
    
    [WTFBodyModel mj_setupAllowedPropertyNames:^NSArray *{
        return @[@"version", @"cmd", @"params"];
    }];
    
    WTFBodyModel *body = [[WTFBodyModel alloc] init];
    body.version = @"1.0";
    body.cmd = 18;
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

- (void)writeAndReadSocketData:(NSString *)jsonString tag:(long)tag {
    _serverHost = serverHost;
    _serverPort = serverPort;
    
    NSString *content = [jsonString stringByAppendingString:@"\r\n"];
    NSData *data = [content dataUsingEncoding:NSUTF8StringEncoding];
    
    if (tag == 70) {
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
    
    //_connection = [[RHSocketConnection alloc] init];
    _connection = [RHSocketConnection ShareRHSocketConnection];
    
    _connection.delegate = self;
    //[_connection connectWithHost:_serverHost port:_serverPort];
}

- (void)closeConnection {
    if (_connection) {
        _connection.delegate = nil;
        [_connection disconnect];
        _connection = nil;
    }
}

#pragma mark - RHSocketConnection delegate

- (void)didDisconnectWithError:(NSError *)error {
    //RHSocketLog(@"[RHSocketConnection Physiotherapy] didDisconnectWithError: %@",error);
    if (error) {
        [self viewDidLoad];
        //[SVProgressHUD showErrorWithStatus:@"连接断开请点击理疗预约刷新"];
    }
}

- (void)didConnectToHost:(NSString *)host port:(UInt16)port {
    //RHSocketLog(@"[RHSocketConnection Physiotherapy] didConnectToHost.");
}

- (void)didReceiveData:(NSData *)data tag:(long)tag {
    NSString *dataStr = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
    RHSocketLog(@"[RHSocketConnection Physiotherapy] didReceiveData--tag: %ld, data: %@", tag, dataStr);
    
    // 解析json
    WTFPhysioModel *currentState = [WTFPhysioModel mj_objectWithKeyValues:dataStr];
    
    switch (currentState.state) {
        case 1:
            
            if (currentState.msgId == 71) {
                
                [SVProgressHUD showSuccessWithStatus:@"获取数据成功"];
                
                if (self.side) {
                    [self.sideSwitchButton setTitle:@"左侧" forState:UIControlStateNormal];
                } else {
                    [self.sideSwitchButton setTitle:@"右侧" forState:UIControlStateNormal];
                }
                
                // 更新switch开关状态
                self.modeSwitch = currentState.modeSwitch;
                if (self.modeSwitch) {
                    self.physioModeSwitch.on = YES;
                    [self setBtnEnable:YES];
                } else {
                    self.physioModeSwitch.on = NO;
                    [self setBtnEnable:NO];
                }
                
                // 更新stepper和label控件
                [self timeTommss:currentState.workTime];
                if (_proMM < 0 || _proMM > 120) {
                    _proMM = 45;
                }
                self.timeLabel.textColor = [UIColor grayColor];
                self.timeLabel.text = [NSString stringWithFormat:@"%ld min", (long)_proMM];
                self.workTime = _proMM;
                self.timeStepper.value = _proMM;
                
                
                // 更新滑竿控件
                if (currentState.startTime <= 6 * 60 * 60 || currentState.startTime > 24 * 60 * 60) {
                    self.startTime = 6 * 60 * 60;
                } else {
                    self.startTime = currentState.startTime;
                }
                if (currentState.overTime < 6 * 60 * 60 || currentState.overTime >= 24 * 60 * 60) {
                    self.overTime = 24 * 60 * 60;
                } else {
                    self.overTime = currentState.overTime;
                }
                
                self.timeRangeSlider.selectedMinimum = self.startTime;
                self.timeRangeSlider.selectedMaximum = self.overTime;
                
            }
            
            if (currentState.msgId == 72 || currentState.msgId == 73) {
                
                [self sideStateQuerying:self.side messageId:71 tag:71];
                self.cancelButton.hidden = YES;
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
