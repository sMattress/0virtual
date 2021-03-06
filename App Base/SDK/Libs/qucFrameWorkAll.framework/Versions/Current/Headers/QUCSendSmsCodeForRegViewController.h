//
//  QUCSendSmsCodeViewController.h
//  qucsdkFramework
//
//  Created by xuruiqiao on 14-6-20.
//  Copyright (c) 2014年 Qihoo.360. All rights reserved.
//

#import "QUCBasicViewController.h"

@class QUCSendSmsCodeView;
@class QUCUserModel;

/**
 *	@brief	手机注册第二步：发送短信vc
 */
@interface QUCSendSmsCodeForRegViewController : QUCBasicViewController<UITextFieldDelegate>

@property (nonatomic, strong) QUCSendSmsCodeView *sendSmsCodeView;
/**
 *  @brief  用户是否可以点击注册按钮，默认业务方不需要关心，而有些业务当成功回调后，需要处理其他逻辑。例如：弹出弹层提示用户，然后可以让用户重新注册，需要用到此属性
 */
@property (nonatomic, assign) BOOL isCanRegister;
/**
 *	@brief	注册失败时回调
 *
 *	@param 	errCode 	int 错误码
 *	@param 	errMsg      NSString 错误消息
 */
-(void) qucRegFailedWithErrno:(int)errCode ErrorMsg:(NSString *)errMsg;

/**
 *	@brief	注册成功时回调
 *
 *	@param 	user 	QUCUserModel 含qid及QT及服务器端返回所有信息
 */
-(void) qucRegSuccessedWithQuser:(QUCUserModel *)user
;
@end
