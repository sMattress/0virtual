//
//  WTFHelpButton.m
//  SmartMattress
//
//  Created by William Cai on 2017/1/7.
//  Copyright © 2017年 lesmarthome. All rights reserved.
//

#import "WTFHelpButton.h"

#import "WTFHelpModel.h"

@implementation WTFHelpButton

- (void)setup
{
    self.titleLabel.textAlignment = NSTextAlignmentCenter;
    [self setTitleColor:[UIColor whiteColor] forState:UIControlStateNormal];
    self.titleLabel.font = [UIFont systemFontOfSize:15];
    //[self setBackgroundImage:[UIImage imageNamed:@"mainCellBackground"] forState:UIControlStateNormal];
}

- (instancetype)initWithFrame:(CGRect)frame
{
    if (self = [super initWithFrame:frame]) {
        [self setup];
    }
    return self;
}

- (void)awakeFromNib
{
    [super awakeFromNib];
    [self setup];
}

- (void)layoutSubviews
{
    [super layoutSubviews];
    
    // 调整图片
    self.imageView.y = self.height * 0.15;
    self.imageView.width = self.width * 0.65;
    self.imageView.height = 1.28 * self.imageView.width;
    self.imageView.centerX = self.width * 0.5;
    
    // 调整文字
    self.titleLabel.x = 0;
    self.titleLabel.y = CGRectGetMaxY(self.imageView.frame);
    self.titleLabel.width = self.width;
    self.titleLabel.height = self.height - self.titleLabel.y;
    self.titleLabel.numberOfLines = 2;
}

- (void)setHelpBtnModel:(WTFHelpModel *)helpBtnModel
{
    _helpBtnModel = helpBtnModel;
    
    [self setTitle:helpBtnModel.label forState:UIControlStateNormal];
    // 利用SDWebImage给按钮设置image
    [self setImage:[UIImage imageNamed:helpBtnModel.image] forState:UIControlStateNormal];
}

@end
