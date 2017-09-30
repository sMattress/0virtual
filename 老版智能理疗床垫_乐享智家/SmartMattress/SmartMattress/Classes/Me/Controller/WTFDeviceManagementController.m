//
//  WTFDeviceManagementController.m
//  SmartMattress
//
//  Created by William Cai on 2016/11/22.
//  Copyright © 2016年 lesmarthome. All rights reserved.
//

#import "WTFDeviceManagementController.h"
#import "WTFMainViewController.h"

#import "WTFQRCodeController.h"
#import "WTFEditDeviceController.h"
#import "WTFWiFiConfigController.h"

#import "WTFDeviceListCell.h"

#import "WTFFlagDModel.h"
#import "WTFDeviceInfoModel.h"
#import "WTFMeBodyModel.h"
#import "WTFMeParamsModel.h"

#import "DDQRCodeViewController.h"

#import "AFNetworking.h"
#import "MJExtension.h"
#import "SVProgressHUD.h"

@interface WTFDeviceManagementController () <UITableViewDelegate, UITableViewDataSource>

@property (weak, nonatomic) IBOutlet UITableView *deviceTableView;
@property (weak, nonatomic) IBOutlet UIButton *deviceConfigButton;

@property (copy, nonatomic) NSString *strValue;
@property (strong, nonatomic) UILabel *tipLabel;

@end

@implementation WTFDeviceManagementController

static NSString * const DeviceCellID = @"DeviceCell";

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view from its nib.
    
    [self setupView];
}

- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:YES];
    
    // 修改状态栏颜色
    [[UIApplication sharedApplication] setStatusBarStyle:UIStatusBarStyleDefault];
    
    [self initDeviceData];
    
}

- (void)setupView {
    self.title = @"设备管理";
    
    self.view.backgroundColor = GlobalBackground;
    
    [self.deviceTableView registerNib:[UINib nibWithNibName:NSStringFromClass([WTFDeviceListCell class]) bundle:nil] forCellReuseIdentifier:DeviceCellID];
    
    // 设置HUD
    [SVProgressHUD setMinimumDismissTimeInterval:1];
    
    // 隐藏多余的cell
    self.deviceTableView.tableFooterView = [[UIView alloc] initWithFrame:CGRectZero];
    // 快速取消分割线
    //self.deviceTableView.tableFooterView = [[UIView alloc] init];
    
    self.tipLabel = [[UILabel alloc] init];
    self.tipLabel.frame = CGRectMake(0, 10, ScreenWidth, 40);
    self.tipLabel.textColor = [UIColor grayColor];
    self.tipLabel.backgroundColor = [UIColor clearColor];
    self.tipLabel.font = [UIFont systemFontOfSize:15];
    self.tipLabel.textAlignment = NSTextAlignmentCenter;
    self.tipLabel.autoresizingMask = UIViewAutoresizingFlexibleRightMargin | UIViewAutoresizingFlexibleLeftMargin;
    
    [self.deviceTableView.tableFooterView addSubview:self.tipLabel];
}

//adddevice已经替换成扫一扫  strValue就是扫描获得的字符串
- (IBAction)addDevice {
    
    DDQRCodeViewController *vc = [[DDQRCodeViewController alloc] initWithScanCompleteHandler:^(NSString *strValue) {
        UIAlertController *alertController = [UIAlertController alertControllerWithTitle:@"是否添加扫描到的设备" message:[NSString stringWithFormat:@"设备号: %@", strValue]  preferredStyle:UIAlertControllerStyleAlert];
        
        UIAlertAction *okAction = [UIAlertAction actionWithTitle:@"添加" style:UIAlertActionStyleDefault handler:^(UIAlertAction * _Nonnull action) {
            
            self.strValue = strValue;
            [self postBindWithDeviceName:strValue];
            [self.navigationController popViewControllerAnimated:YES];
            
        }];
        
        UIAlertAction *cancleAction = [UIAlertAction actionWithTitle:@"取消" style:UIAlertActionStyleDefault handler:nil];
        
        [alertController addAction:cancleAction];
        [alertController addAction:okAction];
        
        [self presentViewController:alertController animated:YES completion:nil];
    }];
    
    [self.navigationController pushViewController:vc animated:YES];
    
}

- (NSMutableArray *)deviceArray {
    if (!_deviceArray) {
        _deviceArray = [NSKeyedUnarchiver unarchiveObjectWithFile:DeviceFilePath];
        if (_deviceArray == nil) {
            _deviceArray  = [NSMutableArray array];
        }
    }
    return _deviceArray;
}

#pragma mark - TableView data source

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
    return self.deviceArray.count ;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:DeviceCellID];
    WTFDeviceInfoModel *deviceModel = self.deviceArray[indexPath.row];
    
    cell.textLabel.text = deviceModel.alias;
    cell.detailTextLabel.text = deviceModel.device_name;
    
    cell.accessoryType = UITableViewCellAccessoryDisclosureIndicator;
    
    return cell;
}

#pragma mark - UITableView delagate

-(NSArray<UITableViewRowAction *> *)tableView:(UITableView *)tableView editActionsForRowAtIndexPath:(NSIndexPath *)indexPath {
    
    UITableViewRowAction *deleteAction = [UITableViewRowAction rowActionWithStyle:UITableViewRowActionStyleDestructive title:@"删除" handler:^(UITableViewRowAction * _Nonnull action, NSIndexPath * _Nonnull indexPath) {
        
        WTFDeviceInfoModel *temp = [[WTFDeviceInfoModel alloc] init];
        temp = self.deviceArray[indexPath.row];
        
        [self PostUnbindWithDeviceName:temp.device_name];
        
        //1.删除数据模型
        [self.deviceArray removeObjectAtIndex:indexPath.row];
        //2.刷新表视图
        [self.deviceTableView deleteRowsAtIndexPaths:@[indexPath] withRowAnimation:UITableViewRowAnimationTop];
        
    }];
    
    UITableViewRowAction *resetAction = [UITableViewRowAction rowActionWithStyle:UITableViewRowActionStyleDefault title:@"二维码" handler:^(UITableViewRowAction * _Nonnull action, NSIndexPath * _Nonnull indexPath) {
        
        WTFDeviceInfoModel *temp = [[WTFDeviceInfoModel alloc] init];
        temp = self.deviceArray[indexPath.row];
        
        WTFQRCodeController *codeVC = [[WTFQRCodeController alloc] init];
        codeVC.QRCode = temp.device_name;
        [self.navigationController pushViewController:codeVC animated:YES];
        
    }];
    
    UITableViewRowAction *editAction = [UITableViewRowAction rowActionWithStyle:UITableViewRowActionStyleNormal title:NSLocalizedString(@"重命名", nil) handler:^(UITableViewRowAction * _Nonnull action, NSIndexPath * _Nonnull indexPath) {
        
        WTFEditDeviceController *editDeviceVC = [[WTFEditDeviceController alloc] init];
        //取得选中的那一行
        editDeviceVC.deviceModel = self.deviceArray[indexPath.row];
        
        [self.navigationController pushViewController:editDeviceVC animated:YES];
        
        [tableView deselectRowAtIndexPath:indexPath animated:YES];
    }];
    
    resetAction.backgroundColor = RGBColor(0, 118, 255);
    
    return @[deleteAction, resetAction, editAction];
}

-(void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
    
    //NSIndexPath *path = [self.deviceTableView indexPathForSelectedRow];
    WTFDeviceInfoModel *deviceModel = self.deviceArray[indexPath.row];
    
    [[NSUserDefaults standardUserDefaults] setObject:deviceModel.alias forKey:@"DeviceName"];
    [[NSUserDefaults standardUserDefaults] setObject:deviceModel.device_name forKey:@"DeviceNumber"];
    [[NSUserDefaults standardUserDefaults] synchronize];
    
    [tableView deselectRowAtIndexPath:indexPath animated:YES];
    
    WTFMainViewController *mainVC = [[WTFMainViewController alloc] init];
    [UIApplication sharedApplication].keyWindow.rootViewController = mainVC;
}

- (CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath {
    return 49;
}

#pragma mark - WiFi配网
- (IBAction)WiFiConfigClick {
    WTFWiFiConfigController *wifiConfigVC = [[WTFWiFiConfigController alloc] init];
    [self.navigationController pushViewController:wifiConfigVC animated:YES];
}

#pragma mark - 查询、绑定、解绑设备

// 查询设备列表
- (void) initDeviceData{
    
    [SVProgressHUD show];
    
    AFHTTPSessionManager *manager = [AFHTTPSessionManager manager];
    manager.responseSerializer.acceptableContentTypes = [NSSet setWithObjects:@"application/json", @"text/html", @"text/json", @"text/javascript", nil];
    
    manager.requestSerializer.timeoutInterval = 5.f;
    
    NSString *url = @"/v1/user/device/list";
    NSString *listURL = [url getSecureUrl:url];
    
    [manager GET:listURL parameters:nil progress:nil success:^(NSURLSessionDataTask * _Nonnull task, id  _Nullable responseObject) {
        
        WTFMeBodyModel *meBodyModel = [WTFMeBodyModel mj_objectWithKeyValues:responseObject];
        
        if (meBodyModel.flag == 1) {
            
            
            [SVProgressHUD dismiss];
            
            _deviceArray = [NSMutableArray arrayWithArray:meBodyModel.params];
            
            [self.deviceTableView reloadData];
            
            if (HardwareID == nil) {
                self.tipLabel.text = @"请选择一个设备或者点击下面按钮添加设备";
            } else {
                self.tipLabel.text = @"单击进入控制界面，右滑查看更多选项";
            }
            
        } else if (meBodyModel.flag == 0) {
            [SVProgressHUD dismiss];
            [SVProgressHUD showErrorWithStatus:@"获取数据失败"];
        }
        
    } failure:^(NSURLSessionDataTask * _Nullable task, NSError * _Nonnull error) {
        [SVProgressHUD showErrorWithStatus:@"无网络连接"];
    }];
}

// 绑定设备 配完网络要绑定设备 扫到二维码字符要绑定设备  只有一个参数device_name
- (void)postBindWithDeviceName:(NSString *)device_name {
    
    [SVProgressHUD show];
    
    AFHTTPSessionManager *manager = [AFHTTPSessionManager manager];
    manager.responseSerializer.acceptableContentTypes =  [NSSet setWithObjects:@"application/json", @"text/html", @"text/json", @"text/javascript", nil];
    
    manager.requestSerializer.timeoutInterval = 5.f;
    
    NSDictionary *paramDict = @{@"device_name": device_name};
    
    NSString *bindURL = @"/v1/user/device/bind";
    NSString *secureURL = [bindURL getSecureUrl:bindURL];
    
    [manager POST:secureURL parameters:paramDict progress:nil success:^(NSURLSessionDataTask * _Nonnull task, id  _Nullable responseObject) {
        
        WTFFlagDModel *model1 = [WTFFlagDModel mj_objectWithKeyValues:responseObject];
        
        if (model1.flag) {
            
            WTFDeviceInfoModel *deviceModel = [[WTFDeviceInfoModel alloc] init];
            
            deviceModel.device_name = self.strValue;
            deviceModel.alias = @"新设备";
            
            [self.deviceArray addObject:deviceModel];//插入数据还没有做，因为模型不一样
            //2.刷新表视图
            [self.deviceTableView reloadData];
            
            [SVProgressHUD dismiss];
            [SVProgressHUD showSuccessWithStatus:@"操作成功"];
        } else {
            
            switch (model1.err_code) {
                case 18:
                    [SVProgressHUD dismiss];
                    [SVProgressHUD showErrorWithStatus:@"请勿重复绑定"];
                    break;
                    
                case 19:
                    [SVProgressHUD dismiss];
                    [SVProgressHUD showErrorWithStatus:@"设备未在线，请检查设备"];
                    break;
                    
                default:
                    break;
            }
        }
    } failure:^(NSURLSessionDataTask * _Nullable task, NSError * _Nonnull error) {
        [SVProgressHUD showErrorWithStatus:@"无网络连接"];
    }];
}

// 删除设备，即解绑设备 只传输一个device_name参数
- (void)PostUnbindWithDeviceName:(NSString *)device_name {
    
    [SVProgressHUD show];
    
    AFHTTPSessionManager *manager = [AFHTTPSessionManager manager];
    manager.responseSerializer.acceptableContentTypes = [NSSet setWithObjects:@"application/json", @"text/html", @"text/json", @"text/javascript", nil];
    
    manager.requestSerializer.timeoutInterval = 5.f;
    
    NSDictionary *paramDic = @{@"device_name": device_name};
    
    NSString *unbindURL = @"/v1/user/device/unbind";
    NSString *secureURL = [unbindURL getSecureUrl:unbindURL];
    
    [manager POST:secureURL parameters:paramDic progress:nil success:^(NSURLSessionDataTask * _Nonnull task, id  _Nullable responseObject) {
        
        WTFFlagDModel *model1 = [WTFFlagDModel mj_objectWithKeyValues:responseObject];
        if (model1.flag) {
            
            NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
            [defaults removeObjectForKey:@"DeviceNumber"];
            
            [SVProgressHUD dismiss];
            [SVProgressHUD showSuccessWithStatus:@"操作成功"];
            
            [self initDeviceData];
            
        } else {
            [SVProgressHUD dismiss];
            [SVProgressHUD showErrorWithStatus:@"操作失败"];
            
        }
    } failure:^(NSURLSessionDataTask * _Nullable task, NSError * _Nonnull error) {
        [SVProgressHUD showErrorWithStatus:@"无网络连接"];
    }];
}

@end
