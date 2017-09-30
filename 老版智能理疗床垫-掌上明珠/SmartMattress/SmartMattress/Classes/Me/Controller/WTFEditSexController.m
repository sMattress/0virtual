//
//  WTFEditSexController.m
//  SmartMattress
//
//  Created by William Cai on 2016/12/14.
//  Copyright © 2016年 lesmarthome. All rights reserved.
//

#import "WTFEditSexController.h"

#import "WTFSexCell.h"

#import "AFNetworking.h"
#import "MJExtension.h"
#import "SVProgressHUD.h"

@interface WTFEditSexController () <UITableViewDataSource, UITableViewDelegate>

@property (weak, nonatomic) IBOutlet UITableView *sexTableView;

@end

@implementation WTFEditSexController

static NSString * const SexCellID = @"SexCell";

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view from its nib.
    
    [self setupView];
}

- (void)setupView {
    
    // 设置UI
    self.title = @"性别";
    
    self.view.backgroundColor = GlobalBackground;
    
    // 设置HUD
    [SVProgressHUD setMinimumDismissTimeInterval:1];
    
    // 初始化cell
    [self.sexTableView registerNib:[UINib nibWithNibName:NSStringFromClass([WTFSexCell class]) bundle:nil] forCellReuseIdentifier:SexCellID];
    
}

- (void)updateInfo:(NSInteger)sex {
    
    AFHTTPSessionManager *manager = [AFHTTPSessionManager manager];
    manager.responseSerializer.acceptableContentTypes = [NSSet setWithObjects:@"application/json", @"text/html", @"text/json", @"text/javascript", nil];
    
    manager.requestSerializer.timeoutInterval = 5.f;
    
    NSDictionary *paramDic = @{@"sex": @(sex)};
    
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

#pragma mark - TableView DataSource

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
    return 2;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath {
    
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:SexCellID];
    
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    NSInteger sex = [defaults integerForKey:@"sex"];
    
    switch (indexPath.row) {
        case 0: {
            cell.textLabel.text = @"男";
            if (sex == 1) {
                cell.accessoryType = UITableViewCellAccessoryCheckmark;
            }
            break;
        }
            
        case 1: {
            cell.textLabel.text = @"女";
            if (sex == 0) {
                cell.accessoryType = UITableViewCellAccessoryCheckmark;
            }
            break;
        }
            
        default:
            break;
    }
    
    return cell;
}

#pragma mark - TableView Delegate

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
    switch (indexPath.row) {
        case 0: {
            [self updateInfo:1];
            break;
        }
            
        case 1: {
            [self updateInfo:0];
            break;
        }
            
        default:
            break;
    }
    
    [tableView deselectRowAtIndexPath:indexPath animated:YES];
}


- (CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath {
    return 45;
}

@end
