/**
 * Created by Pmit_Mac on 2016/2/26.
 */
var tool = require('./tool');
var AV = require('leanengine');
AV.initialize('t52Kgzz2xFPxNgVxcTEewNG6-gzGzoHsz', 'kAUCP6GDxbF0aW2moVy6H1Jt');
var WechatAPI = require('wechat-api');
var appID = 'wxfe3526282e13a2bb',
    secret = '9ec23e0d5dbf7692d1fde3fdb49b51a7';
var api = new WechatAPI(appID, secret);
var sha1 = require('sha1');

var pub = {};
var TOKEN = '5dtumJl0Avmv7Rk4hgY1irpSJTtDZYceykIuTgkoXWQPeN0Mzpf1RBEDmujXrrHrY1-Twc2Qrhr2HUuP4XEkRUuQSmjz_vdZua-ubJSdXAgUGYgABAIUM';




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

pub.yz = function (req, res) {
    var code = req.param('signature'),
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
            res.send(httpResponse.text);
            //
        },
        error: function(httpResponse) {
        }
    });

};

module.exports = pub;
