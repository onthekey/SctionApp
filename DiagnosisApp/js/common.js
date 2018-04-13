/*
	 公共js库
	 writer:Helen Joe
	 Date:2015/11/9
	 * */
var resturl=localStorage.server + "/moblie/api/";
//var resturl="http://112.15.174.50:88/api/";
var coreurl=localStorage.server + "/";
// 获取终端的相关信息
var Terminal = {
	// 辨别移动终端类型
	platform: function() {
		var u = navigator.userAgent,
			app = navigator.appVersion;
		return {
			// android终端或者uc浏览器
			android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1,
			// 是否为iPhone或者QQHD浏览器
			iPhone: u.indexOf('iPhone') > -1
		};
	}(),
};

//页面跳转 url：跳转的url，页面id号,extras自定义参数 json格式 可空
function jump(url, id, extras) {
	mui.openWindow({
		url: url,
		id: id,
		styles: {
			left:'0px',
			top: '0px', //新页面顶部位置
			bottom: '0px', //新页面底部位置
			width: '100%', //新页面宽度，默认为100%
			height: '100%', //新页面高度，默认为100%
		},
		extras: extras,
		createNew: false, //是否重复创建同样id的webview，默认为false:不重复创建，直接显示
		show: {
			autoShow: true, //页面loaded事件发生后自动显示，默认为true
			aniShow: 'animationType', //页面显示动画，默认为”slide-in-right“；
			duration: 100 //页面动画持续时间，Android平台默认100毫秒，iOS平台默认200毫秒；
		},
		waiting: {
			autoShow: true, //自动显示等待框，默认为true
			title: '数据加载中...', //等待对话框上显示的提示内容
			//			options: {
			//				width: '100%', //等待框背景区域宽度，默认根据内容自动计算合适宽度
			//				height: '100%', //等待框背景区域高度，默认根据内容自动计算合适高度
			//				round: "0px"
			//			}
		}
	});
};
function jump2(url, id, extras) {
	
	
	
	var width=jQuery(window).width();
	mui.openWindow({
		url: url,
		id: id,
		styles: {
			left:'255px',
			top: '0px', //新页面顶部位置
			bottom: '0px', //新页面底部位置
			width: width, //新页面宽度，默认为100%
			height: '100%', //新页面高度，默认为100%
		},
		extras: extras,
		createNew: false, //是否重复创建同样id的webview，默认为false:不重复创建，直接显示
		show: {
			autoShow: true, //页面loaded事件发生后自动显示，默认为true
			aniShow: 'animationType', //页面显示动画，默认为”slide-in-right“；
			duration: 100 //页面动画持续时间，Android平台默认100毫秒，iOS平台默认200毫秒；
		},
		waiting: {
			autoShow: true, //自动显示等待框，默认为true
			title: '数据加载中...', //等待对话框上显示的提示内容
			//			options: {
			//				width: '100%', //等待框背景区域宽度，默认根据内容自动计算合适宽度
			//				height: '100%', //等待框背景区域高度，默认根据内容自动计算合适高度
			//				round: "0px"
			//			}
		}
	});
};
//paramters: option is jquery dom,id is attribute as 'data-id'
function selectedOption(option, id) {
	if (option && option.length > 0) {
		for (var i = 0; i < option.length; i++) {
			if (jQuery(option[i]).attr('data-id') == id) {
				jQuery(option[i]).addClass('mui-active');
			} else {
				jQuery(option[i]).removeClass('mui-active');
			}
		}
	}
}
function getQueryString2(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null)
        return unescape(r[2]);
    return "";
}
//从页面中获取参数

function getQueryString(name) {
	var arr = plus.webview.currentWebview().getURL().split('?');
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
	var value = (arr && arr.length > 0 ? (arr.length == 1 ? arr[0] : arr[1]) : '');
	var r = value.match(reg);
	if (r != null) return unescape(r[2]);
	return null;
};
/*
 * 等待框
 * Write:yhd
 * Date:2015-11-12
 */
(function($) {
	Waiting = function(jquery_object, title) {
		var waiting_html = '<div class="mui-content mui-content-waiting"><h1 class="mui-btn mui-btn-link mui-btn-block gray"><span class="mui-spinner"></span>' + title + '</h1></div>';
		jquery_object.append(waiting_html);
	};
	Waiting.prototype = {
		show: function() {
			$(".mui-content-waiting").show();
		},
		close: function() {
			$(".mui-content-waiting").hide();
		},
		remove: function() {
			$(".mui-content-waiting").remove();
		}
	};
})(jQuery);

//处理金额
function GetShortDecimal(money) {
	var Money;
	var _money = money.toString();
	//金额不为空并且包含小数点
	if (money && _money.indexOf('.') > 0) {

		var arr = _money.split('.');
		if (arr[1].length <= 2) {
			Money = _money;
		} else {
			//获取小数点后两位
			var after_two = arr[1].substring(0, 2);
			var skip_some = arr[1].substring(2, 4);
			var _regex = /^0+$/;
			if (_regex.test(skip_some)) {
				Money = arr[0] + "." + after_two;
			} else {
				Money = arr[0] + "." + (parseInt(after_two) + 1).toString();
			}
		}
	} else {
		Money = money;
	}
	return Money;
};
(function($) {
	var w;
	/*
	 channel:支付通道
	 index:支付通道下标
	 payurl:请求预支付订单信息Url
	 aliPayUrl:请求支付宝订单信息方法名,
	 weixinUrl：请求微信预支付订单信息方法名,
	 ordernumber:订单编号,
	 user:用户信息,
	 resultfun:支付完成后执行的方法
	 */
	SxxxPay = function(channel,payurl, aliPayaction, weixinaction, ordernumber, user, resultfun) {
		if (w) {
			return;
		} //检查是否请求订单中
		var _action = null;
		if (channel.id == 'alipay') {
			_action = aliPayaction;

		} else if (channel.id == 'wxpay') {
			_action = weixinaction;
		} else {
			plus.nativeUI.alert("不支持此支付通道！", null, "重要提示");
			return;
		}
		w = plus.nativeUI.showWaiting("正在跳转到" + channel.description + "...");
		//获取支付信息
		mui.ajax(payurl, {
			data: {
				_action: _action,
				OrderNumber: OrderNumber,
				username: user.name,
				type: 2,
				token: user.token
			},
			dataType: "json",
			type: "post",
			timeout: 10000,
			success: function(back) {
				//订单支付信息请求成功
				if (back && back.Code == 0) {
					var _order;
					if (channel.id == 'alipay') {
						//订单支付信息
						_order = back.Data;
					} else if (channel.id == 'wxpay') {
						//订单支付信息
						_order = JSON.stringify(back.Data);
						//去掉收尾冒号与转移符
						_order = _order.substring(1, _order.length - 1).replace(/\\/gi, "");

					} else {}
					//请求支付
					plus.payment.request(channel, _order, function(result) {
						plus.nativeUI.closeWaiting();
						//支付成功执行方法
						resultfun();
					}, function(e) {
						mui.toast("支付失败");
						plus.nativeUI.closeWaiting();

					});
				}
				//订单支付信息请求失败
				else {
					mui.toast("获取充值信息失败，请重试");
					plus.nativeUI.closeWaiting();

				}
			},
			error: function(xhr, type, errorThrown) {
				//取消本次请求
				mui.alert("抱歉，出现错误", "重要提示", function() {
					mui.back();
				});
				plus.nativeUI.closeWaiting();
			}
		});
		w = null;
	};
}(jQuery));