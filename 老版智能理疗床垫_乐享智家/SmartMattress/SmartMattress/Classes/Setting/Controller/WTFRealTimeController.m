//
//  WTFRealTimeController.m
//  SmartMattress
//
//  Created by William Cai on 2016/11/22.
//  Copyright © 2016年 lesmarthome. All rights reserved.
//

#import "WTFRealTimeController.h"

#import "WTFTransModel.h"
#import "WTFBodyModel.h"
#import "WTFParamsModel.h"
#import "WTFRealTimeModel.h"

#import <MJExtension/MJExtension.h>
#import <SVProgressHUD/SVProgressHUD.h>

/*
 side: 0为右边, 1为左边
 mode: 0为待机, 1为加热, 2为理疗
 targetTemperature: mode=1时有效，取值范围25-45
 currentTemperature: 当前温度, 不允许省略
 */

@interface WTFRealTimeController ()

@property (weak, nonatomic) IBOutlet UIButton *bedChooseButton;

@property (weak, nonatomic) IBOutlet UIButton *startButton;

@property (weak, nonatomic) IBOutlet UIButton *leftHeatingButton;
@property (weak, nonatomic) IBOutlet UIButton *rightHeatingButton;

@property (weak, nonatomic) IBOutlet UIView *leftTempControlView;
@property (weak, nonatomic) IBOutlet UIButton *leftPlusButton;
@property (weak, nonatomic) IBOutlet UIButton *leftMinusButton;
@property (weak, nonatomic) IBOutlet UIButton *rightPlusButton;
@property (weak, nonatomic) IBOutlet UIButton *rightMinusButton;

@property (weak, nonatomic) IBOutlet UIButton *leftPhysioButton;
@property (weak, nonatomic) IBOutlet UIButton *rightPhysioButton;

@property (weak, nonatomic) IBOutlet UIView *stateView;
@property (weak, nonatomic) IBOutlet UILabel *leftTempLabel;
@property (weak, nonatomic) IBOutlet UILabel *leftCurrentState;

@property (weak, nonatomic) IBOutlet UILabel *rightTempLabel;
@property (weak, nonatomic) IBOutlet UILabel *rightCurrentState;

// Model属性
@property (assign, nonatomic) NSInteger side;
@property (assign, nonatomic) NSInteger leftmode;
@property (assign, nonatomic) NSInteger rightmode;
@property (assign, nonatomic) NSInteger leftTargetTemperature;
@property (assign, nonatomic) NSInteger rightTargetTemperature;
@property (assign, nonatomic) NSInteger leftCurrentTemperature;
@property (assign, nonatomic) NSInteger rightCurrentTemperature;

@property (strong, nonatomic) WTFRealTimeModel *currentState;

@end

@implementation WTFRealTimeController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view from its nib.
    
    [self setupView];
}

- (void)setupView {
    // 设置UI布局
    
    
    // 设置HUD
    [SVProgressHUD setMinimumDismissTimeInterval:1];
}


// 设置控件能否使用
- (void)setControlState:(BOOL)state{
    self.leftHeatingButton.enabled = state;
    self.leftPhysioButton.enabled = state;
    
    self.rightHeatingButton.enabled = state;
    self.rightPhysioButton.enabled = state;
    
    self.leftPlusButton.enabled = state;
    self.leftMinusButton.enabled = state;
    self.rightPlusButton.enabled = state;
    self.rightMinusButton.enabled = state;
}

- (void)refreshViewStateWithModel:(WTFRealTimeModel *)realTimeModel {
    
    if (realTimeModel.powerOn) {
        self.startButton.selected = YES;
    } else {
        self.startButton.selected = NO;
        [self setControlState:NO];
    }
    
    if (realTimeModel.side0 == 1) {
        switch (realTimeModel.mode0) {
            case 0:
                self.leftHeatingButton.selected = NO;
                self.leftPhysioButton.selected = NO;
                self.leftCurrentState.text = @"待机";
                self.leftPlusButton.enabled = NO;
                self.leftMinusButton.enabled = NO;
                break;
                
            case 1:
                self.leftHeatingButton.selected = YES;
                self.leftPhysioButton.selected = NO;
                self.leftCurrentState.text = @"加热";
                if (realTimeModel.targetTemperature0 == 45) {
                    self.leftPlusButton.enabled = NO;
                } else if (realTimeModel.targetTemperature0 == 25) {
                    self.leftMinusButton.enabled = NO;
                }
                break;
                
            case 2:
                self.leftHeatingButton.selected = NO;
                self.leftPhysioButton.selected = YES;
                self.leftCurrentState.text = @"理疗";
                
                self.leftPlusButton.enabled = NO;
                self.leftMinusButton.enabled = NO;
                break;
                
            case 3:
                self.leftHeatingButton.selected = YES;
                self.leftPhysioButton.selected = NO;
                self.leftCurrentState.text = @"预约";
                if (realTimeModel.targetTemperature0 == 45) {
                    self.leftPlusButton.enabled = NO;
                } else if (realTimeModel.targetTemperature0 == 25) {
                    self.leftMinusButton.enabled = NO;
                }
                break;
                
            case 4:
                self.leftHeatingButton.selected = NO;
                self.leftPhysioButton.selected = YES;
                self.leftCurrentState.text = @"预约";
                
                self.leftPlusButton.enabled = NO;
                self.leftMinusButton.enabled = NO;
                break;
                
            default:
                break;
        }
        
        if (realTimeModel.targetTemperature0 >= 25 || realTimeModel.targetTemperature0 <= 45) {
            self.leftTargetTemperature = realTimeModel.targetTemperature0;
            self.leftTempLabel.text = [NSString stringWithFormat:@"%ld°C", (long)self.leftTargetTemperature];
        } else {
            self.leftTargetTemperature = 25;
            self.leftTempLabel.text = [NSString stringWithFormat:@"%ld°C", (long)self.leftTargetTemperature];
        }
        
    } else {
        switch (realTimeModel.mode0) {
            case 0:
                self.rightHeatingButton.selected = NO;
                self.rightPhysioButton.selected = NO;
                self.rightCurrentState.text = @"待机";
                
                self.rightPlusButton.enabled = NO;
                self.rightMinusButton.enabled = NO;
                break;
                
            case 1:
                self.rightHeatingButton.selected = YES;
                self.rightPhysioButton.selected = NO;
                self.rightCurrentState.text = @"加热";
                if (realTimeModel.targetTemperature0 == 45) {
                    self.rightPlusButton.enabled = NO;
                } else if (realTimeModel.targetTemperature0 == 25) {
                    self.rightMinusButton.enabled = NO;
                }
                break;
                
            case 2:
                self.rightHeatingButton.selected = NO;
                self.rightPhysioButton.selected = YES;
                self.rightCurrentState.text = @"理疗";
                
                self.rightPlusButton.enabled = NO;
                self.rightMinusButton.enabled = NO;
                break;
                
            case 3:
                self.rightHeatingButton.selected = YES;
                self.rightPhysioButton.selected = NO;
                self.rightCurrentState.text = @"预约";
                if (realTimeModel.targetTemperature0 == 45) {
                    self.rightPlusButton.enabled = NO;
                } else if (realTimeModel.targetTemperature0 == 25) {
                    self.rightMinusButton.enabled = NO;
                }
                break;
                
            case 4:
                self.rightHeatingButton.selected = NO;
                self.rightPhysioButton.selected = YES;
                self.rightCurrentState.text = @"预约";
                
                self.rightPlusButton.enabled = NO;
                self.rightMinusButton.enabled = NO;
                break;
                
            default:
                break;
        }
        
        if (realTimeModel.targetTemperature0 >= 25 || realTimeModel.targetTemperature0 <= 45) {
            self.rightTargetTemperature = realTimeModel.targetTemperature0;
            self.rightTempLabel.text = [NSString stringWithFormat:@"%ld°C", (long)self.rightTargetTemperature];
        } else {
            self.rightTargetTemperature = 25;
            self.rightTempLabel.text = [NSString stringWithFormat:@"%ld°C", (long)self.rightTargetTemperature];
        }
        
    }
    
    if (realTimeModel.side1 == 1) {
        switch (realTimeModel.mode1) {
            case 0:
                self.leftHeatingButton.selected = NO;
                self.leftPhysioButton.selected = NO;
                self.leftCurrentState.text = @"待机";
                
                self.leftPlusButton.enabled = NO;
                self.leftMinusButton.enabled = NO;
                break;
                
            case 1:
                self.leftHeatingButton.selected = YES;
                self.leftPhysioButton.selected = NO;
                self.leftCurrentState.text = @"加热";
                if (realTimeModel.targetTemperature1 == 45) {
                    self.leftPlusButton.enabled = NO;
                } else if (realTimeModel.targetTemperature1 == 25) {
                    self.leftMinusButton.enabled = NO;
                }
                break;
                
            case 2:
                self.leftHeatingButton.selected = NO;
                self.leftPhysioButton.selected = YES;
                self.leftCurrentState.text = @"理疗";
                
                self.leftPlusButton.enabled = NO;
                self.leftMinusButton.enabled = NO;
                break;
                
            case 3:
                self.leftHeatingButton.selected = YES;
                self.leftPhysioButton.selected = NO;
                self.leftCurrentState.text = @"预约";
                if (realTimeModel.targetTemperature1 == 45) {
                    self.leftPlusButton.enabled = NO;
                } else if (realTimeModel.targetTemperature1 == 25) {
                    self.leftMinusButton.enabled = NO;
                }
                break;
                
            case 4:
                self.leftHeatingButton.selected = NO;
                self.leftPhysioButton.selected = YES;
                self.leftCurrentState.text = @"预约";
                
                self.leftPlusButton.enabled = NO;
                self.leftMinusButton.enabled = NO;
                break;
                
            default:
                break;
        }
        
        if (realTimeModel.targetTemperature1 >= 25 || realTimeModel.targetTemperature1 <= 45) {
            self.leftTargetTemperature = realTimeModel.targetTemperature1;
            self.leftTempLabel.text = [NSString stringWithFormat:@"%ld°C", (long)self.leftTargetTemperature];
        } else {
            self.leftTargetTemperature = 25;
            self.leftTempLabel.text = [NSString stringWithFormat:@"%ld°C", (long)self.leftTargetTemperature];
        }
        
    } else {
        switch (realTimeModel.mode1) {
            case 0:
                self.rightHeatingButton.selected = NO;
                self.rightPhysioButton.selected = NO;
                self.rightCurrentState.text = @"待机";
                
                self.rightPlusButton.enabled = NO;
                self.rightMinusButton.enabled = NO;
                break;
                
            case 1:
                self.rightHeatingButton.selected = YES;
                self.rightPhysioButton.selected = NO;
                self.rightCurrentState.text = @"加热";
                if (realTimeModel.targetTemperature1 == 45) {
                    self.rightPlusButton.enabled = NO;
                } else if (realTimeModel.targetTemperature1 == 25) {
                    self.rightMinusButton.enabled = NO;
                }
                break;
                
            case 2:
                self.rightHeatingButton.selected = NO;
                self.rightPhysioButton.selected = YES;
                self.rightCurrentState.text = @"理疗";
                
                self.rightPlusButton.enabled = NO;
                self.rightMinusButton.enabled = NO;
                break;
                
            case 3:
                self.rightHeatingButton.selected = YES;
                self.rightPhysioButton.selected = NO;
                self.rightCurrentState.text = @"预约";
                if (realTimeModel.targetTemperature1 == 45) {
                    self.rightPlusButton.enabled = NO;
                } else if (realTimeModel.targetTemperature1 == 25) {
                    self.rightMinusButton.enabled = NO;
                }
                break;
                
            case 4:
                self.rightHeatingButton.selected = NO;
                self.rightPhysioButton.selected = YES;
                self.rightCurrentState.text = @"预约";
                
                self.rightPlusButton.enabled = NO;
                self.rightMinusButton.enabled = NO;
                break;
                
            default:
                break;
        }
        
        if (realTimeModel.targetTemperature1 >= 25 || realTimeModel.targetTemperature1 <= 45) {
            self.rightTargetTemperature = realTimeModel.targetTemperature1;
            self.rightTempLabel.text = [NSString stringWithFormat:@"%ld°C", (long)self.rightTargetTemperature];
        } else {
            self.rightTargetTemperature = realTimeModel.targetTemperature1;
            self.rightTempLabel.text = [NSString stringWithFormat:@"%ld°C", (long)self.rightTargetTemperature];
            
        }
        
    }
}

- (IBAction)startButtonClick:(UIButton *)sender {
    if (sender.selected == NO) {
        self.startButton.selected = YES;
        self.leftmode = 0;
        self.rightmode = 0;
        [self setControlState:YES];
        
        self.leftPlusButton.enabled = NO;
        self.leftMinusButton.enabled = NO;
        self.rightPlusButton.enabled = NO;
        self.rightMinusButton.enabled = NO;
        
        [self powerState:1];
    } else {
        self.startButton.selected = NO;
        self.leftmode = 0;
        self.rightmode = 0;
        [self setControlState:NO];
        
        self.leftCurrentState.text = @"待机";
        self.rightCurrentState.text = @"待机";
        
        self.leftHeatingButton.selected = NO;
        self.leftPhysioButton.selected = NO;
        self.rightHeatingButton.selected = NO;
        self.rightPhysioButton.selected = NO;
        
        [self powerState:0];
    }
}

#pragma mark - 左侧功能

- (IBAction)leftHeatingClick:(UIButton *)sender {
    if (sender.selected == NO) {
        self.leftHeatingButton.selected = YES;
        self.leftPhysioButton.selected = NO;
        self.leftCurrentState.text = @"加热";
        self.leftmode = 1;
        self.leftPlusButton.enabled = YES;
        self.leftMinusButton.enabled = YES;
        if ([self.leftTempLabel.text integerValue] == 45) {
            self.leftPlusButton.enabled = NO;
        } else if ([self.leftTempLabel.text integerValue] == 25) {
            self.leftMinusButton.enabled = NO;
        }
    } else {
        self.leftHeatingButton.selected = NO;
        self.leftCurrentState.text = @"待机";
        self.leftmode = 0;
        self.leftPlusButton.enabled = NO;
        self.leftMinusButton.enabled = NO;
    }
    
    [self confirmChangeWithMessageId:52];
}

- (IBAction)leftTempPlusClick {
    
    self.leftTargetTemperature = self.leftTargetTemperature + 1;
    
    if (self.leftTargetTemperature >= 45) {
        self.leftPlusButton.enabled = NO;
    } else if (self.leftTargetTemperature >= 25) {
        self.leftMinusButton.enabled = YES;
    }
    
    self.leftTempLabel.text = [NSString stringWithFormat:@"%ld°C", (long)self.leftTargetTemperature];
    
    [self confirmChangeWithMessageId:52];
}

- (IBAction)leftTempMinusClick {
    
    self.leftTargetTemperature = self.leftTargetTemperature - 1;
    
    if (self.leftTargetTemperature <= 25) {
        self.leftMinusButton.enabled = NO;
    }
    if (self.leftTargetTemperature <= 45) {
        self.leftPlusButton.enabled = YES;
    }
    self.leftTempLabel.text =  [NSString stringWithFormat:@"%ld°C", (long)self.leftTargetTemperature];

    [self confirmChangeWithMessageId:52];
}

- (IBAction)leftPhysioClick:(UIButton *)sender {
    if (sender.selected == NO) {
        self.leftHeatingButton.selected = NO;
        self.leftPhysioButton.selected = YES;
        self.leftCurrentState.text = @"理疗";
        self.leftmode = 2;
        self.leftPlusButton.enabled = NO;
        self.leftMinusButton.enabled = NO;
    } else {
        self.leftPhysioButton.selected = NO;
        self.leftCurrentState.text = @"待机";
        self.leftmode = 0;
    }
    [self confirmChangeWithMessageId:52];
}

#pragma mark - 右侧功能

- (IBAction)rightHeatingClick:(UIButton *)sender {
    if (sender.selected == NO) {
        self.rightHeatingButton.selected = YES;
        self.rightPhysioButton.selected = NO;
        self.rightCurrentState.text = @"加热";
        self.rightmode = 1;
        self.rightPlusButton.enabled = YES;
        self.rightMinusButton.enabled = YES;
        if ([self.rightTempLabel.text integerValue] == 45) {
            self.rightPlusButton.enabled = NO;
        } else if ([self.rightTempLabel.text integerValue] == 25) {
            self.rightMinusButton.enabled = NO;
        }
    } else {
        self.rightHeatingButton.selected = NO;
        self.rightCurrentState.text = @"待机";
        self.rightmode = 0;
        self.rightPlusButton.enabled = NO;
        self.rightMinusButton.enabled = NO;
    }
    [self confirmChangeWithMessageId:52];
}

- (IBAction)rightTempPlusClick:(UIButton *)sender {
    
    self.rightTargetTemperature = self.rightTargetTemperature + 1;
    
    if (self.rightTargetTemperature >= 45) {
        self.rightPlusButton.enabled = NO;
    }
    if (self.rightTargetTemperature >= 25) {
        self.rightMinusButton.enabled = YES;
    }
    
    self.rightTempLabel.text = [NSString stringWithFormat:@"%ld°C", (long)self.rightTargetTemperature];
    
    [self confirmChangeWithMessageId:52];
}

- (IBAction)rightTempMinusClick:(UIButton *)sender {
    
    self.rightTargetTemperature = self.rightTargetTemperature - 1;
    
    if (self.rightTargetTemperature <= 25) {
        self.rightMinusButton.enabled = NO;
    }
    if (self.rightTargetTemperature <= 45) {
        self.rightPlusButton.enabled = YES;
    }
    self.rightTempLabel.text =  [NSString stringWithFormat:@"%ld°C", (long)self.rightTargetTemperature];
    
    [self confirmChangeWithMessageId:52];
}

- (IBAction)rightPhysioClick:(UIButton *)sender {
    if (sender.selected == NO) {
        self.rightHeatingButton.selected = NO;
        self.rightPhysioButton.selected = YES;
        self.rightCurrentState.text = @"理疗";
        self.rightmode = 2;
        self.rightPlusButton.enabled = NO;
        self.rightMinusButton.enabled = NO;
    } else {
        self.rightPhysioButton.selected = NO;
        self.rightCurrentState.text = @"待机";
        self.rightmode = 0;
    }
    [self confirmChangeWithMessageId:52];
}

#pragma mark - view加载方法

- (void)viewWillAppear:(BOOL)animated {
    [self.bedChooseButton setTitle:HardwareName forState:UIControlStateNormal];
    [self registToServer];
    [self stateQueryingWithMessageId:51 tag:51];
}

- (void)viewWillDisappear:(BOOL)animated {
    _connection.delegate = nil;
    [self closeConnection];
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    [defaults setObject:@"0" forKey:@"save"];
    [defaults synchronize];
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
    regist.msgId = 50;
    regist.msgType = 1;
    regist.version = @"2.0";
    regist.state = 1;
    regist.body = body;
    
    NSString *registString = regist.mj_JSONString;
    
    [self writeAndReadSocketData:registString tag:50];
}

- (void)powerState:(NSInteger)powerOn {
    NSDictionary *paramDict = @{@"powerOn":@(powerOn)};
    
    [WTFBodyModel mj_setupAllowedPropertyNames:^NSArray *{
        return @[@"version", @"cmd", @"params"];
    }];
    
    WTFBodyModel *body = [[WTFBodyModel alloc] init];
    body.version = @"1.0";
    body.cmd = 20;
    body.params = @[paramDict];
    
    WTFTransModel *powerState = [[WTFTransModel alloc] init];
    powerState.from = userDevice;
    powerState.to = HardwareID;
    powerState.msgId = 54;
    powerState.msgType = 1;
    powerState.version = @"2.0";
    powerState.state = 1;
    powerState.body = body;
    
    NSString *powerString = powerState.mj_JSONString;
    
    [self writeAndReadSocketData:powerString tag:54];
}

// 传入side msgId tag来查询某个side的信息
- (void)stateQueryingWithMessageId:(NSInteger)msgId tag:(long)tag{
    
    self.side = 2;
    
    NSDictionary *paramDict = @{@"side":@(self.side)};
    
    [WTFBodyModel mj_setupAllowedPropertyNames:^NSArray *{
        return @[@"version", @"cmd", @"params"];
    }];
    
    WTFBodyModel *body = [[WTFBodyModel alloc] init];
    body.version = @"1.0";
    body.cmd = 32;
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
- (void)confirmChangeWithMessageId:(NSInteger)msgId {
    
    [WTFParamsModel mj_setupAllowedPropertyNames:^NSArray *{
        return @[@"side", @"mode", @"currentTemperature", @"targetTemperature"];
    }];
    
    WTFParamsModel *changeParam0 = [[WTFParamsModel alloc] init];
    changeParam0.side = 0;
    changeParam0.mode = self.rightmode;
    changeParam0.currentTemperature = self.rightCurrentTemperature;
    changeParam0.targetTemperature = self.rightTargetTemperature;
    NSDictionary *paramDict0 = changeParam0.mj_keyValues;
    
    WTFParamsModel *changeParam1 = [[WTFParamsModel alloc] init];
    changeParam1.side = 1;
    changeParam1.mode = self.leftmode;
    changeParam1.currentTemperature = self.leftCurrentTemperature;
    changeParam1.targetTemperature = self.leftTargetTemperature;
    NSDictionary *paramDict1 = changeParam1.mj_keyValues;
    
    [WTFBodyModel mj_setupAllowedPropertyNames:^NSArray *{
        return @[@"version", @"cmd", @"params"];
    }];
    
    WTFBodyModel *body = [[WTFBodyModel alloc] init];
    body.version = @"1.0";
    body.cmd = 16;
    body.params = @[paramDict0, paramDict1];
    
    WTFTransModel *changeConfirm = [[WTFTransModel alloc] init];
    changeConfirm.from = userDevice;
    changeConfirm.to = HardwareID;
    changeConfirm.msgId = msgId;
    changeConfirm.msgType = 1;
    changeConfirm.version = @"2.0";
    changeConfirm.state = 1;
    changeConfirm.body = body;
    
    NSString *changeString = changeConfirm.mj_JSONString;
    
    [self writeAndReadSocketData:changeString tag:52];
}

- (void)writeAndReadSocketData:(NSString *)jsonString tag:(long)tag {
    _serverHost = serverHost;
    _serverPort = serverPort;
    
    NSString *content = [jsonString stringByAppendingString:@"\r\n"];
    NSData *data = [content dataUsingEncoding:NSUTF8StringEncoding];
    
    if (tag == 50) {
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
    _connection = [RHSocketConnection ShareRHSocketConnection];
    _connection.delegate = self;
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
    //RHSocketLog(@"[RHSocketConnection RealTime] didDisconnectWithError: %@", error);
    if (error) {
        [self viewDidLoad];
        //[SVProgressHUD showErrorWithStatus:@"连接断开请点击远程控制刷新"];
    }
}

- (void)didConnectToHost:(NSString *)host port:(UInt16)port {
    //RHSocketLog(@"[RHSocketConnection RealTime] didConnectToHost.");
}

- (void)didReceiveData:(NSData *)data tag:(long)tag {
    NSString *dataStr = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
    RHSocketLog(@"[RHSocketConnection RealTime] didReceiveData--tag: %ld, data: %@", tag, dataStr);
    
    self.currentState = [WTFRealTimeModel mj_objectWithKeyValues:dataStr];
    
    switch (_currentState.state) {
        case 1:
            
            if (self.currentState.msgId == 51) {
                [self refreshViewStateWithModel:self.currentState];
                
                [SVProgressHUD showSuccessWithStatus:@"获取数据成功"];
            }
            
            // 更改成功反馈
            if (self.currentState.msgId == 52) {
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
