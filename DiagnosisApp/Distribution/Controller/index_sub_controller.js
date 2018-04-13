mui.init({
	pullRefresh: {
		container: '#pullrefresh',
		down: {
			callback: pulldownRefresh
		}

	}
});

var count = 0;

if(mui.os.plus) {
	mui.plusReady(function() {
		setTimeout(function() {
			mui('#pullrefresh').pullRefresh().pulldownLoading();

		}, 1000);

		exitListener();
	});
} else {
	mui.ready(function() {
		mui('#pullrefresh').pullRefresh().pulldownLoading();

		exitListener();
	});
}

$(function() {
	var user = getUser();
	var centerName = user.centerName == null ? '分配中心' : user.centerName;
	console.log('Index_sub: CenterName = ' + centerName);
	$('#center').text(centerName);
})

// 轮播模块控制
var slider = mui("#slider");
slider.slider({
	interval: 3000
});

// 初始化入口完成
/***********************************************************************************************/

/**
 * 下拉刷新具体业务实现
 */

function pulldownRefresh() {
	console.log("Index_sub: 直接调用pulldownRefresh(...)主界面列表刷新, 无刷新动画")
	setTimeout(function() {
		getDistributionCount();
	}, 1500);
}

// 获取统计总数
function getDistributionCount() {
	// 初始化一个user对象用于获取需要的值
	var userString = localStorage.getItem("userInfo");
	var user = userString ? window.eval("(" + userString + ")") : "";

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
			//ret = eval(ret);
			console.log('index_sub: ret = ' + ret);
			ret = JSON.parse(ret);

			if(ret.length > 0) {
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

			mui('#pullrefresh').pullRefresh().endPulldownToRefresh();
		}
	})
}

// 跳转到列表页面, 通过不同的id控制打开的页面
mui('#list').on('tap', '.indexclass', function() {
	var flag = this.getAttribute('data-id');
	switch(flag) {
		case 'notTriage': // 待分诊
		case 'triage': // 已分诊
		case 'backTriage': // 退回分诊	
		case 'multiExpert': // 分诊-多专家
		case 'recycle': // 讨论
			openWebView('Triage.html?status=' + flag, TriageId); // 分诊界面
			break;
		case 'reservation': // 预约
			openWebView('reservation.html?status=' + flag, ReservationId); // 预约界面
			break;
		case 'referral': // 转诊
			openWebView('referral.html?status=' + flag, ReferralId); // 转诊界面
			break;
		case 'statistics': // 统计
			openWebView('statistics.html?status=' + flag, StatisticsId);
			break;
		case 'setting':
			openWebView('../setting.html?status=' + flag, SettingId); // 设置界面
			break;
	}
});

$('#settingTab').on('tap', function() {
	console.log('Index_sub: 进入设置');

	openWebView('../setting.html?status=setting', SettingId); // 设置界面
});

//退出应用操作,无需返回login页面
function exitListener() {
	console.log('back Listener');
	var exitMark = false;
	mui.back = function() {
		if(!exitMark) {
			exitMark = true;
			mui.toast('再按一次退出应用');
			setTimeout(function() {
				exitMark = false;
			}, 2000);
		} else {
			plus.runtime.quit();
		}
	}
}

function notifyDataChange() {
	console.log('Index_sub: notifyDataChange');
	getDistributionCount();
}