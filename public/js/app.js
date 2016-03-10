/**
 * Created by duguangwei on 16/3/5.
 */
(function (window, $) {
    var $loadingLabel = $('#loadingToast');
    window.App = {
        weixinLoginUrl: 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxfe3526282e13a2bb&redirect_uri=http://dev.weixin-wei.leanapp.cn/api/weixin/yz&response_type=code&scope=snsapi_base&state=RETURN_URL#wechat_redirect',
        checkLogin: function (callback) {
            var self = this;
            var session = localStorage.getItem('sessionToken');
            if (session === null) {
                console.log('no session');
                location.href = this.weixinLoginUrl.replace('RETURN_URL', location.href);
            } else {
                AV.User.become(session).then(function (user) {
                    // The current user is changed.
                    callback(user);
                }, function (error) {
                    // Login failed.
                    location.href = self.weixinLoginUrl.replace('RETURN_URL', location.href);
                });
            }
        },
        showLoading: function () {
            $loadingLabel.show();
        },
        hideLoading: function () {
            $loadingLabel.hide();
        },
        formValiate: function (name) {
            var $input = $('input[name='+name+']'),
                $parent = $input.parents('.weui_cell');
            return {
                show: function () {
                    $parent.addClass('weui_cell_warn');
                    return $input;
                },
                hide: function () {
                    $parent.removeClass('weui_cell_warn');
                    return $input;
                }
            }
        }
    }
})(window, Zepto);