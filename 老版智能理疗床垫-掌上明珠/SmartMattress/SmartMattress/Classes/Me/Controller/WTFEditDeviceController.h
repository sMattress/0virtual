//
//  WTFEditDeviceController.h
//  SmartMattress
//
//  Created by William Cai on 2016/11/22.
//  Copyright © 2016年 lesmarthome. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "WTFDeviceInfoModel.h"

@class WTFDeviceModel, WTFEditDeviceController;

@interface WTFEditDeviceController : UIViewController

@property (nonatomic, strong) WTFDeviceInfoModel *deviceModel;

@end
