// mui初始化操作
mui.init({
	// 刷新操作注册
	pullRefresh: {
		container: '#pullrefresh',
		down: {
			callback: pulldownRefresh // 注册下拉操作的动作
		},
		up: {
			contentrefresh: '正在加载中...', // 刷新过程提示
			callback: pullupRefresh, // 注册上滑操作动作
			contentnomore: '没有更多的内容' // 当获取到最后的数据后的提示
		}
	}
})

// 初始化一些需要依靠plus的组件, 只有在完成plus的加载后才可以开始操作
// 界面初始化时显示模块, 加载数据, 能够获取的站点
if(mui.os.plus) {

	mui.plusReady(function() {
		console.log("当前页面URL：" + plus.webview.currentWebview().getURL() + "1");

		setActionBar(); // 设置Toolbar
		getSiteList(); // 获取站点列表 
		setTimeout(function() { // 触发加载刷新操作
			mui('#pullrefresh').pullRefresh().pulldownLoading();
		}, 1000);
	});
} else {

	mui.ready(function() {
		console.log("当前页面URL：" + plus.webview.currentWebview().getURL() + "2");

		setActionBar(); // 设置Toolbar
		getSiteList(); // 获取站点列表 
		mui('#pullrefresh').pullRefresh().pulldownLoading(); // 触发加载刷新操作
	});
}

// 激活滚动操作
if(!mui.os.android) {
	// 当在android运行激活scroll时无法滚动
	mui('#pullrefresh').scroll({});
}

mui('#hosList').scroll({});

// 初始化完成
/**
 * 完成基本的框架搭建与调用, 提供响应的接口供调用
 * 
 * 包括MUI的init(...)与Plus的初始化
 * 
 * 
 *
 *
 *
 */
/*********************************************************************/
/*********************************************************************/

/*********************************************************************/
/**
 * 刷新操作
 * 界面数据的刷新操作入口, 所有的数据显示都需要经过这个入口
 * 
 * 主要动作有 下拉刷新 pulldownRefresh(...), 上滑刷新 pullupRefresh(...)
 * 刷新停止操作 stopRefreshAnimation(...)
 * 
 *
 *
 */

// 下拉与 上滑判定标志位
// true: 下拉
// false: 上滑
var isPullDown = true;

// 下拉刷新动作, 可以将需要改变数据, 适配器加入到function中
function pulldownRefresh() {
	stopRefreshAnimation(); // 在下一个动画前停止上一个刷新动画, 不改变isPullDown
	isPullDown = true;

	clearCurrentCount(); // 重置数据总和计数
	activePullRefresh(); // 重新激活上滑刷新操作

	console.log("下拉刷新");
	getDataList();
}

// 上滑刷新动作, 可以将需要改变数据, 适配器加入到function中
function pullupRefresh() {
	stopRefreshAnimation(); // 在下一个动画前停止上一个刷新动画, 不改变isPullDown
	isPullDown = false;

	console.log("上滑刷新");
	getDataList();
}

// 停止刷新动画
// isCompleted: 是否完全加载标志位
function stopRefreshAnimation(isCompleted) {
	console.log('TriageList:是否完成加载所有数据:' + isCompleted);
	// 通过isPullDown判定当前执行的是哪一个刷新动画, 进行停止操作
	if(isPullDown) {
		mui('#pullrefresh').pullRefresh().endPulldownToRefresh();
		// 防止在初次加载中获取所有数据导致上滑刷新错误, 禁用上滑,
		// 在下载下拉刷新中判定是否完全加载数据, 如果不是解除禁止
		/*if(isCompleted)
			mui('#pullrefresh').pullRefresh().disablePullupToRefresh();
		else
			mui('#pullrefresh').pullRefresh().enablePullupToRefresh();*/
	} else {
		// 加载完新数据后，执行一下代码, 当isCompleted == true时表示没有更多数据了
		mui('#pullrefresh').pullRefresh().endPullupToRefresh(isCompleted);
	}
}

// 重新开启上滑动刷新功能, 当条件改变时触发方法
// 在条件点击事件中将触发激活方法, 是list重新具有上滑刷新动作
function activePullRefresh() {
	mui('#pullrefresh').pullRefresh().refresh(true);
}

/*********************************************************************/
/**
 * 界面显示
 * 各类操作的UI反馈入口, 提供与用户的信息交互与操作
 * setActionBar(...)将标明当前进入的状态
 * search(...)与clearCondition(...)是静态绑定在界面的方法, 不需要被JS调
 * 用也不需要被调用
 *
 *
 *
 */

// 显示Toolbar
function setActionBar() {

	var flag = getParameterNoPlus('status');
	console.log('TriageList status:' + flag);
	switch(flag) {
		case NOT_TRIAGE: // 待分诊
			setTitle(NOT_TRIAGE_TITLE);
			setParameter(statusKey, 1);
			break;
		case TRIAGE: // 已分诊
			setTitle(TRIAGE_TITLE);
			setParameter(statusKey, 4);
			break;
		case BACK_TRIAGE: // 退回
			setTitle(BACK_TRIAGE_TITLE);
			setParameter(statusKey, -2);
			break;
		case MULTI_EXPERT: // 多专家
			setTitle(MULTI_EXPERT_TITLE);
			setParameter(statusKey, 22);
			break;
		case RECYCLE: // 讨论
			setTitle(RECYCLE_TITLE);
			setParameter(statusKey, -77);
			break;
		default:
			setParameter(statusKey, '');
			break;
	}
}

// 显示title, 通过调用该方法能够实时刷新Toolbar上的Title
function setTitle(title) {

	// 判定运行在哪一种设备, 在ipad上不存在子webView, 直接显示在当前界面的title
	if(!mui.os.ipad) {
		console.log('在非iPad端显示');
		plus.webview.getWebviewById(TriageId).evalJS('setTitle("' + title + '")');
	} else {
		$('#headertitle').text(title);
	}
}

// 显示(关闭)筛选Dialog
function dialogShow() {

	// 尝试从缓冲池中获取缓冲数据, 显示到Dialog
	if(getParameter(detailsKey) != null && getParameter(detailsKey) != '')
		$('#triageDetails').val(getParameter(detailsKey));
	if(getParameter(typeKey) != null && getParameter(typeKey) != '') {
		switch(getParameter(typeKey)) {
			case '1':
				$('#typeItem').html('常规');
				break;
			case '2':
				$('#typeItem').html('细胞');
				break;
			case '3':
				$('#typeItem').html('冰冻');
				break;
			default:
				$('#typeItem').html('全部类型');
				break;
		}
	}

	mui("#selectDialog").popover('toggle');
}

// 初始化部分操作, 动作绑定, 主要绑定静态按钮与链接
$(function() {
	// site popupWindow
	// 站点弹出控制
	$('#applySites').on('tap', function() {

		mui("#sitePopupwindow").popover('toggle');
	});

	// status popupWindow
	// 状态弹出控制
	$('#statusList').on('tap', function() {

		mui("#statusPopupWindow").popover('toggle');
	});

	// 为状态item添加点击事件
	$('#statusPopupWindow').find('a').on('tap', function() {

		// 获取被点击获取的状态
		//console.log($(this).html());
		var status = $(this).parents('.mui-table-view-cell')[0].getAttribute('data-id');
		// 修改param进行搜索
		setParameter(statusKey, status);
		mui('#statusPopupWindow').popover('toggle'); // 关闭popupWindow
		// 修改status修改后的显示, 将选中的状态显示
		if($(this).html() != '全部状态')
			$('#statusList').html($(this).html());
		else {
			setParameter(statusKey, '-21422-77');
			$('#statusList').html('状态');
		}

		activePullRefresh(); // 重新激活上滑刷新操作

		// 刷新查询, 刷新整个列表
		pulldownRefresh();
	});

	//注册PopupMenu用于弹出Type选项
	// 创建一个picker对象并赋值参数显示
	// 当picker选择后不会立刻进行查询
	var picker = new mui.PopPicker();
	picker.setData([{
		value: '',
		text: '全部类型'
	}, {
		value: '1',
		text: '常规'
	}, {
		value: '2',
		text: '细胞'
	}, {
		value: '3',
		text: '冰冻'
	}]);
	// 注册弹出PopupMenu的事件, 点击弹出picker
	$('#typeItem').on('tap', function() {

		picker.show(function(SelectedItem) {
			console.log('Selected Type:' + SelectedItem[0].text);
			var type = SelectedItem[0].value;
			// 修改param进行搜索
			setParameter(typeKey, type);
			// 修改status修改后的显示, 将选中的状态显示
			if(SelectedItem[0].text == '全部类型')
				$('#typeItem').html('全部类型');
			else
				$('#typeItem').html(SelectedItem[0].text);

			// 当picker选择后不会立刻进行查询
			// 刷新查询, 刷新整个列表
			//pulldownRefresh();
		})
	});
});

// 静态方法, 在Dialog中搜索数据
function search() {

	// 将details添加到缓冲池中
	var details = $('#triageDetails').val();
	setParameter(detailsKey, details);

	// 清除当前页面的数据总量统计
	clearCurrentCount();
	activePullRefresh(); // 重新激活上滑刷新操作

	// 刷新列表
	pulldownRefresh();

	// 关闭搜索框显示搜索
	mui("#selectDialog").popover('hide');
}

// 静态方法, 清空Dialog中的数据, 清空操作不会自动管Dialog
function clearCondition() {

	// 将details与 type缓冲区中的数据清空置为''
	setParameter(detailsKey, '');
	setParameter(typeKey, '');
	// 还原Dialog中的显示
	$('#triageDetails').val('');
	$('#typeItem').html('选择类型');

	// 清除当前页面的数据总量统计
	clearCurrentCount();
	activePullRefresh(); // 重新激活上滑刷新操作

	getSiteList();
}

/**********************************************************************/
/**
 * 数据加载
 * 以下模块主要用于数据的加载
 * 当数据被加载后如果需要绑定事件也将在下列方法中实现
 * getSiteList(...), getDataList(...)实现列表的加载
 * setSiteItemClickListener(...)将getSiteList(...)中加载的树
 * 据绑定事件
 *
 *
 */

//获取站点， 站点主要用于筛选操作, 通过筛选输出数据
function getSiteList() {
	// 列表替换模板, 用以显示需要被列出的列表
	var template = '<li class="mui-table-view-cell lisiteid" data-id="HisID">' +
		'<a href="#">siteName</a>' +
		'</li>';

	var user = getUser();
	var userId = user.userid; // 获取userId

	$.ajax({
		url: resturl + 'getSiteList',
		data: {
			userId: userId // 用户, 用户能够查询到的数据
		},
		dataType: 'JSON',
		type: 'GET',
		timeout: 10000,
		cache: false,
		success: function(response) {

			console.log("完成查询, 获取站点列表" + response);

			var list = JSON.parse(response);
			// 通过replace替换元素创建需要的列表
			var div = template.replace(/HisID/, '').replace(/siteName/, '申请单位');
			if(list.length > 0) { // 如果获取的数据总量大于0解析数据
				for(var i = 0; i < list.length; i++)
					div += template.replace(/HisID/, list[i].HisID).replace(/siteName/, list[i].HisName);
			}
			$('#sitelist').empty(); // 清空旧数据
			$('#sitelist').html(div);

			// 绑定站点点击绑定事件
			setSiteItemClickListener();
		},
		error: function(jqXHR, textStatus) {
			console.log("获取站点列表时发生连接错误: " + textStatus);
			mui('#pullrefresh').pullRefresh().endPulldownToRefresh();
		}

	});
}

// 站点的点击事件绑定, 注意不要重复绑定造成重复的点击事件, 在更新站点列表时将旧的列表
// 删除以防止多余的事件触发
function setSiteItemClickListener() {

	console.log('站点点击事件绑定');

	// 点击刷新列表事件绑定
	$('#hosList').find('a').on('tap', function() {
		// 获取被点击获取的站点
		//console.log($(this).html());
		var site = $(this).parents('.mui-table-view-cell')[0].getAttribute('data-id');
		// 修改param进行搜索
		setParameter(siteKey, site);
		mui('#sitePopupwindow').popover('toggle'); // 关闭popupWindow
		// 修改status修改后的显示, 将选中的站点显示
		if($(this).html() == '申请单位')
			$('#applySites').html('申请单位');
		else
			$('#applySites').html($(this).html());

		activePullRefresh(); // 重新激活上滑刷新操作

		// 刷新查询, 刷新整个列表
		pulldownRefresh();
	});
}

// 获取数据列表
function getDataList() {

	var template = '<li id="consultIdTemplate" class="item mui-table-view-cell mui-media">' +
		'<a href="javascript:;" data-id="ConsultID-template" ' +
		' data-status="ConsultStatusID-template" data-DiagHisIp="diagHisIpTemp" data-DiagHisPort="diagHisPortTemp">' +
		'<div class="mui-media-object mui-pull-left">' +
		'<div class="mui-badge mui-badge-typeColor-template" ' +
		' style="padding-top:6px;padding-bottom:6px;position: relative; left: 0px; margin-right: 5px ; font-size: 30px; float:left; " >type-template</div>' +
		'</div>' +
		'<div class="mui-media-body" style="margin-top: 4px;">' +
		'<p class="mui-ellipsis" style=\"text-indent:0px;\">details-template</p>' +
		'<p class="mui-ellipsis" style=\"text-indent:0px;\">取材部位：Drawn-template</p>' +
		'<p class="mui-ellipsis" style=\"text-indent:0px\">来自location-template</p>' +
		'</div>' +
		'</a>' +
		'<div class ="mui-badge"' +
		' style ="position:absolute; top:8px; right:0px; color:#B3B3B3; background-color: transparent;" >date-template</div>' +
		'<div class="div_status">status-template</div>' +
		'</li>';

	var user = getUser();
	var userId = user.userid; // 获取userId
	var centerGroup = user.centerGroup;

	// 解析存放在界面中的数据, 获取筛选列表, 获取的数据可能为空值
	var status = getParameter(statusKey); // 状态筛选
	var site = getParameter(siteKey); // 站点选择
	var type = getParameter(typeKey); // 类型
	var details = getParameter(detailsKey) // 详情（用于模糊查询）

	// 获取查询时需要查询的位置
	var currentCount = parseInt(getParameter(currentCountKey)); // 获取当前显示的数据的量
	console.log("当前显示数据总量:" + currentCount);
	var start = currentCount + 1; // 查询位置偏移
	var end = currentCount + 20; // 查询位置结尾

	console.log('Search condition[userId:' + userId + ', status:' + status +
		', type:' + type + ', site:' + site + ', details:' + details +
		', start:' + start + ', end:' + end + ']');
	$.ajax({
		url: resturl + 'getTriageList/' + userId,
		data: {
			site: site, // 站点
			status: status, // 状态
			type: type, // 类型
			details: details, // 详情（用于模糊查询）
			start: start,
			end: end,
			centerGroup: centerGroup
		},
		dataType: 'JSON',
		type: 'GET',
		timeout: 10000,
		async: true,
		cache: true,
		success: function(response) {
			console.log("完成查询, 获取列表信息" + response);
			var response = JSON.parse(response);
			
			// 更新Toolbar Title显示, 显示Count
			switch(getParameter(statusKey)) {
				case '1':
					setTitle(NOT_TRIAGE_TITLE + '(' + response.dataCount + ')');
					break;
				case '4':
					setTitle(TRIAGE_TITLE + '(' + response.dataCount + ')');
					break;
				case '-2':
					setTitle(BACK_TRIAGE_TITLE + '(' + response.dataCount + ')');
					break;
				case '22':
					setTitle(MULTI_EXPERT_TITLE + '(' + response.dataCount + ')');
					break;
				case '-77':
					setTitle(RECYCLE_TITLE + '(' + response.dataCount + ')');
					break;
				default:
					setTitle(TRIAGE_NOSTATUS_TITLE + '(' + response.dataCount + ')');
					break;

			}

			console.log("刷新当前总量:" + response.currentCount);
			if (getParameter(currentCountKey) == response.currentCount){
				stopRefreshAnimation(response.currentCount == response.dataCount);
				if (response.currentCount == 0)
					$('#container').empty();
				return;
			}
				
			setParameter(currentCountKey, response.currentCount); // 将当前所有显示的数据总和放入缓冲区中
			console.log(currentCountKey + "缓冲区数据:" + getParameter(currentCountKey));
			
			// 判定当前状态下是否存在数据, 如果不存在数据则显示提示信息
			if(parseInt(response.dataCount) == 0) {
				console.log('不存在数据加载:' + parseInt(response.dataCount));
			} else {
				console.log('渲染内容');
				var dataList = response.Rows;
				var contentContainer = '';

				for(var i = 0; i < dataList.length; i++) {
					var typeColor;
					var type;
					var status;
					switch(dataList[i].CaseTypeID) {
						case '1':
							typeColor = 'primary';
							type = '常';
							break;
						case '2':
							typeColor = 'success';
							type = '细';
							break;
						case '3':
							typeColor = 'warning';
							type = '冰';
							break;
						default:
							typeColor = 'primary';
							type = '常';
							break;
					}

					var status = decorStatus(dataList[i].Status, dataList[i].IsManyExp);

					contentContainer += template
						.replace(/consultIdTemplate/, 'consultId' + dataList[i].YConsultID)
						.replace(/ConsultID-template/, dataList[i].YConsultID)
						.replace(/ConsultStatusID-template/, dataList[i].Status)
						.replace(/details-template/, dataList[i].CaseNo + '-' +
							dataList[i].Name + '-' + dataList[i].Sex + '-' + dataList[i].Age)
						.replace(/Drawn-template/, dataList[i].MaterialParts)
						.replace(/location-template/, dataList[i].SendHos)
						.replace(/date-template/,
							dataList[i].ConsultTime == null ? '' : dataList[i].ConsultTime.replace('T', ' '))
						.replace(/typeColor-template/, typeColor)
						.replace(/type-template/, type)
						.replace(/diagHisIpTemp/, dataList[i].HisIp)
						.replace(/diagHisPortTemp/, dataList[i].HisPort)
						.replace(/status-template/, status);
				}
				console.log('渲染内容:' + contentContainer);

				// $('#container').append(contentContainer);
			}
			if(parseInt(response.currentCount) <= 20 && response.Rows.length != 0 || response.dataCount == 0)
				$('#container').empty();
			$('#container').append(contentContainer);

			setItemClickListener();

			// 终止刷新动画, 通过判定currentCount 与 dataCount来判定是否加载完成所有的数据
			stopRefreshAnimation(response.currentCount == response.dataCount);
		},
		error: function(jqXHR, textStatus) {
			console.log("获取列表信息时发生连接错误:" + textStatus);

			// 终止刷新动画, 将完成所有数据加载标志位置为false
			stopRefreshAnimation(false);
		}
	});
}

function decorStatus(status, IsManyExp) {
	switch(status) {
		case 1:
			return '待诊断';
		case -1:
		case -2:
			return '退回'
		case -77:
			return '回收';
		case 101:
			return '已退回';
		default:
			if(IsManyExp == 1)
				return '多专家';
			else
				return '已诊断';
	}
}

// 站点的点击事件绑定, 注意不要重复绑定造成重复的点击事件, 在更新站点列表时将旧的列表
// 删除以防止多余的事件触发
function setItemClickListener() {
	$('#container a').off('tap'); // 首先解绑所有绑定动作
	// 统一绑定动作
	$('#container a').on('tap', function() {
		var consultId = $(this)[0].getAttribute('data-id');
		var status = $(this)[0].getAttribute('data-status');
		var flag = getParameterNoPlus('status');
		console.log('TriageList:diagnosisDetails.html?consultId=' + consultId + '&status=' + flag +
			"&DiagHisIp=" + $(this)[0].getAttribute('data-DiagHisIp') +
			"&DiagHisPort=" + $(this)[0].getAttribute('data-DiagHisPort'),
			DiagnosisDetailsId);
		openWebView('diagnosisDetails.html?consultId=' + consultId + '&status=' + flag +
			"&DiagHisIp=" + $(this)[0].getAttribute('data-DiagHisIp') +
			"&DiagHisPort=" + $(this)[0].getAttribute('data-DiagHisPort'),
			DiagnosisDetailsId);
	})
}