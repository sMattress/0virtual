#import <SystemConfiguration/CaptiveNetwork.h>
#import "LiteSimpleConfig.h"

static SimpleConfig *simpleConfig = nil;

static NSString *AP_password = nil;
static NSTimer *timer = nil;
static NSTimer *dscTimer = nil;
static volatile unsigned int timerCount = 0;

@implementation LiteSimpleConfig

+ (void) init:(id)appDelegete {
    NSError *err = nil;
    simpleConfig.pattern.udpSocket = [[AsyncUdpSocket alloc]initWithDelegate:appDelegete];
    [simpleConfig.pattern.udpSocket bindToPort:MCAST_PORT_NUM error:&err];
    [simpleConfig.pattern.udpSocket enableBroadcast:YES error:&err];
    simpleConfig = [[SimpleConfig alloc] initWithPattern:PATTERN_TWO flag:(PATTERN_USING_UDP_SOCKET | PATTERN_VALID ) name:@"sc_mcast_udp"];
}

+ (void) deInit {
    [simpleConfig.pattern.udpSocket close];
}

+ (BOOL) isEnableWiFi {
    return ([[Reachability reachabilityForLocalWiFi] currentReachabilityStatus] != NotReachable);
}

+ (NSString *) getWiFiSSID {
    if (![self isEnableWiFi]) {
        NSLog(@"<APP> Wifi unavialble!");
        return @"";
    }

    NSDictionary *ifs = [simpleConfig.pattern fetchSSIDInfo];
    return [ifs objectForKey:@"SSID"] == nil ? @"" : [ifs objectForKey:@"SSID"];
}

+ (void) setWiFiPassword:(NSString*) password {
    AP_password = password;
}


+ (void)startConfigure:(void (^)(NSMutableArray *))success failure:(void (^)(LiteSimpleConfigErrCode))failure timeout:(int)timeout {
    
    if (![self isEnableWiFi]) {
        NSLog(@"<APP> Wifi unavialble!");
        if (failure != nil) {
            failure(WIFI_UNAVAILABLE);
        }
        return;
    }
    
    if(AP_password == nil)
    {
        NSLog(@"<APP> Config error!");
        if (failure != nil) {
            failure(CONFIG_ERR);
        }
        return;
    }
    
    timerCount = 0;
    timer = [NSTimer scheduledTimerWithTimeInterval:1 target:self selector:@selector(handleTimer:) userInfo:@{@"timeout": @(timeout), @"success": success, @"failure": failure} repeats:YES];
    
    // 配置discover
    [simpleConfig rtk_sc_stop];
    [simpleConfig rtk_sc_exit];
    [simpleConfig.pattern.dev_connected_list removeAllObjects];
    [simpleConfig rtk_sc_clear_device_list];
    
    NSString *str_bcastip = [self getIP_bcast];
    NSArray *subip = [str_bcastip componentsSeparatedByString:@"."];
    int bcastip = ([subip[0] intValue]<<24) + ([subip[1] intValue]<<16) + ([subip[2] intValue]<<8) + ([subip[3] intValue]);
    NSData *bcastdata = [simpleConfig rtk_sc_gen_discover_packet];
    
    dscTimer = [NSTimer scheduledTimerWithTimeInterval:0.5 target:self selector:@selector(sendDiscoveryCommand:) userInfo:@{@"bcastip": @(bcastip), @"bcastdata": bcastdata} repeats:YES];
    
    // 配置simple config
    [simpleConfig.pattern set_index:2];
    [simpleConfig rtk_sc_set_ssid:[self getWiFiSSID]];
    [simpleConfig rtk_sc_set_password: AP_password];
    
    [simpleConfig rtk_sc_gen_random];
    [simpleConfig rtk_sc_build_profile];
        
    [simpleConfig rtk_sc_set_profileSendInterval:200000]; //200ms
    [simpleConfig rtk_sc_set_packetSendInterval:10];      //10ms
    [simpleConfig rtk_sc_set_eachPacketCounts:1];
    
    

    
    
    [NSThread detachNewThreadSelector:@selector(handleConfigThread:) toTarget:self withObject:nil];
}


+ (void)cancelConfigure {
    [simpleConfig rtk_sc_stop];
    [simpleConfig rtk_sc_exit];
    if(timer){
        [timer invalidate];
        timer = nil;
    }
    if (dscTimer) {
        [dscTimer invalidate];
        dscTimer = nil;
    }
}

+ (void)handleConfigThread: (NSTimer *)sender {
    NSLog(@"<APP> send config packet");
    [simpleConfig rtk_sc_start];
    NSLog(@"<APP> send config packet over");
}

+ (void)handleTimer: (NSTimer *)sender {
    NSMutableDictionary* userInfo = [sender userInfo];
    int timeout = [(NSNumber*)[userInfo objectForKey:@"timeout"] intValue];
    void (^success)(NSMutableArray*) = [userInfo objectForKey:@"success"];
    void (^failure)(LiteSimpleConfigErrCode) = [userInfo objectForKey:@"failure"];
    
    if (timerCount++ >= timeout) {
        [self cancelConfigure];
        if (failure != nil) {
            failure(TIMEOUT);
        }
        return;
    }
    
    if ([simpleConfig rtk_sc_get_cfgACK_state] && timerCount%3==0) { //check cfg ACK state
        if (timerCount>30)
        {
            //NSLog(@"<APP> Config phase two");
            [simpleConfig rtk_sc_set_profileSendInterval:500000]; //500ms
            [simpleConfig rtk_sc_set_packetSendInterval:5000];    //5ms
            [simpleConfig rtk_sc_set_eachPacketCounts:1];
        }
    }
    
    
    NSLog(@"<APP> wait %d for config ack!\n", timerCount);
    NSMutableArray* devicesList = [simpleConfig rtk_get_connected_sta_mac];
    
    if (devicesList.count > 0) {
        [self cancelConfigure];
        if (success != nil) {
            success(devicesList);
        }
    }
}

+ (NSString *)getIP_bcast
{
    NSString *address = @"error";
    struct ifaddrs *interfaces = NULL;
    struct ifaddrs *temp_addr = NULL;
    int success = 0;
    // retrieve the current interfaces - returns 0 on success
    success = getifaddrs(&interfaces);
    if (success == 0) {
        // Loop through linked list of interfaces
        temp_addr = interfaces;
        while(temp_addr != NULL) {
            if(temp_addr->ifa_addr->sa_family == AF_INET) {
                // Check if interface is en0 which is the wifi connection on the iPhone
                if([[NSString stringWithUTF8String:temp_addr->ifa_name] isEqualToString:@"en0"]) {
                    // Get NSString from C String
                    address = [NSString stringWithUTF8String:inet_ntoa(((struct sockaddr_in *)temp_addr->ifa_dstaddr)->sin_addr)];
                }
            }
            temp_addr = temp_addr->ifa_next;
        }
    }
    freeifaddrs(interfaces);
    return address;
}


+ (void)sendDiscoveryCommand:(NSTimer*) sender
{
    NSMutableDictionary *userInfo = [sender userInfo];
    [simpleConfig rtk_sc_send_discover_packet:[userInfo objectForKey:@"bcastdata"] ip:[(NSNumber*)[userInfo objectForKey:@"bcastip"] intValue]];
    int i = (int)[simpleConfig.pattern.dev_connected_list count];
    if (i > 0) {
        NSLog(@"%d", i);
        [self cancelConfigure];
    }
}
@end
