//
//  WTFHelpContentController.m
//  SmartMattress
//
//  Created by William Cai on 2017/1/5.
//  Copyright © 2017年 lesmarthome. All rights reserved.
//

#import "WTFHelpContentController.h"

#import <WebKit/WebKit.h>
#import <SVProgressHUD/SVProgressHUD.h>

@interface WTFHelpContentController () <WKNavigationDelegate>

@property (strong, nonatomic) WKWebView *contentWebView;

@end

@implementation WTFHelpContentController

@synthesize helpURL;

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view from its nib.

    _contentWebView = [[WKWebView alloc] init];
    _contentWebView.frame = CGRectMake(0, 0, ScreenWidth, ScreenHeight);
    [self.view addSubview:_contentWebView];
    
    self.contentWebView.navigationDelegate = self;
    
}

- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:YES];
    [_contentWebView loadRequest:[NSURLRequest requestWithURL:[NSURL URLWithString:helpURL]]];
}

- (void)viewWillDisappear:(BOOL)animated {
    [super viewWillDisappear:YES];
    [SVProgressHUD dismiss];
}

// 页面开始加载时调用
- (void)webView:(WKWebView *)webView didStartProvisionalNavigation:(WKNavigation *)navigation{
    [SVProgressHUD show];
}

// 当内容开始返回时调用
- (void)webView:(WKWebView *)webView didCommitNavigation:(WKNavigation *)navigation{
}

// 页面加载完成之后调用
- (void)webView:(WKWebView *)webView didFinishNavigation:(WKNavigation *)navigation{
    [SVProgressHUD dismiss];
}

// 页面加载失败时调用
- (void)webView:(WKWebView *)webView didFailProvisionalNavigation:(WKNavigation *)navigation {
    [SVProgressHUD dismiss];
    [SVProgressHUD showErrorWithStatus:@"加载失败"];
}

@end
