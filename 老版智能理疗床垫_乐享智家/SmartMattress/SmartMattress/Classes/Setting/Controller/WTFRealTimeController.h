//
//  WTFRealTimeController.h
//  SmartMattress
//
//  Created by William Cai on 2016/11/22.
//  Copyright © 2016年 lesmarthome. All rights reserved.
//

#import <UIKit/UIKit.h>

#import "RHSocketConnection.h"

@interface WTFRealTimeController : UIViewController <RHSocketConnectionDelegate>
{
    NSString *_serverHost;
    int _serverPort;
    RHSocketConnection *_connection;
}

@end
