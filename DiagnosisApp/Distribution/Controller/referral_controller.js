//启用双击监听
mui.init({
	gestureConfig: {
		doubletap: true
	},
	subpages: [{
		url: 'referralList.html?status=' + getParameterNoPlus('status'),
		id: ReferralListId,
		styles: {
			top: '45px',
			bottom: '0px',
		}

	}]
});

// 返回按钮监听
mui.back = function() {
	console.log('referral_controller:back listener');
	if(navigator.userAgent.indexOf("Html5Plus") < 0) { //不支持5+ API
		jump('index.html?status=' + getParameterNoPlus('status'), IndexId, {

		});
	} else { //支持5+ API
		plus.webview.getWebviewById(indexSubContentId).evalJS("notifyDataChange()");
		plus.webview.close(ReferralId);
	}
};

var contentWebview = null;
jQuery('#div_head').on('tap', function() {
	if(mui.os.plus) {
		if(contentWebview == null) {
			contentWebview = plus.webview.currentWebview().children()[0];
		}
		contentWebview.evalJS("mui('#pullrefresh').pullRefresh().scrollTo(0,0,100)");
	}

});

function dialogShow() {
	if(navigator.userAgent.indexOf("Html5Plus") < 0) { //不支持5+ API
		window.frames[ReferralListId].close();
	} else { //支持5+ API
		if(contentWebview == null) {
			contentWebview = plus.webview.currentWebview().children()[0];
		}
		contentWebview.evalJS("dialogShow()");
	}
}

// 标题中的数据总数显示
function setTitle(title) {
	jQuery("#headertitle").text(title);
}
