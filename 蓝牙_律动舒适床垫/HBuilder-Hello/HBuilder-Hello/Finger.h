//
//  Finger.h
//  HBuilder
//
//  Created by 李科 on 2017/10/19.
//  Copyright © 2017年 DCloud. All rights reserved.
//

#import	<UIKit/UIKit.h>
#import <PGPlugin.h>
#import <PGMethod.h>
@interface Finger : PGPlugin
-(void)can:(PGMethod*)command;
-(void)use:(PGMethod*)command;
@end
