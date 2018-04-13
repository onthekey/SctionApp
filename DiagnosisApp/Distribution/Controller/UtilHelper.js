function getParameterNoPlus(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
	var r = window.location.search.substr(1).match(reg);
	if(r != null)
		return unescape(r[2]);
	return "";
}

function openWebView(url, id, extras) {
	if (mui.os.ipad){
		if (url.indexOf('?') > -1)
			url += '&ipad=1';
		else 
			url += '?ipad=1';
	}
	
	var left = '0px';
	var width = '100%';
	if (getParameterNoPlus('ipad') == 1){
		left = '255px';
		width = jQuery(window).width();
	}
	
	console.log('UtilHelper: 跳转界面:' + url);
		
		
	mui.openWindow({
		url: url,
		id: id,
		styles: {
			left: left,
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
		}
	});
}

/**********************************************************************/
/**
 * 解析模块
 * 解析存放在界面中的数据
 * 
 * getUser(...)能够获取存储在本地的用户信息
 * 
 * 通过一下的解析模块getParamter(...), setParamter(...)可以获取需要的查询参数
 * 这些方法都需要在查询前被调用以及时更新各类参数, 可以检测在每一个查询调用入口前是否完成类对参数的
 * 更新操作
 */

// 获取存储的用户
function getUser() {

	// 初始化一个user对象用于获取需要的值
	var userString = localStorage.getItem('userInfo');
	var user = userString ? window.eval('(' + userString + ')') : '';

	return user;
}

/**********************************************************************/
/**
 * statusKey 状态:
 * 1: 待分诊
 * 4: 已分诊
 * -2: 退回
 * 22: 多专家
 * -77: 讨论
 * 
 * 2: 待分诊预约
 * 5: 已预约
 * 101: 已退回预约
 * 
 */

var statusKey = 'Status';
var siteKey = 'Site';
var typeKey = 'Type';
var detailsKey = 'Details';
var currentCountKey = 'CurrentCount';

var statisticsExpertNameKey = 'StatisticsExpertName';
var statisticsYearKey = 'StatisticsYear';

var hospitalKey = 'Hospital';
var hospitalIdKey = 'HospitalId';
var startTimeKey = 'StartTime';
var endTimeKey = 'EndTime';
var diagnosisStartTimeKey = 'DiagnosisStartTime';
var diagnosisEndTimeKey = 'DiagnosisEndTime';


var consultIdStatusIdKey = 'ConsultIdStatusId';
var caseTypeIdKey = 'CaseTypeId';
var searchKey = 'Search';
var startDateKey = 'StartDate';
var endDateKey = 'EndDate';
var startKey = 'Start';
var endKey = 'End';

// 获取需要的查询参数
function getParameter(key) {

	if($('#hidden' + key).val() != null && $('#hidden' + key).val() != '') {
		console.log(key + "缓冲区中存在数据");
		return $('#hidden' + key).val()
	} else {
		if(key != currentCountKey) {
			return '';
		} else {
			return 0;
		}
	}
}

// 设置下一次查询需要的参数
function setParameter(key, value) {

	$('#hidden' + key).val(value);
	if(key != currentCountKey && key != detailsKey && key != typeKey)
		clearCurrentCount();
}

// 清除当前页面的所有数据统计
function clearCurrentCount() {
	$('#hiddenCurrentCount').val(0);
}