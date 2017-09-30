//
//  WTFAddDeviceController.h
//  SmartMattress
//
//  Created by William Cai on 2016/11/22.
//  Copyright © 2016年 lesmarthome. All rights reserved.
//

#import <UIKit/UIKit.h>

@class WTFAddDeviceController, WTFDeviceModel;

@protocol WTFAddDeviceControllerDelegate <NSObject>

@optional
- (void)addDevice:(WTFAddDeviceController *)addVC didAddDevice:(WTFDeviceModel *)deviceModel;
@end

@interface WTFAddDeviceController : UIViewController

@property (weak, nonatomic) id<WTFAddDeviceControllerDelegate> delegate;

@end
