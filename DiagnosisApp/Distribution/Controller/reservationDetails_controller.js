// mui 初始化
mui.init({
	swipeBack: false,
	gestureConfig: {
		tap: true, //默认为true
		doubletap: true, //默认为false
		longtap: true, //默认为false
		swipe: true, //默认为true
		drag: true, //默认为true
		hold: true, //默认为false，不监听
		release: true //默认为false，不监听
	}
});

//初始化, 获取基本信息
mui.ready(function() {

	var consultId = getParameterNoPlus('consultId'); // 获取需要查看的数据id
	console.log('ReservationDetails: 获取对应id[' + consultId + ']需要的数据');
	adapterView(consultId); //获取基本信息

	setExpertListLayout();

});

$(function() {

	setOnAnimationFinish(function(isShowExpertList) {
		console.log('ReservationDetails: 列表显示动画完成');
		if(isShowExpertList)
			$('#reservation_details_title').html('专家列表');
		else
			$('#reservation_details_title').html('预约信息');
	});
});

/*********************************************************************/
/**
 * 动作绑定
 * 
 * 
 * 
 * 
 *
 *
 *
 */

$(function() {
	// 注册关闭选择专家界面
	$('#cancelReservation').on('tap', function() {
		hideExpert();
	});

	// 完成预约动作
	$('#doReservation').on('tap', function() {
		if(!$('input[name="expert"]:checked').val()) {
			mui.toast('请选择专家');
			return;
		}
		
		

		console.log('ReservationDetails: 完成预约操作中...');
		var expertId = $('input[name="expert"]:checked')[0].getAttribute('data-expert-id');
		console.log('需要预约的数据的id:' + getParameterNoPlus('consultId') + '专家:' + expertId);
		plus.nativeUI.showWaiting('预约中...');
		$.ajax({
			type: 'get',
			url: resturl + 'reservationExpertForCase',
			data: {
				consultId: getParameterNoPlus('consultId'),
				expertId: expertId
			},
			dataType: 'TEXT',
			async: true,
			timeout: 10000,
			success: function(response) {
				console.log('ReservationDetails: 完成预约, response:' + response);
				plus.nativeUI.closeWaiting();
				
				setResult(RESERVATION_COMPLETED, getParameterNoPlus('consultId'));
				plus.webview.currentWebview().close();
			},
			error: function(jqXHR, textStatus) {
				console.log('完成预约时发生错误, 错误:' + textStatus);
				plus.nativeUI.closeWaiting();
			}
		});
	});
});

function returnReservation(consultId) {

	mui.confirm('确定退回该预约申请吗？', '提示', '["否", "是"]', function(event) {

		if(event.index == 0) {
			var reason = $('#textarea_reason').val();

			if(reason == '' || reason == null || reason == undefined)
				mui.toast('请填写退回理由');
			else {
				var user = getUser();
				$.ajax({
					url: resturl + 'returnReservation',
					data: JSON.stringify({
						consultId: consultId,
						reason: reason,
						isDis: 1
					}),
					dataType: 'JSON',
					type: 'POST',
					cache: false,
					success: function(response) {
						console.log('ReservationDetails: 完成数据的提交更新, response:' + response);
						
						setResult(RESERVATION_RETURN, getParameterNoPlus('consultId'));
						plus.webview.currentWebview().close();
					},
					error: function(jqXHR, textStatus) {
						console.log('ReservationDetails: 提交撤回时发生连接错误:' + textStatus);
					}
				});
			}
		}
	});
}

function distributionReservation(consultId, hospitalId, centerId) {
	console.log('ReservationDetails: 准备分配');
	getExpertList(consultId, hospitalId, centerId);
}

/*********************************************************************/
/**
 * 界面显示
 * 
 * 
 * 
 * 
 *
 *
 *
 */

function renderView(adapter) {

	console.log('ReservationDetails: 渲染数据:' + adapter + ', 数据id:' + adapter[0].ConsultID);
	if(adapter.length > 0) {

		// 基本信息显示
		$('#span_info').html(adapter[0].YuName + " " + adapter[0].YuSex + " " + adapter[0].YuAge); // 基本显示	
		$('#span_his').html(adapter[0].HisName); // 送检单位		
		$('#span_reservation_date').html(adapter[0].BookTime); // 预约时间	
		$('#span_operation_part').html(adapter[0].OperationPart); // 手术部位	
		$('#span_yuDoctor').html(adapter[0].YuDoctor); // 临床医生
		$('#span_yuPhone').html(adapter[0].YuPhone); // 临床电话
		$('#span_remark').html(adapter[0].BookContent == '' ? '无' : adapter[0].BookContent);

		// 通过预约标志判定当前数据的状态
		// 状态显示

		/********************************************************/
		// adapter[0].ConsultStatusID = 99; // 测试动作用标志, 在完成后必须删除, 否则将影响逻辑
		// adapter[0].ConsultStatusID = 101; // 测试退回标志位
		// adapter[0].ConsultStatusID = 100; // 测试完成标志位
		/********************************************************/

		if(adapter[0].ConsultStatusID == 100) { // 预约完成状态

			$('#retrun_layout').css('display', 'none');
			$('#toolBar').css('display', 'none');
		} else if(adapter[0].ConsultStatusID == 101) { // 预约退回状态

			$('#textarea_reason').html(adapter[0].ReturnReason);
			$('#textarea_reason').css('readonly', 'readonly');
			$('#toolBar').css('display', 'none');
		} else if(adapter[0].ConsultStatusID == 99) { // 预约未完成状态

			// 退回 操作
			$('#returnReservation').on('tap', function() {
				returnReservation(adapter[0].ConsultID);
			});

			// 分配操作
			$('#distribution').on('tap', function() {
				distributionReservation(adapter[0].ConsultID,
					adapter[0].HisID, adapter[0].CenterID);
			});
		}

		$('#LoadingAnimation').css('display', 'none'); // 载入等待动画关闭
		$('#reservation_details').css('display', ''); // 显示数据	
	}
}

/**********************************************************************/
/**
 * 数据加载
 * 以下模块主要用于数据的加载
 * 当数据被加载后如果需要绑定事件也将在下列方法中实现
 * 
 * 
 * 
 *
 *
 */

function adapterView(consultId) {

	$.ajax({
		url: resturl + 'getReservationDetails',
		data: {
			consultId: consultId
		},
		dataType: 'JSON',
		type: 'GET',
		timeout: 100000,
		cache: false,
		success: function(response) {
			console.log('数据获取完成, 获取预约信息: ' + response);
			var response = JSON.parse(response);

			// 渲染数据
			renderView(response);
		},
		error: function(jqXHR, textStatus) {
			console.log('获取预约信息时发生连接错误: ' + textStatus);
		}
	});
}

// 分配操作
function getExpertList(consultId, hospitalId, centerId) {
	console.log('查询专家时需要的参数[consultId: ' + consultId + ', hospitalId: ' +
		hospitalId + ', centerId: ' + centerId + ']');
	$.ajax({
		type: 'GET',
		url: resturl + 'getCenterExpertList',
		async: true,
		data: {
			centerId: centerId,
			hospitalId: hospitalId
		},
		timeout: 10000,
		success: function(response) {

			console.log('获取专家列表成功, 返回结果: ' + response);

			setExpertListAdapter(JSON.parse(response));

			showExpertList();
		},
		error: function(jqXHR, textStatus) {
			console.log('获取专家列表时发生连接错误: ' + textStatus);
		}
	});
}

function setExpertListAdapter(adapter) {
	var expertItemTemplate = '<div class="mui-input-row mui-radio mui-left">' +
		'<label >expertNametemplate</label>' +
		'<input name="expert" type="radio" data-expert-id="expertIdTemplate">' +
		'</div>';

	if(adapter.length <= 0) {

	} else {
		var content = '';
		for(var i = 0; i < adapter.length; i++) {
			content += expertItemTemplate
				.replace(/expertIdTemplate/, adapter[i].UserID)
				.replace(/expertNametemplate/, adapter[i].DisplayName);

		}
		$('#expertListView').html(content);
	}
}