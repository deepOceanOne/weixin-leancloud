/**
 * Created by Pmit_Mac on 2016/2/26.
 */
var tool = require('./tool');
var AV = require('leanengine');

var APP_ID = process.env.LC_APP_ID ; // 你的 app id
var APP_KEY = process.env.LC_APP_KEY ; // 你的 app key
var MASTER_KEY = process.env.LC_APP_MASTER_KEY ; // 你的 master key

AV.initialize(APP_ID, APP_KEY, MASTER_KEY);
var WechatAPI = require('wechat-api');
var appID = process.env.LC_WEICHAT_APPID,
    secret = process.env.LC_WEICHAT_APPSECRET;
var api = new WechatAPI(appID, secret);
var sha1 = require('sha1');

var pub = {};
var TOKEN = 'thisisonesimpletoken';




pub.jssdk = function (req, res) {
    api.getTicket(function (err, result) {
        res.send({
            hello: result
        });
    });
};


pub.menu = function (req, res) {
    // 验证服务器地址的有效性
    var result = checkSignature({
        signature: req.param('signature'),
        timestamp: req.param('timestamp'),
        nonce: req.param('nonce'),
        TOKEN: TOKEN
    });

    result = true;

    if (result) {
        res.send(req.param('echostr'));
    } else {
        res.send('error');
    }
    // 验证服务器地址的有效性


    // 获取服务器菜单数据
    var query = new AV.Query('WeixinInfo');
    query.equalTo('key', 'menu');
    query.find().then(function(results) {
        var result = results[0] || {};
        var menu = JSON.parse(result.get('value'));
        api.createMenu(menu);
    }, null);
};


function checkSignature (options) {
    var signature = options.signature,
        timestamp = options.timestamp,
        nonce = options.nonce,
        TOKEN = options.TOKEN;

    var tmpArr = [TOKEN, timestamp, nonce].sort();
    var tmpStr = sha1(tmpArr.join(''));

    if (tmpStr === signature) {
        return true;
    } else {
        return false;
    }
}
pub.test = function (req, res) {
    res.render('yz', {
        sessionToken: 'dfsdsdfsd',
        url: 'http://baidu.com    '
    });
};
pub.userinfo = function (req, res) {
    var accessToken = req.param('access_token'),
        openID = req.param('openid');
    AV.Cloud.httpRequest({
        url: 'https://api.weixin.qq.com/sns/userinfo',
        params: {
            access_token: accessToken,
            openid: openID,
            lang: 'zh_CN'
        },
        success: function(httpResponse) {
            var result = JSON.parse(httpResponse.data);
            if (result.ERRCODE === 40001) {
                // 超时

            }
            res.send(result);
        },
        error: function(httpResponse) {
        }
    });
};
pub.zc = function (req, res) {

};
pub.yz = function (req, res) {
    var code = req.param('code'),
        state = req.param('state');
    AV.Cloud.httpRequest({
        url: 'https://api.weixin.qq.com/sns/oauth2/access_token',
        params: {
            appid: appID,
            secret: secret,
            code: code,
            grant_type: 'authorization_code'
        },
        success: function(httpResponse) {
            var result = JSON.parse(httpResponse.data);
            if (typeof errcode !== 'undefined') {
                // 获取token出错
                res.send({result: 'fail'});
            } else {
                // 成功获取token
                // 查询这个用户是否存在
                // 不存在:创建
                // 存在:更新token和刷新token
                AV.Cloud.httpRequest({
                    method: 'POST',
                    url: 'https://api.leancloud.cn/1.1/users',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-LC-Id': APP_ID,
                        'X-LC-Key': APP_KEY
                    },
                    body: {
                        "authData": {
                            "weixin": result
                        }
                    },
                    success: function(httpResponse) {
                        var result = httpResponse.data,
                            status = httpResponse.status;
                        var url = 'https://open.weixin.qq.com/connect/oauth2/authorize' +
                                '?appid='+appID+'&redirect_uri=http://dev.weixin-wei.leanapp.cn/api/weixin/yz&response_type=code&scope=snsapi_userinfo' +
                                '&state=' + state;
                        AV.User.become(result.sessionToken);
                        if (status === 200) {
                            // 已注册
                            if (result.authData['weixin']['scope'] === 'snsapi_userinfo') {
                                AV.Cloud.httpRequest({
                                    url: 'https://api.weixin.qq.com/sns/userinfo',
                                    params: {
                                        access_token: result.authData['weixin']['access_token'],
                                        openid: result.authData['weixin']['openid'],
                                        lang: 'zh_CN'
                                    },
                                    success: function(httpResponse) {
                                        var result = JSON.parse(httpResponse.data);
                                        if (result.ERRCODE === 40001) {
                                            // 超时

                                        } else {
                                            var user = AV.User.current();
                                            user.set({
                                                'nickname': result['nickname'],
                                                'sex': result['sex'],
                                                'province': result['province'],
                                                'city': result['city'],
                                                'headimgurl': result['headimgurl'],
                                                'privilege': result['privilege'],
                                                'unionid': result['unionid']
                                            });
                                            user.save();
                                            res.render('yz', {
                                                sessionToken: result.sessionToken,
                                                url: '/zc.html'
                                            });
                                        }
                                    },
                                    error: function(httpResponse) {
                                    }
                                });
                            } else {
                                if (result.mobilePhoneVerified === false) {
                                    // 没有手机验证,去注册页面
                                    res.render('yz', {
                                        sessionToken: result.sessionToken,
                                        url: '/zc.html'
                                    });
                                } else {
                                    res.render('yz', {
                                        sessionToken: result.sessionToken,
                                        url: state
                                    });
                                }
                            }
                        } else {
                            // 未注册,跳转到注册页面
                            res.render('yz', {
                                sessionToken: result.sessionToken,
                                url: url
                            });
                        }
                    },
                    error: function(httpResponse) {
                        console.error('Request failed with response code ' + httpResponse.status);
                        res.send({result: 'fail', body: httpResponse});
                    }
                });
            }
        },
        error: function(httpResponse) {
        }
    });

};

module.exports = pub;
