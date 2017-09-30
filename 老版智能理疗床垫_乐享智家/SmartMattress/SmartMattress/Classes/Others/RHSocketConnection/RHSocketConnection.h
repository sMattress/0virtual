//
//  RHSocketConnection.h
//  Socket_TCP
//
//  Created by William Cai on 2016/9/26.
//  Copyright © 2016年 William Cai. All rights reserved.
//

#import <Foundation/Foundation.h>

@protocol RHSocketConnectionDelegate <NSObject>

- (void)didDisconnectWithError:(NSError *)error;
- (void)didConnectToHost:(NSString *)host port:(UInt16)port;
- (void)didReceiveData:(NSData *)data tag:(long)tag;

@end

@interface RHSocketConnection : NSObject

@property (nonatomic, weak) id <RHSocketConnectionDelegate> delegate;


+ (instancetype)ShareRHSocketConnection;


- (void)connectWithHost:(NSString *)hostName port:(int)port;

- (void)disconnect;
- (BOOL)isConnected;

- (void)readDataWithTimeout:(NSTimeInterval)timeout tag:(long)tag;
- (void)writeData:(NSData *)data timeout:(NSTimeInterval)timeout tag:(long)tag;

@end
