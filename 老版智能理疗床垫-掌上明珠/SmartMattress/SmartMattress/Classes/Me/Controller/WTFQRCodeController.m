//
//  WTFQRCodeController.m
//  SmartMattress
//
//  Created by William Cai on 2016/12/19.
//  Copyright © 2016年 lesmarthome. All rights reserved.
//

#import "WTFQRCodeController.h"

#import <CoreImage/CoreImage.h>

@interface WTFQRCodeController ()

@property (weak, nonatomic) IBOutlet UIImageView *imageView;

@end

@implementation WTFQRCodeController

@synthesize QRCode;

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view from its nib.
    
    [self setupView];
    [self createQRImage];
    
}

- (void)setupView {
    
    // 设置UI
    self.title = @"设备二维码";
    
    self.view.backgroundColor = GlobalBackground;
    
}

- (void)createQRImage {
    // 1.创建过滤器 -- 苹果没有将这个字符封装成常量
    
    CIFilter *filter = [CIFilter filterWithName:@"CIQRCodeGenerator"];

    // 2.过滤器恢复默认设置
    [filter setDefaults];
    
    // 3.给过滤器添加数据(正则表达式/帐号和密码) -- 通过KVC设置过滤器,只能设置NSData类型
    NSString *dataString = QRCode;
    NSData *data = [dataString dataUsingEncoding:NSUTF8StringEncoding];
    [filter setValue:data forKeyPath:@"inputMessage"];
    
    // 4.获取输出的二维码
    CIImage *outputImage = [filter outputImage];
    
    // 5.显示二维码
    self.imageView.image = [UIImage imageWithCIImage:outputImage];
}



@end
