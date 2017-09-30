//
//  WTFPhysioController.h
//  SmartMattress
//
//  Created by William Cai on 2016/11/22.
//  Copyright © 2016年 lesmarthome. All rights reserved.
//

#import <UIKit/UIKit.h>

#import "TTRangeSlider.h"
#import "RHSocketConnection.h"

@interface WTFPhysioController : UIViewController <RHSocketConnectionDelegate, TTRangeSliderDelegate>
{
    NSString *_serverHost;
    int _serverPort;
    RHSocketConnection *_connection;
}

@end
