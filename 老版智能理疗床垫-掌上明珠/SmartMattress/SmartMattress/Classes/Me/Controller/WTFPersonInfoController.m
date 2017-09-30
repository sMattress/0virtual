//
//  WTFPersonInfoController.m
//  SmartMattress
//
//  Created by William Cai on 2016/12/14.
//  Copyright © 2016年 lesmarthome. All rights reserved.
//

#import "WTFPersonInfoController.h"

#import "WTFEditNameController.h"
#import "WTFEditSexController.h"
#import "WTFEditBirthController.h"

#import "WTFInfoCell.h"

#import "WTFMeInfoModel.h"

#import "AFNetworking.h"
#import "MJExtension.h"
#import "SVProgressHUD.h"

@interface WTFPersonInfoController () <UITableViewDataSource, UITableViewDelegate>

@property (weak, nonatomic) IBOutlet UITableView *infoTableView;

@property (strong, nonatomic) WTFMeInfoModel *infoModel;

@end

@implementation WTFPersonInfoController

static NSString * const InfoCellID = @"InfoCell";

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view from its nib.
    
    [self setupView];
}

- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:YES];
    
    [self getInfoData];
}

- (void)setupView {
    
    // 设置UI
    self.view.backgroundColor = GlobalBackground;
    
    // 初始化cell
    [self.infoTableView registerNib:[UINib nibWithNibName:NSStringFromClass([WTFInfoCell class]) bundle:nil] forCellReuseIdentifier:InfoCellID];
    
    // 隐藏多余的cell
    self.infoTableView.tableFooterView = [[UIView alloc] initWithFrame:CGRectZero];
}

- (void)getInfoData {
    
    [SVProgressHUD show];
    
    AFHTTPSessionManager *manager = [AFHTTPSessionManager manager];
    manager.responseSerializer.acceptableContentTypes = [NSSet setWithObjects:@"application/json", @"text/html", @"text/json", @"text/javascript", nil];
    
    manager.requestSerializer.timeoutInterval = 5.f;
    
    NSString *infoURL = @"/v1/user/get/base_info";
    NSString *secureURL = [infoURL getSecureUrl:infoURL];
    
    [manager GET:secureURL parameters:nil progress:nil success:^(NSURLSessionDataTask * _Nonnull task, id  _Nullable responseObject) {
        
        [SVProgressHUD dismiss];
        
        self.infoModel = [WTFMeInfoModel mj_objectWithKeyValues:responseObject];
        
        NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
        [defaults setObject:self.infoModel.name forKey:@"name"];
        [defaults setInteger:self.infoModel.sex forKey:@"sex"];
        [defaults setObject:self.infoModel.birthday forKey:@"birthday"];
        
        [self.infoTableView reloadData];
        
    } failure:^(NSURLSessionDataTask * _Nullable task, NSError * _Nonnull error) {
        [SVProgressHUD showErrorWithStatus:@"无网络连接"];
    }];
}

#pragma mark - TableView DataSource

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
    return 3;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath {
    
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:InfoCellID];
    
    switch (indexPath.row) {
        case 0: {
            cell.textLabel.text = @"名字";
            cell.detailTextLabel.text = self.infoModel.name;
            break;
        }
            
        case 1: {
            cell.textLabel.text = @"性别";
            if (self.infoModel.sex) {
                cell.detailTextLabel.text = @"男";
            } else {
                cell.detailTextLabel.text = @"女";
            }
            break;
        }
            
        case 2: {
            cell.textLabel.text = @"出生日期";
            cell.detailTextLabel.text = self.infoModel.birthday;
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
            WTFEditNameController *editNameVC = [[WTFEditNameController alloc] init];
            [self.navigationController pushViewController:editNameVC animated:YES];
            break;
        }
            
        case 1: {
            WTFEditSexController *editSexVC = [[WTFEditSexController alloc] init];
            [self.navigationController pushViewController:editSexVC animated:YES];
            break;
        }
        
        case 2: {
            WTFEditBirthController *editBirthVC = [[WTFEditBirthController alloc] init];
            [self.navigationController pushViewController:editBirthVC animated:YES];
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
