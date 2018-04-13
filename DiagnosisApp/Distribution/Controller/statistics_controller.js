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
	getConsultationStatisticsList();
	getStatisticsForSite();

	getSiteList();
});

scroll();

function scroll() {
	mui('.mui-scroll-wrapper').scroll({});
}

var data;

/**********************************************************************/
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

var picker;
(function($) {
	$.init();
	var btns = $('.time_select');
	
	btns.each(function(i, btn) {

		btn.addEventListener('tap', function() {
			if(picker != undefined)
				picker.dispose();
			picker = new mui.DtPicker({
				type: 'date'
			});

			var viewId = '#' + this.getAttribute('id');

			console.log('statistics: Picker show');
			picker.show(function(selectItems) {
				console.log('Statistics: 时间 ' + selectItems.value);

				console.log('Statistics: 时间组件id:' + viewId);
				jQuery(viewId).text(selectItems.value);

				picker.dispose();
			});
		}, false);
	});
	
	if(mui.os.ipad) {
		jQuery('#back').remove();
	}
})(mui);

function showSitePop() {
	//var picker = new mui.PopPicker();
	if(picker != undefined)
		picker.dispose();
	picker = new mui.PopPicker();		

	console.log('Statistics:popPicker data:' + data);
	picker.setData(data);
	picker.show(function(selectItems) {

		console.log('Statistics: 站点 ' + selectItems[0].value + ':' + selectItems[0].text);

		console.log('Statistics: 站点id:' + selectItems[0].value);
		jQuery('#hospital_name').text(selectItems[0].text);
		jQuery('#tempId').val(selectItems[0].value);

		picker.dispose();
	})
}

function dialogShow() {

	console.log('statistics: 进入search')
	if($('#consultationStatistics').hasClass('mui-active')) {
		console.log('statistics: 搜索专家');
		mui("#selectExpertDialog").popover('toggle');
	} else if($('#siteStatistics').hasClass('mui-active'))
		mui("#selectSiteDialog").popover('toggle');
}

function searchForExpert() {

	// 将details添加到缓冲池中
	var expertName = $('#expertName').val();
	setParameter(statisticsExpertNameKey, expertName);

	var year = $('#year').val();
	setParameter(statisticsYearKey, year);

	console.log('statistics: 当前条件: expertName: ' + getParameter(statisticsExpertNameKey) +
		',year: ' + getParameter(statisticsYearKey));

	getConsultationStatisticsList();

	// 关闭搜索框显示搜索
	mui("#selectExpertDialog").popover('hide');
}

function clearConditionForExpert() {

	// 将details与 type缓冲区中的数据清空置为''
	setParameter(statisticsExpertNameKey, '');
	setParameter(statisticsYearKey, '');
	// 还原Dialog中的显示
	$('#expertName').val('');
	$('#year').val('');

	getConsultationStatisticsList();
}

function searchForSite() {

	var hospitalId = $('#tempId').val();
	setParameter(hospitalIdKey, hospitalId == null ? '' : hospitalId);
	setParameter(hospitalKey, $('#hospital_name').text());

	var startTime = $('#button_startTime').text();
	setParameter(startTimeKey, startTime == '请选择开始时间' ? '' : startTime);
	console.log('Statistics.searchForSite: 开始时间 ' + startTime);

	var endTime = $('#button_endTime').text();
	setParameter(endTimeKey, endTime == '请选择结束时间' ? '' : endTime);
	console.log('Statistics.searchForSite: 结束时间 ' + endTime);

	var diagnosisStartTime = $('#button_diagnosisStartTime').text();
	setParameter(diagnosisStartTimeKey, diagnosisStartTime == '请选择开始时间' ? '' : diagnosisStartTime);
	console.log('Statistics.searchForSite: 开始诊断时间 ' + diagnosisStartTime);

	var diagnosisEndTime = $('#button_diagnosisEndTime').text();
	setParameter(diagnosisEndTimeKey, diagnosisEndTime == '请选择结束时间' ? '' : diagnosisEndTime);
	console.log('Statistics.searchForSite: 结束诊断时间 ' + diagnosisEndTime);

	getStatisticsForSite();

	mui("#consultationStatisticsProgressbar").progressbar().show();

	mui("#selectSiteDialog").popover('hide');
}

function clearConditionForSite() {

	// 清空缓冲
	setParameter(hospitalKey, '');
	setParameter(hospitalIdKey, '');
	setParameter(startTimeKey, '');
	setParameter(endTimeKey, '');
	setParameter(diagnosisStartTimeKey, '');
	setParameter(diagnosisEndTimeKey, '');

	// 修改UI显示
	$('#hospital_name').text('全部医院');
	$('#tempId').val('');
	$('#button_startTime').text('请选择开始时间');
	$('#button_endTime').text('请选择结束时间');
	$('#button_diagnosisStartTime').text('请选择开始时间');
	$('#button_diagnosisEndTime').text('请选择结束时间');

	mui("#consultationStatisticsProgressbar").progressbar().show();

	getStatisticsForSite();
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

function getConsultationStatisticsList() {

	var expertName = getParameter(statisticsExpertNameKey);
	var year = getParameter(statisticsYearKey);

	var center = getUser().centerGroup;
	if(center.indexOf(',') == (center.length - 1))
		center = center.replace(',', '');

	mui("#consultationStatisticsProgressbar").progressbar().show();
	$.ajax({
		type: 'GET',
		url: resturl + 'getConsultationStatisticsList',
		async: true,
		data: {
			expertName: expertName,
			year: year,
			userId: getUser().userid,
			centerGroup: center
		},
		dataType: 'JSON',
		success: function(response) {
			console.log('获取会诊统计完成:' + response);

			response = JSON.parse(response);
			adapterConsultationStatisticsList(response);

			mui("#consultationStatisticsProgressbar").progressbar().hide();
		},
		error: function(jqXHR, textStatus) {
			console.log('在获取会诊统计是时发生错误, 错误状态:' + textStatus);

			mui("#consultationStatisticsProgressbar").progressbar().hide();
		}
	});
}

function getStatisticsForSite() {

	console.log('Statistics: 站点查询param[站点: ' + getParameter(hospitalIdKey) + ', 开始时间:' +
		getParameter(startTimeKey) + ', 结束时间: ' + getParameter(endTimeKey) +
		', 开始诊断时间: ' + getParameter(diagnosisStartTimeKey) +
		', 结束诊断时间: ' + getParameter(diagnosisEndTimeKey) + ']');

	$.ajax({
		type: 'GET',
		url: resturl + 'getStatisticsForSite',
		async: true,
		data: {
			hospitalId: getParameter(hospitalIdKey),
			startDtae: getParameter(startTimeKey),
			endDate: getParameter(endTimeKey),
			diagnosisStartDate: getParameter(diagnosisStartTimeKey),
			diagnosisEndDate: getParameter(diagnosisEndTimeKey)
		},
		dataType: 'JSON',
		success: function(response) {
			console.log('获取站点统计完成:' + response);

			response = JSON.parse(response);
			adapterStatisticsForSite(response);

			mui("#consultationStatisticsProgressbar").progressbar().hide();
		},
		error: function(jqXHR, textStatus) {
			console.log('在获取站点统计是时发生错误, 错误状态:' + textStatus);

			mui("#consultationStatisticsProgressbar").progressbar().hide();
		}
	});

}

var data;

function getSiteList() {
	$.ajax({
		type: 'GET',
		url: resturl + 'getStatisticsSiteList',
		async: true,
		dataType: 'JSON',
		success: function(response) {
			console.log('获取站点完成:' + response);

			response = JSON.parse(response);
			data = setPopPickerData(response);
		},
		error: function(jqXHR, textStatus) {
			console.log('在获取站点是时发生错误, 错误状态:' + textStatus);
		}
	});
}

/**********************************************************************/
/**
 * 数据渲染
 * 
 * 
 * 
 * 
 * 
 *
 *
 */

function adapterConsultationStatisticsList(adapter) {
	/*var template = '<li class="mui-table-view-cell mui-collapse mui-active">' +*/
	var template = '<li class="mui-table-view-cell mui-active" style="background-color: white">' +
		'				<a class="mui-navigate-right" href="#">' +
		'					displayNameTemplate 总数:countTemplate</a>' +
		'				<div class="mui-collapse-content">' +
		'					<ul class="mui-table-view">' +
		'                 	subTemplate' +
		'					</ul>' +
		'				</div>' +
		'			</li>';

	var subListItem = '<li class="mui-table-view-cell">' +
		'		monthTeamplate月' +
		'		<span class="mui-badge mui-badge-primary">statisticsTemaplate</span>' +
		'</li>';

	var content = '';

	for(var i = 0; i < adapter.length; i++) {
		
		if (adapter[i].ExpName == null)
			continue;

		var subListContent = '';
		var count = 0;

		adapterSubItem(adapter[i].January, 1);
		adapterSubItem(adapter[i].February, 2);
		adapterSubItem(adapter[i].March, 3);
		adapterSubItem(adapter[i].April, 4);
		adapterSubItem(adapter[i].May, 5);
		adapterSubItem(adapter[i].June, 6);
		adapterSubItem(adapter[i].July, 7);
		adapterSubItem(adapter[i].August, 8);
		adapterSubItem(adapter[i].September, 9);
		adapterSubItem(adapter[i].October, 10);
		adapterSubItem(adapter[i].November, 11);
		adapterSubItem(adapter[i].December, 12);

		content += template.replace(/displayNameTemplate/, adapter[i].ExpName)
			.replace(/countTemplate/, count)
			.replace(/subTemplate/, subListContent);
	}

	$('#consultationStatisticsList').html(content);

	function adapterSubItem(subItemMonthCount, month) {
		if(subItemMonthCount != 0) {
			subListContent += subListItem.replace(/monthTeamplate/, month)
				.replace(/statisticsTemaplate/, subItemMonthCount);
			count = count + subItemMonthCount;
		}
	}
}

function adapterStatisticsForSite(adapter) {

	var template =
		'<li class="mui-table-view-cell">' +
		'<p style="margin-bottom:2px"><i class="mui-icon mui-icon-home"></i>hospitalTemplate</p>' +
		'<p style="position: absolute;  right: 14px; top: 14px;">共countTemplate例</p>' +
		'<div style="border-bottom:2px solid #efeff4 ; margin-bottom: 4px;"></div>' +
		'<table style="width: 100%;">' +
		'<tr>' +
		'<td>' +
		'<p style="text-align: center; color: #51c4d4; line-height: 20px;" >notDiagnosisCountTemplate例</p>' +
		'<p style="text-align: center; color: #51c4d4; line-height: 20px;font-size: 12px">待诊断</p>' +
		'</td>' +
		'<td>' +
		'<p style="text-align: center; color: #51c4d4; line-height: 20px;" >diagnosisCountTemplate例</p>' +
		'<p style="text-align: center; color: #51c4d4; line-height: 20px;font-size: 12px">已诊断</p>' +
		'</td>' +
		'<td>' +
		'<p style="text-align: center; color: #51c4d4; line-height: 20px;" >returnDiagnosisCountTemplate例</p>' +
		'<p style="text-align: center; color: #51c4d4; line-height: 20px;font-size: 12px;">退回</p>' +
		'</td>' +
		'</tr>' +
		'</table>' +
		'</li>';

	var content = '';

	if(adapter.length > 0) {
		var notDiagnosisCount = 0;
		var diagnosisCount = 0;
		var returnDiagnosisCount = 0;
		var sumMoney = 0;

		for(var i = 0; i < adapter.length; i++) {
			// 判断是否有诊断时间条件，如果存在，筛选去除所有不存在已诊断数据的item
			if(isJustDiagnosis()) {
				// 在存在已诊断数据的情况下显示并统计，否则不显示
				if(parseInt(adapter[i].diagnosisCount) != 0) {
					var total = parseInt(adapter[i].notDiagnosisCount) +
						parseInt(adapter[i].diagnosisCount) + parseInt(adapter[i].returnDiagnosisCount);
					content += template.replace(/hospitalTemplate/, adapter[i].hospital)
						.replace(/notDiagnosisCountTemplate/, adapter[i].notDiagnosisCount)
						.replace(/diagnosisCountTemplate/, adapter[i].diagnosisCount)
						.replace(/returnDiagnosisCountTemplate/, adapter[i].returnDiagnosisCount)
						.replace(/countTemplate/, total)
					notDiagnosisCount += parseInt(adapter[i].notDiagnosisCount);
					diagnosisCount += parseInt(adapter[i].diagnosisCount);
					returnDiagnosisCount += parseInt(adapter[i].returnDiagnosisCount);
					sumMoney = sumMoney + parseInt(adapter[i].sumMoney == null ? 0 : adapter[i].sumMoney);
				}
			} else {
				var total = parseInt(adapter[i].notDiagnosisCount) +
					parseInt(adapter[i].diagnosisCount) + parseInt(adapter[i].returnDiagnosisCount);
				content += template.replace(/hospitalTemplate/, adapter[i].hospital)
					.replace(/notDiagnosisCountTemplate/, adapter[i].notDiagnosisCount)
					.replace(/diagnosisCountTemplate/, adapter[i].diagnosisCount)
					.replace(/returnDiagnosisCountTemplate/, adapter[i].returnDiagnosisCount)
					.replace(/countTemplate/, total)
				notDiagnosisCount += parseInt(adapter[i].notDiagnosisCount);
				diagnosisCount += parseInt(adapter[i].diagnosisCount);
				returnDiagnosisCount += parseInt(adapter[i].returnDiagnosisCount);
				sumMoney = sumMoney + parseInt(adapter[i].sumMoney == null ? 0 : adapter[i].sumMoney);
			}

		}
		$("#notDiagnosisSum").html(notDiagnosisCount + "例");
		$("#diagnosisSum").html(diagnosisCount + "例");
		$("#returnDiagnosisSum").html(returnDiagnosisCount + "例");
		$("#span_count").html(notDiagnosisCount + diagnosisCount + returnDiagnosisCount);
		$("#span_sum_money").html(sumMoney == '' ? 0 : sumMoney);
		$('#siteDataLayout').html(content);
	} else {
		$("#notDiagnosisSum").html("0例");
		$("#diagnosisSum").html("0例");
		$("#returnDiagnosisSum").html("0例");
		$("#span_count").html(0);
		$("#span_sum_money").html(0);
		$('#siteDataLayout').html("<div align=\"center\"><p>暂无历史记录</p></div>");
	}
}

// 判定是否使用诊断时间条件
function isJustDiagnosis() {

	var startDiagnosisTime = getParameter(diagnosisStartTimeKey);
	var endDiagnosisTime = getParameter(diagnosisEndTimeKey);

	if((startDiagnosisTime != null && startDiagnosisTime != '') || (endDiagnosisTime != null && endDiagnosisTime != ''))
		return true;
	else
		return false;
}

/*function setPopPickerData(adapter) {
	data = '[{value:\'\',text:\'全部医院\'},';
	for(var i = 0; i < adapter.length; i++) {
		data += '{value:\'' + adapter[i].hospitalId + '\',text:\'' + adapter[i].hospital + '\'}';
		if(i != (adapter.length - 1))
			data += ',';
	}
	data += ']';
	
	return JSON.stringify(data);
}*/

function setPopPickerData(adapter) {
	var array = new Array();
	array.push({
		value: '',
		text: '全部医院'
	});
	for(var i = 0; i < adapter.length; i++) {
		array.push({
			value: adapter[i].hospitalId,
			text: adapter[i].hospital
		});
	}
	return array;
}