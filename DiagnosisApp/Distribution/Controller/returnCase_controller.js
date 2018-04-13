mui.init({
	swipeBack: true //启用右滑关闭功能
});
var deceleration = mui.os.ios ? 0.003 : 0.0009;
mui('#scroll1').scroll({
	bounce: false,
	indicators: true, //是否显示滚动条
	deceleration: deceleration
});
mui.ready(function() {
	GetReturnInfo();
	GetHistoryReturnInfo();
});

/***********************************************************************************
 * 
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 */

/**
 * 获取原因列表, 提供选择 
 *
 */
function GetReturnInfo() {
	var returnTemplate = '<div class="mui-input-row mui-radio mui-left">' +
		'<label>returnReasonTemp</label>' +
		'<input name="returnRadio" type="radio" value="reasonIdTemp" data-expert-id="reasonIdTemp">' +
		'</div>';

	console.log('加载选择条件');
	jQuery.ajax(resturl + 'getReturnReasonList', {
		dataType: 'json',
		type: 'get',
		timeout: 10000,
		cache: false,
		success: function(response) {

			console.log('returnCase: returnReasonList:' + response);
			var content = '';
			response = JSON.parse(response);
			if(response.length > 0) {
				for(var i = 0; i < response.length; i++) {
					content += returnTemplate
						.replace(/returnReasonTemp/, response[i].Reason)
						.replace(/reasonIdTemp/, response[i].ID)
				}
				jQuery('#Returnlist').html(content);
			}
		}
	});

}

/**
 * 获取当前数据的退回历史 
 *
 */
function GetHistoryReturnInfo() {
	var returnHistoryTemplate = '<li class="mui-table-view-cell">' +
		'<div class="mui-table">' +
		'<div class="mui-table-cell mui-col-xs-10">' +
		'	<b class="mui-ellipsis">reasonTemp</b>' +
		'<h5>时间：reasonDateTemp</h5>' +
		'<p class="mui-h6 mui-ellipsis">理由：expainTemp</p>' +
		'</div>' +
		'</div>' +
		'</li>';

	$.ajax({
		url: resturl + 'getReturnHistory',
		data: {
			consultId: getParameterNoPlus('consultId')
		},
		dataType: 'JSON',
		type: 'GET',
		timeout: 10000,
		cache: false,
		success: function(response) {
			
			console.log('returnCase: hisyoty:' + response);
			response = JSON.parse(response);
			if(response.length != 0) { // 判定是否存在历史, 存在则显示

				var content = '';
				for(var i = 0; i < response.length; i++) {
					content += returnHistoryTemplate
						.replace(/reasonTemp/, response[i].Reason)
						.replace(/reasonDateTemp/, response[i].ReturnTime)
						.replace(/expainTemp/, response[i].Expain)
				}
				$('#returnHistoryList').html(content);

			} else {

				$('#returnHistoryList').html('<div align=\"center\"><p>无历史记录</p></div>');
			}
		},
		error: function(jqXHR, textStatus) {
			console.log('在加载历史原因时发生连接错误, 错误代码: ' + textStatus);
		}
	});
}

/**
 * 为confirmReturn绑定监听动作, 提交退回请求 
 *
 */

var retrunElement = document.getElementById("btn_return");
retrunElement.addEventListener('tap', function() {
	var returnReason = $('input:radio[name="returnRadio"]:checked').val(); // 获取退回理由
	if(returnReason == '' || returnReason == undefined) {
		mui.toast("请选择退回原因");
	} else {
		mui.confirm('确定退回当前病例吗?', '提示', '["否", "是"]', function(event) {
			if(event.index == 0) {
				var id = $('input:radio[name="returnRadio"]:checked').val();
				var explanation = $('#returnExplanation').val();

				plus.nativeUI.showWaiting('病例退回中');

				var user = getUser();
				$.ajax({
					type: 'POST',
					url: resturl + 'returnCase',
					async: true,
					data: JSON.stringify({
						consultId: getParameterNoPlus('consultId'),
						userid: user.userid,
						reason: id,
						expain: explanation
					}),
					cache: false,
					timeout: 10000,
					success: function(response) {
						console.log("退回成功");
						plus.nativeUI.closeWaiting();

						// 界面交互操作
						closeThis(getParameterNoPlus('consultId'));
					},
					error: function(jqXHR, textStatus) {
						console.log('在退回数据时发生错误, 错误状态: ' + textStatus);
						// 原生UI添加
						plus.nativeUI.closeWaiting();
					}
				});
			}
		});
	}
});