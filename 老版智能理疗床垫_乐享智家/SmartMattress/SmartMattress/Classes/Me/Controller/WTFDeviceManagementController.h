//
//  WTFDeviceManagementController.h
//  SmartMattress
//
//  Created by William Cai on 2016/11/22.
//  Copyright © 2016年 lesmarthome. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface WTFDeviceManagementController : UIViewController

// 从服务器上获取的已绑定的设备 如果没有设备为空
@property (strong, nonatomic) NSMutableArray *deviceArray;

@end
