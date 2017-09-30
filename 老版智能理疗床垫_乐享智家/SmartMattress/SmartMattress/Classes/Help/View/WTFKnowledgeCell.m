//
//  WTFKnowledgeCell.m
//  SmartMattress
//
//  Created by William Cai on 2017/1/7.
//  Copyright © 2017年 lesmarthome. All rights reserved.
//

#import "WTFKnowledgeCell.h"

#import "WTFKnowledgeModel.h"

@interface WTFKnowledgeCell ()

@property (weak, nonatomic) IBOutlet UIImageView *image;
@property (weak, nonatomic) IBOutlet UILabel *titleLabel;
@property (weak, nonatomic) IBOutlet UILabel *contentLabel;

@end

@implementation WTFKnowledgeCell

- (void)awakeFromNib {
    [super awakeFromNib];
    // Initialization code
}

- (void)setSelected:(BOOL)selected animated:(BOOL)animated {
    [super setSelected:selected animated:animated];

    // Configure the view for the selected state
}

- (void)setKnowledgeModel:(WTFKnowledgeModel *)knowledgeModel {
    _knowledgeModel = knowledgeModel;
    
    self.image.image = [UIImage imageNamed:knowledgeModel.image];
    self.titleLabel.text = [NSString stringWithFormat:@"%@", knowledgeModel.title];
    self.contentLabel.text = [NSString stringWithFormat:@"%@", knowledgeModel.content];
    
}

@end
