var coreurl = localStorage.server + "/";

var centerName = localStorage.centerName;
var title = centerName ? centerName : 'KFBIO病理远程会诊平台';

document.getElementById("index-title").innerHTML = title;

mui.init({
	gestureConfig: {
		doubletap: true
	},
	subpages: [{
		url: 'TriageList.html?status=notTriage&ipad=1',
		id: indexContentId,
		styles: {
			top: '0px',
			bottom: '0px',
			left: '255px',
			width: jQuery(window).width() - 255
		}

	}]
});

mui.ready(function() {

	showUserDetails();
	getDistributionCount();
});

function showUserDetails() {
	var user = getUser();
	console.log('Index_ipad:' + user.name);
	$('#headPortrait').attr('src', coreurl + user.photo);
	$('#displayName').html('欢迎你,' + user.name);
}

$('.button_action ').on('tap', function() {

	$('.button_action ').each(function() {
		var isClass = $(this).hasClass('mui-btn-outlined');
		if(isClass == false) {
			$(this).addClass('mui-btn-outlined');
		}
		var requestURL = '';
	});
	$(this).removeClass('mui-btn-outlined');
	var flag = this.getAttribute('data-id');
	var ipadFlag = '&ipad=1';
	console.log('flag:' + flag);

	var webViewIdList = plus.webview.all();
	console.log('index_ipad:stack遍历入口 ' + webViewIdList);
	if(webViewIdList) {
		console.log('index_ipad:遍历stack ' + webViewIdList);
		// 整个循环与stack出栈操作相似, pop stack 直到 top = indexContentId
		for(var i = webViewIdList.length - 1; i >= 0; i--) {
			var webViewId = webViewIdList[i].id;
			if(webViewId != indexContentId) {
				plus.webview.getWebviewById(webViewId).close();
			} else {
				break;
			}
		}
	}

	switch(flag) {
		case 'notTriage': // 待分诊
		case 'triage': // 已分诊
		case 'backTriage': // 退回分诊	
		case 'multiExpert': // 分诊-多专家
		case 'recycle': // 讨论
			plus.webview.getWebviewById(indexContentId)
				.loadURL('TriageList.html?status=' + flag + ipadFlag);
			break;
		case 'reservation': // 预约
			plus.webview.getWebviewById(indexContentId)
				.loadURL('reservationList.html?status=' + flag + ipadFlag);
			break;
		case 'referral': // 转诊
			plus.webview.getWebviewById(indexContentId)
				.loadURL('referralList.html?status=' + flag + ipadFlag);
			break;
		case 'statistics': // 统计
			plus.webview.getWebviewById(indexContentId)
				.loadURL('statistics.html?status=' + flag + ipadFlag);
			break;
		case 'setting': // 设置界面
			plus.webview.getWebviewById(indexContentId)
				.loadURL('../setting.html?status=' + flag + ipadFlag);
			break;
	}

});

// 获取统计总数
function getDistributionCount() {

	// 初始化一个user对象用于获取需要的值
	var user = getUser();
	console.log('Index_ipad:查询入口1, userId:' + user.userid + '; centerGroup:' + user.centerGroup + resturl);

	$.ajax({
		url: resturl + 'getDistributionCount',
		data: {
			userId: user.userid,
			centerGroup: user.centerGroup
		},
		dataType: 'JSON',
		type: 'GET',
		timeout: 10000,
		success: function(ret) {

			console.log('Index_ipad:' + ret);
			//ret = eval(ret);
			ret = JSON.parse(ret);

			$('#notTriageCount').html(ret[0].notTriageCount); // 待分诊
			$('#triageCount').html(ret[0].triageCount); // 已分诊
			$('#backTriageCount').html(ret[0].backTriageCount); // 退回分诊		
			$("#multiExpertCount").html(ret[0].multiExpertCount); // 分诊-多专家
			$('#recycleCount').html(ret[0].recycleCount); // 讨论

			$('#reservationCount').html(ret[0].reservationCount); // 预约

			// 转诊
			var referralCount = parseInt(ret[0].referralWaitingCount) +
				parseInt(ret[0].referralBackCount) +
				parseInt(ret[0].referralDoneCount) +
				parseInt(ret[0].referralDiagnosisCount);
			$('#referralCount').html(referralCount);
		}
	})
}