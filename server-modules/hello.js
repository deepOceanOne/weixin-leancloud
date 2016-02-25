/**
 * 每位工程师都有保持代码优雅的义务
 * Each engineer has a duty to keep the code elegant
 *
 * @author wangxiao
 */

// 一些工具方法

'use strict';

const tool = require('./tool');
const WechatAPI = require('wechat-api');

const api = new WechatAPI('wxfe3526282e13a2bb', '9ec23e0d5dbf7692d1fde3fdb49b51a7');

let pub = {};

pub.hello = (req, res) => {
  tool.l('It works.');
  api.createTmpQRCode(10000, 1800, function (error, result) {
    res.send({
      hello: result
    });
  })
};

module.exports = pub;
