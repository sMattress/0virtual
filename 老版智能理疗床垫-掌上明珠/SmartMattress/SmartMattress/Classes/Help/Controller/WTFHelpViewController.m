//
//  WTFHelpViewController.m
//  SmartMattress
//
//  Created by William Cai on 2016/11/22.
//  Copyright © 2016年 lesmarthome. All rights reserved.
//

#import "WTFHelpViewController.h"
#import "WTFHelpContentController.h"
#import "WTFHelpHeaderView.h"

#import "WTFKnowledgeCell.h"

#import "WTFKnowledgeModel.h"

#import <MJExtension/MJExtension.h>

#define helpBaseURL @"http://help.lesmarthome.com/smartmattress/content/"

@interface WTFHelpViewController () <UITableViewDelegate, UITableViewDataSource>

@property (weak, nonatomic) IBOutlet UITableView *helpTableView;
@property (strong,nonatomic) WTFHelpContentController *helpVC;

@end

@implementation WTFHelpViewController

static NSString * const KnowledgeCellID = @"KnowledgeCell";

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view from its nib.
    
    _helpVC = [[WTFHelpContentController alloc] init];
    
    // 设置背景色
    self.helpTableView.backgroundColor = [UIColor clearColor];
    
    self.helpTableView.separatorStyle = UITableViewCellSeparatorStyleNone;
    
    // 调整header和footer
    self.helpTableView.sectionHeaderHeight = 0;
    self.helpTableView.sectionFooterHeight = 0;
    
    // 调整inset
    self.helpTableView.contentInset = UIEdgeInsetsMake(0, 0, 0, 0);
    
    // 设置footerView
    self.helpTableView.tableHeaderView = [[WTFHelpHeaderView alloc] init];
    
    [self.helpTableView registerNib:[UINib nibWithNibName:NSStringFromClass([WTFKnowledgeCell class]) bundle:nil] forCellReuseIdentifier:KnowledgeCellID];
    
}

- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:YES];
    
    // 修改状态栏颜色
    [[UIApplication sharedApplication] setStatusBarStyle:UIStatusBarStyleDefault];
}

#pragma mark - Table view data source

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
    return 3;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath {
    
    WTFKnowledgeCell *cell = [tableView dequeueReusableCellWithIdentifier:KnowledgeCellID];
    
    NSArray *dictArray = @[
                           @{
                               @"title"   : @"什么是远红外",
                               @"image"   : @"knowledge_brief_1_img",
                               @"content" : @"太阳光线大致可分为可见光及不可见光。可见光经三棱镜后会折射出紫、蓝、青、绿、黄、橙、红颜色的光线（光谱）。红光外侧的光线，在光谱中波长自0.75至1000微米的一段被称为红外光，又称红外线。"
                               },
                           @{
                               @"title" : @"什么是智能温度曲线",
                               @"image" : @"knowledge_brief_2_img",
                               @"content" : @"本智能理疗床垫，可根据人体在睡眠期间基础体温的上升和下降曲线以及在整个睡眠期间内人体体温的周期性变化规律，智能地调节加热温度，从而使床垫温度始终随着体温的变化而变化，使床垫在您睡眠期间不致于过热或过冷，科学地提高睡眠的舒适性。"
                               },
                           @{
                               @"title" : @"公司简介",
                               @"image" : @"corporate_brief_img",
                               @"content" : @"成都市明珠家具(集团)有限公司始创于1989年，公司以“引领现代家居生活方式”为自己的使命，并以“建中国管理卓越企业 ，创世界家居一流品牌”为自己的企业愿景，经过多年的励精图治，已发展成集研发、生产、销售、服务于一体的大型现代家具企业集团，旗下业务涵盖成品家具制造与销售、定制家具制造与销售、网购家具制造与销售、家居用品零售、家居专业物流和家具专业售后服务六大业务模块。"
                               }
                           ];
    
    NSArray *knowledges = [WTFKnowledgeModel mj_objectArrayWithKeyValuesArray:dictArray];
    
    cell.knowledgeModel = knowledges[indexPath.row];
    
    return cell;
}

#pragma mark - Table view delegate

// In a xib-based application, navigation from a table can be handled in -tableView:didSelectRowAtIndexPath:
- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
    
    switch (indexPath.row) {
        case 0:
        {
            _helpVC.helpURL = [helpBaseURL stringByAppendingString:@"%E8%BF%9C%E7%BA%A2%E5%A4%96.html"];
            _helpVC.title = @"远红外";
            
            [self.navigationController pushViewController:_helpVC animated:YES];
        }
            break;
            
        case 1:
        {
            _helpVC.helpURL = [helpBaseURL stringByAppendingString:@"%E6%99%BA%E8%83%BD%E6%B8%A9%E5%BA%A6%E6%9B%B2%E7%BA%BF.html"];
            _helpVC.title = @"智能温度曲线";
            
            [self.navigationController pushViewController:_helpVC animated:YES];
        }
            break;
            
        case 2:
        {
            _helpVC.helpURL = @"http://www.zsmz.com";
            _helpVC.title = @"公司简介";
            
            [self.navigationController pushViewController:_helpVC animated:YES];
        }
            break;
            
        default:
            break;
    }
    
    [tableView deselectRowAtIndexPath:indexPath animated:YES];
}

- (CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath {
    return 150;
}

@end
