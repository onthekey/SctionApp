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
	console.log('DiagnosisDetails:获取对应id[' + consultId + ']需要的数据');
	adapterView(consultId); //获取基本信息

	// 标题修改
	setTitle();

	setExpertListLayout();
});

//初始化滚动
scroll();

function scroll() {
	mui('.mui-scroll-wrapper').scroll({});
}

// 计算tabs下宽度
evaluateWidth();

function evaluateWidth() {
	if(mui.os.ipad) {
		jQuery('#sliderProgressBar').css('width', ((window.screen.height - 255) / 4));
		console.log('这是需要的Width' + jQuery('.mui-slider-progress-bar').css('width'));
	} else {
		console.log('非iPad客户端');
	}
}

var SiteStatus;

var viewerurl = coreurl + "/Viewer";

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

// 适配屏幕
$(function() {
	// 适应底部footer height
	$('#slider').css('margin-bottom', $('#bottomNavigationBar').css('height'));
});

// 注册方法
$(function() {

	// 留言动作
	$('#btn_send_message').on('tap', function() {
		var sentMessage = $('#textarea_message').val();
		if(sentMessage == null || sentMessage == '') {
			mui.toast('请在输入留言后再发送');
			return;
		}

		var userId = getUser().userid;

		plus.nativeUI.showWaiting('留言提交中...');
		$.ajax({
			type: 'POST',
			url: resturl + 'sendMessageFromDistribution',
			data: JSON.stringify({
				consultId: getParameterNoPlus('consultId'),
				userId: userId,
				message: sentMessage
			}),
			dataType: 'TEXT',
			async: true,
			timeout: 10000,
			success: function(response) {
				loadingMessage(getParameterNoPlus('consultId'), true);
				$('#textarea_message').val('');
				plus.nativeUI.closeWaiting();
			},
			error: function(jqXHR, textStatus) {
				console.log('在发送留言时发生错误, 错误: ' + textStatus);
				plus.nativeUI.closeWaiting();
			}
		});
	});

	// 隐藏专家列表
	$('#cancelDistribution').on('tap', function() {
		hideExpert();
	});

	// 分诊到专家
	$('#doDistribution').on('tap', function() {
		if(!$('input[name="expert"]:checked').val()) {
			mui.toast('请选择专家');
			return;
		}

		console.log('DiagnosisDetails:完成分配操作中...');
		var expertId = $('input[name="expert"]:checked')[0].getAttribute('data-expert-id');
		var consultId = getParameterNoPlus('consultId');

		if(HasExpID == '' && HasExpID == undefined && HasExpID == null)
			HasExpID = '';

		ConsultNo
		plus.nativeUI.showWaiting('预约中...');
		$.ajax({
			type: 'get',
			url: resturl + 'distributionExpertForCase',
			data: {
				consultId: consultId,
				expertId: expertId,
				HasExpID: HasExpID

			},
			dataType: 'TEXT',
			async: true,
			timeout: 10000,
			success: function(response) {
				console.log('DiagnosisDetails:完成分配, response:' + response);
				plus.nativeUI.closeWaiting();

				setResult(DISTRIBUTION_COMPLETED,
					getParameterNoPlus('consultId'), 4);
				plus.webview.currentWebview().close();
			},
			error: function(jqXHR, textStatus) {
				console.log('DiagnosisDetails:完成预约时发生错误, 错误: ' + textStatus);
				plus.nativeUI.closeWaiting();
			}
		});
	});
});

function setActionListener(adapter) {

}

// 多专家诊断
function multiExpert() {
	mui.confirm('确定此病例进行多专家会诊吗？', '提示', '["否", "是"]', function(event) {

		if(event.index == 0) {

			$.ajax({
				url: resturl + 'multiExpert',
				data: JSON.stringify({
					consultId: getParameterNoPlus('consultId'),
				}),
				dataType: 'JSON',
				type: 'POST',
				cache: false,
				success: function(response) {
					console.log('DiagnosisDetails:多专家请求完成, response:' + response);

					if(parseInt(response) == 0)
						mui.toast('此病例无法进行多专家会诊');
					else {
						$('#div_navigationBar').html('');
						$('#div_navigationBar').html(
							'<div class="layout_btn_distribution" style="width:100%">' +
							'	<button class="btn_action">' +
							'		<i class="material-icons">undo</i>' +
							'		<div>' +
							'			撤回' +
							'		</div>' +
							'	</button>' +
							'	<button class="btn_action"' +
							'style="position:absolute; top:0px; left:0px; width:100%; height:100%; opacity: 0"' +
							' 			onclick="withdrawMultiExpert()"></button>' +
							'</div>');
						
						$('#ToolbarTitle').text('多专家');

						setResult(MUTLI_EXPERT,
							getParameterNoPlus('consultId'), 22);
					}
				},
				error: function(jqXHR, textStatus) {
					console.log('DiagnosisDetails:提交多专家请求时发生连接错误:' + textStatus);
				}
			});
		}
	});
}

// 撤回多专家诊断
function withdrawMultiExpert() {
	mui.confirm('确定撤回此病例多专家会诊吗？', '提示', '["否", "是"]', function(event) {

		if(event.index == 0) {

			$.ajax({
				url: resturl + 'withdrawMultiExpert',
				data: JSON.stringify({
					consultId: getParameterNoPlus('consultId'),
				}),
				dataType: 'JSON',
				type: 'POST',
				cache: false,
				success: function(response) {
					console.log('DiagnosisDetails:多专家撤回完成, response:' + response);

					if(parseInt(response) == 0)
						mui.toast('此病例无法撤回');
					else {
						adapterView(getParameterNoPlus('consultId'));

						setResult(MUTLI_EXPERT,
							getParameterNoPlus('consultId'), 1);
					}
				},
				error: function(jqXHR, textStatus) {
					console.log('DiagnosisDetails:提交多专家撤回时发生连接错误:' + textStatus);
				}
			});
		}
	});
}

// 打开退回界面, 进行退回操作
function returnCase() {
	var consultId = getParameterNoPlus('consultId');

	console.log('DiagnosisDetails:returnCase.html?consultId=' + consultId);
	openWebView('returnCase.html?consultId=' + consultId, ReturnCase);
}

// 回收数据
function recycle() {
	console.log('打开popupWindow');
	var picker = new mui.PopPicker();

	picker.setData([{
			value: '0',
			text: '测试'
		},
		{
			value: '1',
			text: '费用'
		},
		{
			value: '2',
			text: '疑难'
		},
		{
			value: '3',
			text: '其他'
		}
	]);

	picker.show(function(SelectedItem) {
		console.log('DiagnosisDetails:' + SelectedItem[0].value + ':' + SelectedItem[0].text);

		var consultId = getParameterNoPlus('consultId');
		var type = SelectedItem[0].value;

		console.log('DiagnosisDetails:recycle: [consultId: ' + consultId + ', type: ' + type + ']');

		plus.nativeUI.showWaiting('数据回收中...');
		$.ajax({
			type: 'POST',
			url: resturl + 'recycle',
			async: true,
			data: JSON.stringify({
				consultId: consultId,
				type: type
			}),
			dataType: 'TEXT',
			success: function(response) {
				console.log('回收完成' + response);

				plus.nativeUI.closeWaiting();

				$('#div_navigationBar').empty();
				$('#div_navigationBar').html('<div class="layout_btn_distribution" style="width:100%">' +
					'	<button class="btn_action">' +
					'		<i class="material-icons">delete_sweep</i>' +
					'		<div>' +
					'			恢复病例' +
					'		</div>' +
					'	</button>' +
					'	<button class="btn_action"' +
					'style="position:absolute; top:0px; left:0px; width:100%; height:100%; opacity: 0"' +
					' 			onclick="reply()"></button>' +
					'</div>');
					
				$('#ToolbarTitle').text('回收');

				setResult(MUTLI_EXPERT,
					getParameterNoPlus('consultId'), -77);
			},
			error: function(jqXHR, textStatus) {
				console.log('回收时发生连接错误: ' + textStatus);

				plus.nativeUI.closeWaiting();
			}
		});
	});
}

// 从回收中取回数据
function reply() {

	console.log('DiagnosisDetails: 取回数据:' + getParameterNoPlus('consultId'));
	plus.nativeUI.showWaiting('数据取回中...');
	$.ajax({
		type: 'POST',
		url: resturl + 'reply',
		async: true,
		data: JSON.stringify({
			consultId: getParameterNoPlus('consultId')
		}),
		dataType: 'TEXT',
		success: function(response) {
			console.log('DaignosisDetails:取回回收' + response);

			if(parseInt(response) == -1)
				mui.toast('无法恢复');
			else {
				adapterView(getParameterNoPlus('consultId'));
				setResult(MUTLI_EXPERT,
					getParameterNoPlus('consultId'), -10000); // -10000状态不存在, 必定刷新界面
			}

			plus.nativeUI.closeWaiting();
		},
		error: function(jqXHR, textStatus) {
			console.log('DiagnosisDetails:取回回收时发生连接错误: ' + textStatus);

			plus.nativeUI.closeWaiting();
		}
	});
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

// 显示Toolbar
function setActionBar() {
	// 设置标题, 进入预约界面时没有状态, 不需要判定值
	setTitle();
}

// 显示title, 通过调用该方法能够实时刷新Toolbar上的Title
function setTitle() {
	var status = getParameterNoPlus('status');
	console.log('DiagnosisDetails:状态值:' + status);
	var title = TRIAGE_NOSTATUS_TITLE_DETAILS;
	switch(status) {
		case NOT_TRIAGE: // 待分诊
			title = NOT_TRIAGE_TITLE_DETAILS;
			break;
		case TRIAGE: // 已分诊
			title = TRIAGE_TITLE_DETAILS;
			break;
		case BACK_TRIAGE: // 退回
			title = BACK_TRIAGE_TITLE_DETAILS;
			break;
		case MULTI_EXPERT: // 多专家
			title = MULTI_EXPERT_TITLE_DETAILS;
			break;
		case RECYCLE: // 讨论
			title = RECYCLE_TITLE_DETAILS;
			break;
	}

	$('#ToolbarTitle').text(title);
}

// 渲染数据, 将数据填充
var HasExpID; // 用于分配时的参数
var ConsultNo; // 用于分配时的参数
function renderView(adapter) {

	console.log('DiagnosisDetails:渲染数据:' + adapter);
	if(adapter.length > 0) {

		HasExpID = adapter[0].ExpID == null ? '' : adapter[0].ExpID;
		ConsultNo = adapter[0].ConsultNo;

		// 患者信息 名称 性别 年龄
		$('#span_info').html(adapter[0].Name + " " + adapter[0].Sex + " " + adapter[0].Age);
		$('#span_caseNo').html(adapter[0].CaseNo); // 病理号	
		$('#span_sent_Hospital').html(adapter[0].Hospital); // 送检医院	
		$('#span_clinical_Data').html(adapter[0].Clinical_Data); // 临床数据
		$('#span_z_diagnosis').html(adapter[0].z_Digagnosis); // 诊断信息	
		var gennerallySee = adapter[0].Gennerally_See // 大体所见
		if(gennerallySee == "") {
			gennerallySee = "无";
		}
		$('#span_gennerally_See').html(gennerallySee)

		// 免疫组化
		var immuneGroup = adapter[0].Immune_Group
		if(immuneGroup == "") {
			immuneGroup = "无";
		}
		$('#span_immune_Group').html(immuneGroup);

		//原病理诊断
		var earlyDiagnosis = adapter[0].Early_Digagnosis
		if(earlyDiagnosis == "") {
			earlyDiagnosis = "无";
		}
		$('#span_early_diagnosis').html(earlyDiagnosis);

		$('#span_slide_count').html(adapter[0].slidecount); // 切片数
		$('#span_annex_count').html(adapter[0].annexcount); // 附件数

		if(getParameterNoPlus("ConsultStatusID") == 1) {

		} else if(getParameterNoPlus("ConsultStatusID") == 4 ||
			getParameterNoPlus("ConsultStatusID") == 2) {
			$('#textarea_review').val(adapter[0].Diagnosis);
			$('#textarea_diagnosis').val(adapter[0].Diagnosis);
			$('#textarea_remark').val(adapter[0].Diagnosis_Remark);
			$('#textarea_z_mirror').val(adapter[0].z_Mirror);
		}

		$('#textarea_return').html(adapter[0].RecheckReturn);
		$('#span_received_Date').html(adapter[0].ConsultTime.replace(/T/, ' '));
		$('#span_materialParts').html(adapter[0].MaterialParts);
		$('#span_z_diagnosis').html(adapter[0].z_Digagnosis);
		$('#textarea_invited_remark').val(adapter[0].InviteReason);
		$('#textarea_replyDiagnosis').val(adapter[0].DiagnosisReason);
		var Remark = adapter[0].Remark //原病理诊断
		if(Remark == '') {
			Remark = '无';
		}
		$('#span_remark').html(Remark);
		_IsCollect = adapter[0].IsCollect;
		if(_IsCollect == null) {
			_IsCollect = 0;
		}

		if(_IsCollect == 0) {
			$('#btncollection').removeClass('mui-icon-star-filled');
			$('#btncollection').addClass('mui-icon-star');

		} else {
			$('#btncollection').removeClass('mui-icon-star');
			$('#btncollection').addClass('mui-icon-star-filled');
		}

		$('#LoadingAnimation').css('display', 'none'); // 载入等待动画关闭
		$('#details').css('display', ''); // 显示数据

		// 操作权限获取, 通过status来判定
		setAction(adapter);
		toggleNavigationBar(true);
	};
}

// 显示附件
function renderAnnexList(adapter) {

	var annexItemTemplate = '<li class="mui-table-view-cell mui-media">' +
		'<a class="mui-navigate-right annex @annexState" data-id="@AnnexPath" ' +
		' data-name="@Xannexame" data-Status="@Status" data-ClientPath="@ClientPath">' +
		'<img class="mui-media-object mui-pull-left" src="../images/annex.png">' +
		'<div class="mui-media-body">@AnnexName' +
		'<div class="mui-badge mui-btn-success" style="@annextypeshow">@annexdataMessage</div>' +
		'<p class="mui-ellipsis">@AnnexType</p>' +
		'</div>' +
		'</a>' +
		'</li>';

	var URL = "http://" + getParameterNoPlus("DiagHisIp") + ":" + getParameterNoPlus("DiagHisPort") + "";

	if(adapter.length > 0) {
		var div = "";
		for(var i = 0; i < adapter.length; i++) {
			var annextypeshow = "display:none";
			var path = adapter[i].Path;
			var annexpath = path.replace(new RegExp(/(\\)/g), '\\\\');
			var ClientPath = adapter[i].ClientPath.replace(new RegExp(/(\\)/g), '\\\\');
			// 云切片，上传中显示
			var message = "";
			// 是否上传完成标志位
			var state = "annexComplete";
			if(adapter[i].Status != "1") {
				if(SiteStatus == 1) {
					annextypeshow = "";
					message = "云数据";
				} else {
					annextypeshow = "";
					message = "上传中";
					state = "annexLoading";
				}
			}

			div += annexItemTemplate.replace(/@AnnexName/, adapter[i].AnnexName)
				.replace(/@AnnexType/, adapter[i].AnnexType)
				.replace(/@AnnexPath/, annexpath)
				.replace(/@Xannexame/, adapter[i].AnnexName + "(" + adapter[i].AnnexType + ")")
				.replace(/@Status/, adapter[i].Status)
				.replace(/@ClientPath/, ClientPath)
				.replace(/@annextypeshow/, annextypeshow)
				.replace(/@annexdataMessage/, message)
				.replace(/@annexState/, state);
		}

		$('#annexeslist').html(div);
		mui('.mui-table-view').on('tap', '.annexComplete', function() {
			var annexUrl = "";
			var annexpath = this.getAttribute('data-id');
			var Status = this.getAttribute('data-Status');

			if(Status != "1") {
				annexpath = this.getAttribute('data-ClientPath');
			}

			if(annexpath.indexOf('.pdf') != -1) {
				annexUrl = "../pdfviewer.html?annexpath=" + escape(encodeURI(annexpath)) +
					"&annexUrl=" + URL +
					"&Status=" + Status +
					"&title=" + escape(encodeURI(this.getAttribute('data-name')));
			} else {
				annexUrl = "../picviewer.html?annexpath=" + escape(encodeURI(annexpath)) +
					"&annexUrl=" + URL +
					"&Status=" + Status +
					"&title=" + escape(encodeURI(this.getAttribute('data-name')));
			}
			openWebView(annexUrl, 'school_detail3', {

			});

		});
	} else {
		$('#annexeslist').html("<div align=\"center\"><p>无附件上传</p></div>");
	}
}

// 显示切片列表
function renderSlideList(adapter) {

	var slideItemTemplate = '<li class="mui-table-view-cell mui-media">' +
		'<a class="mui-navigate-right slide @slideState" data-Status="@Status" ' +
		' data-id="@kfbpath" data-name="@Aslidename">' +
		'<img class="mui-media-object mui-pull-left" data-lazyload="@labelurl">' +
		'<img class="mui-media-object mui-pull-left" data-lazyload="@thumburl">' +
		'<div class="mui-media-body">@slidename' +
		'<div class="mui-badge mui-btn-success" style="@slidetypeshow">@slidedataMessage</div>' +
		'<p class="mui-ellipsis">@ranse</p>' +
		'</div>' +
		'</a>' +
		'</li>';

	var URL = "http://" + getParameterNoPlus("DiagHisIp") + ":" + getParameterNoPlus("DiagHisPort") + "";
	console.log('diagnosisDetails: 获取远程URL' + URL);

	if(adapter.length > 0) {
		var content = '';
		for(var i = 0; i < adapter.length; i++) {
			var ranse = "HE";
			var UncToken = "";
			var kfbpath = adapter[i].Path.replace(new RegExp(/(\\)/g), '\\\\');
			var slidetypeshow = 'display:none';
			if(adapter[i].RanSe == "0") {
				ranse = "其他";
			} else if(adapter[i].RanSe == "2") {
				ranse = "免疫组化";
			} else if(adapter[i].RanSe == "3") {
				ranse = "其它染色";
			}
			if(adapter[i].UncToken != "") {
				UncToken = "&UncToken=" + adapter[i].UncToken;
			}

			// 标志是否完成
			var message = '';
			// 是否上传完成标志位
			var state = "slideComplete";

			//console.log("选择的Status是：" + data[i].Status);
			if(adapter[i].Status == "1") {
				var LabUrl = viewerurl + "/LabelHandler.ashx?kfbpath=" + encodeURI(kfbpath);
				var PreUrl = viewerurl + "/ThumnailHandler.ashx?kfbpath=" + encodeURI(kfbpath);
			} else {
				if(SiteStatus == 1) {
					slidetypeshow = "";
					message = "云数据";
				} else {
					slidetypeshow = "";
					message = "上传中";
					state = "slideLoading";
				}
				var ClientPath = adapter[i].ClientPath;
				kfbpath = ClientPath.replace(new RegExp(/(\\)/g), '\\\\');
				PreUrl = "" + URL + "/API/ThumnailHandler?kfbpath=" + encodeURI(ClientPath);
				LabUrl = "" + URL + "/API/LabelHandler?kfbpath=" + encodeURI(ClientPath);

			}
			content += slideItemTemplate.replace(/@labelurl/, LabUrl)
				.replace(/@thumburl/, PreUrl)
				.replace(/@slidename/, adapter[i].SlideName)
				.replace(/@ranse/, ranse)
				.replace(/@kfbpath/, kfbpath)
				.replace(/@Aslidename/, adapter[i].SlideName + "(" + ranse + ")")
				.replace(/@Status/, adapter[i].Status)
				.replace(/@slidetypeshow/, slidetypeshow)
				.replace(/@slidedataMessage/, message)
				.replace(/@slideState/, state);
		}
		$('#slidelist').html(content);
		(function($) {
			$(document).imageLazyload({
				placeholder: '../images/60x60.gif'
			});
		})(mui);
		mui('.mui-table-view').on('tap', '.slideComplete', function() {
			var Status = this.getAttribute('data-Status');
			if(Status == "1") {
				//var url = viewerurl + "/Html5/SeadragonViewer.aspx";
				var viewUrl = "../slideviewer.html?lang=zh-cn&CaseNo=" + getParameterNoPlus('consultId') +
					"&kfbpath=" + encodeURI(escape(this.getAttribute('data-id'))) +
					"&SwitchCut=1&ToolBottom=40&title=" +
					encodeURI(this.getAttribute('data-name')) + "";
				openWebView(viewUrl, 'slideviewer', {});
			} else {
				var viewUrl = "../slideviewer2.html?lang=zh-cn&URL=" + URL +
					"&CaseNo=" + getParameterNoPlus('consultId') +
					"&kfbpath=" + encodeURI(escape(this.getAttribute('data-id'))) +
					"&SwitchCut=1&title=" + encodeURI(this.getAttribute('data-name')) + "";
				openWebView(viewUrl, 'slideviewer2', {});
			}
		});
	} else {
		$('#slidelist').html("<div align=\"center\"><p>无切片上传</p></div>");
	}
}

function renderMessageList(adapter, flag) {

	var messageItemTemplate = '<div class="msg-item @self" >@selfimg' +
		'<div class="msg-content">' +
		'<div class="msg-content-inner" style="word-wrap:break-word">@message<br/>[@time]</div>' +
		'<div class="msg-content-arrow"></div>' +
		'</div>' +
		'<div class="mui-item-clear"></div>' +
		'</div>';

	if(adapter.length > 0) {
		var content = "";
		for(var i = 0; i < adapter.length; i++) {
			var selfclass = 'msg-item-self';
			var selfimg = '<i class="msg-user mui-icon mui-icon-person"></i>'
			if(adapter[i].RoleID != 2) {
				selfclass = '';
				selfimg = '<img class="msg-user-img" src="../images/HisLogo.png" alt="" style="width:38px;"/>';
			}
			content += messageItemTemplate.replace(/@message/, adapter[i].Message)
				.replace(/@self/, selfclass)
				.replace(/@selfimg/, selfimg)
				.replace(/@time/, adapter[i].MessageTime.replace('T', ' '))
		}

		$("#messageList").html(content);
		if(flag == true) {
			var xheight = $("#messageList").height();
			mui('#messageLayoutScroll').scroll().scrollTo(0, -xheight, 100);
			mui('#messageLayoutScroll').scroll().refresh();
		}

	} else {
		$('#messageList').html("<div align=\"center\"><p>暂无留言</p></div>");
	}
}

// 开关留言数据与操作UI
// flag true false
function toggleNavigationBar(flag) {

	if(flag) { // 操作
		if($('#div_navigationBar').children().length != 0)
			$('#div_navigationBar').css('display', '');
		else
			$('#div_navigationBar').css('display', 'none');

		$('#div_message').css('display', 'none');
		$('#layout_send').css('display', 'none');
	} else { // 留言

		$('#div_message').css('display', '');
		$('#layout_send').css('display', '');

		$('#div_navigationBar').css('display', 'none');
	}

	// 当不存在需要显示的底部navigation时隐藏bottomNavigationBar
	if($('#div_message').css('display') == 'none' && $('#div_navigationBar').css('display') == 'none')
		$('#bottomNavigationBar').css('display', 'none');
	else
		$('#bottomNavigationBar').css('display', '');
}

// 设置Tab滑动事件
document.querySelector(".mui-slider").addEventListener("slide", function(event) {
	var consultId = getParameterNoPlus("consultId"); // 获取需要查看的数据id
	switch(event.detail.slideNumber) {
		case 1: // 切片列表
			toggleNavigationBar(true); // 显示操作
			loadingSlides(consultId); // 异步载入切片
			break;
		case 2: // 附件列表
			toggleNavigationBar(true); // 显示操作
			loadingAnnexes(consultId); // 异步载入附件列表
			break;
		case 3: // 留言
			toggleNavigationBar(false); // 显示留言操作
			loadingMessage(consultId, false);
			break;
		case 0: // 详情
		default:
			toggleNavigationBar(true); // 显示操作
			break;
	}
});

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
	isComplete();

	$.ajax({
		url: resturl + 'getDistributeDetails',
		data: {
			consultId: consultId
		},
		dataType: 'JSON',
		type: 'GET',
		timeout: 10000,
		cache: 10000,
		success: function(response) {
			console.log('DiagnosisDetails:数据获取完成, 获取基本信息:' + response);
			var response = JSON.parse(response);

			// 渲染数据
			renderView(response);
		},
		error: function(jqXHR, textStatus) {
			console.log('DiagnosisDetails:获取详情信息时发生连接错误: ' + textStatus);
		}
	});
}

// 载入附件信息
function loadingAnnexes(consultId) {
	$.ajax({
		url: resturl + 'getDistributeAnnexList',
		data: {
			consultId: consultId
		},
		dataType: 'json',
		type: 'get',
		timeout: 10000,
		cache: false,
		success: function(response) {
			console.log('DiagnosisDetails:获取附件列表完成: ' + response);
			var response = JSON.parse(response);

			// 将附件列表显示
			renderAnnexList(response);

			//$('#annexeslist .mui-loading').css('display', 'none'); // 载入等待动画关闭
		},
		error: function(jqXHR, textStatus) {
			console.log('DiagnosisDetails:获取附件信息时发生连接错误: ' + textStatus);
		}
	});
}

// 载入切片列表
function loadingSlides(consultId) {
	$.ajax({
		url: resturl + 'getDistributeSlideList',
		data: {
			consultId: consultId
		},
		dataType: 'json',
		type: 'get',
		timeout: 10000,
		cache: false,
		success: function(response) {
			console.log('DiagnosisDetails:获取切片列表完成: ' + response);
			var response = JSON.parse(response);

			// 将切片列表数据显示
			renderSlideList(response);

			//$('#slidelist .mui-loading').css('display', 'none'); // 载入等待动画关闭
		},
		error: function(jqXHR, textStatus) {
			console.log('DiagnosisDetails:获取切片列表时发生连接错误: ' + textStatus);
		}
	});
}

// 载入受邀信息
function loadingMessage(consultId, flag) {
	$.ajax({
		url: resturl + 'GetMessage',
		data: {
			consultId: consultId
		},
		dataType: 'json',
		type: 'get',
		timeout: 10000,
		cache: false,
		success: function(response) {
			console.log('DiagnosisDetails:获取留言完成: ' + response);
			var response = JSON.parse(response);

			renderMessageList(response, flag);

			// $('#messageList .mui-loading').css('display', 'none'); // 载入等待动画关闭
		},
		error: function(jqXHR, textStatus) {
			console.log('DiagnosisDetails:获取受邀信息时发生连接错误: ' + textStatus);
		}
	});
}

// 添加操作动作, 通过status判定是否能够进行各个权限操作
function setAction(adapter) {
	// var status = parseInt(getParameterNoPlus('status'));
	var status = adapter[0].status;
	console.log('DiagnosisDetails:获取状态:' + status);

	adapter[0].ExpID = adapter[0].ExpID == null ? '' : adapter[0].ExpID;

	var difference = 0;
	// 判定由哪个时间来进行计算, 获取差值赋值difference
	if(adapter[0].comparedDate1 == '' ||
		adapter[0].comparedDate1 == null)
		difference = parseInt(adapter[0].comparedDate2);
	else
		difference = parseInt(adapter[0].comparedDate1);
	console.log('DiagnosisDetails:difference = ' + difference);

	/******************************************/
	// 测试用status, 测试完成后删除
	// 用于测试未分配数据
	// status = 1;
	// difference = 1000;
	/******************************************/

	console.log('DiagnosisDetails: 获取状态设置动作:status = ' + status + "; ExpID = " + adapter[0].ExpID)

	$('#div_navigationBar').html('');
	if(status == -77) { // 数据已经被回收, 不能存在其他操作,只能恢复
		$('#div_navigationBar').html(
			'<div class="layout_btn_distribution" style="width:100%">' +
			'	<button class="btn_action">' +
			'		<i class="material-icons">delete_sweep</i>' +
			'		<div>' +
			'			恢复病例' +
			'		</div>' +
			'	</button>' +
			'	<button class="btn_action"' +
			'style="position:absolute; top:0px; left:0px; width:100%; height:100%; opacity: 0"' +
			' 			onclick="reply()"></button>' +
			'</div>');
			$('#ToolbarTitle').text('回收');
	} else if(adapter[0].IsManyExp == 1) { // 多专家诊断, 能够撤回多专家与回收
		$('#div_navigationBar').html(
			'<div class="layout_btn_distribution" style="width:100%">' +
			'	<button class="btn_action">' +
			'		<i class="material-icons">undo</i>' +
			'		<div>' +
			'			撤回' +
			'		</div>' +
			'	</button>' +
			'	<button class="btn_action"' +
			'style="position:absolute; top:0px; left:0px; width:100%; height:100%; opacity: 0"' +
			' 			onclick="withdrawMultiExpert()"></button>' +
			'</div>' 
			
			/*+'<div class="layout_btn_distribution">' +
			'	<button class="btn_action">' +
			'		<i class="material-icons">delete_sweep</i>' +
			'		<div>' +
			'			回收' +
			'		</div>' +
			'	</button>' +
			'	<button class="btn_action"' +
			'style="position:absolute; top:0px; left:0px; width:100%; height:100%; opacity: 0"' +
			' 			onclick="recycle()"></button>' +
			'</div>'*/);
			$('#ToolbarTitle').text('多专家');
	} else if(status == -2 || status == -1) { // 已退回, 无操作
		$('#div_navigationBar').html('<div class="layout_btn_distribution">' +

			'</div>');
	} else if(status == 1 && adapter[0].ExpID == '') { // 待分诊，
		$('#div_navigationBar').html(
			'<div class="layout_btn_distribution" style="width:33%">' +
			'	<button class="btn_action">' +
			'		<i class="material-icons">create</i>' +
			'		<div>' +
			'			分配' +
			'		</div>' +
			'	</button>' +
			'	<button class="btn_action"' +
			'style="position:absolute; top:0px; left:0px; width:100%; height:100%; opacity: 0"' +
			' 			onclick="getExpertList(\'' + adapter[0].ConsultID +
			'\', \'' + adapter[0].HisID +
			'\', \'' + adapter[0].CenterID +
			'\', \'' + adapter[0].ExpID + '\')"></button>' +
			'</div>' +

			'<div class="layout_btn_distribution" style="width:33%">' +
			'	<button class="btn_action">' +
			'		<i class="material-icons">group</i>' +
			'		<div>' +
			'			多专家' +
			'		</div>' +
			'	</button>' +
			'	<button class="btn_action"' +
			'style="position:absolute; top:0px; left:0px; width:100%; height:100%; opacity: 0"' +
			' 			onclick="multiExpert()"></button>' +
			'</div>' +

			'<div class="layout_btn_distribution" style="width:33%">' +
			'	<button class="btn_action">' + 
			'		<i class="material-icons">undo</i>' +
			'		<div>' +
			'			退回站点' +
			'		</div>' +
			'	</button>' +
			'	<button class="btn_action"' +
			'style="position:absolute; top:0px; left:0px; width:100%; height:100%; opacity: 0"' +
			' 			onclick="returnCase()"></button>' +
			'</div>' 
			
			/*+'<div class="layout_btn_distribution">' +
			'	<button class="btn_action">' +
			'		<i class="material-icons">delete_sweep</i>' +
			'		<div>' +
			'			回收' +
			'		</div>' +
			'	</button>' +
			'	<button class="btn_action"' +
			'style="position:absolute; top:0px; left:0px; width:100%; height:100%; opacity: 0"' +
			' 			onclick="recycle()"></button>' +
			'</div>'*/);
			$('#ToolbarTitle').text('待分诊');
	} else if(status != 0 && status != 99 && status != 100 && status != 101) {
		console.log('DiagnosisDetails:IsPublisher = ' + adapter[0].IsPublisher);
		console.log('DiagnosisDetails:difference = ' + difference);
		//if(adapter[0].IsPublisher != 1 || difference < 0) // 是否超时
		if(adapter[0].IsPublisher != 1 || status != 4)
			$('#div_navigationBar').html(
				'<div class="layout_btn_distribution" style="width:100%">' +
				'	<button class="btn_action">' +
				'		<i class="material-icons">create</i>' +
				'		<div>' +
				'			重新分配' +
				'		</div>' +
				'	</button>' +
				'	<button class="btn_action"' +
				'style="position:absolute; top:0px; left:0px; width:100%; height:100%; opacity: 0"' +
				' 			onclick="getExpertList(\'' + adapter[0].ConsultID +
				'\', \'' + adapter[0].HisID +
				'\', \'' + adapter[0].CenterID +
				'\', \'' + adapter[0].ExpID + '\')"></button>' +
				'</div>');
		$('#div_navigationBar').append('<div class="layout_btn_distribution">' +

			'</div>');
			
		/*$('#div_navigationBar').append('<div class="layout_btn_distribution">' +
			'	<button class="btn_action">' +
			'		<i class="material-icons">delete_sweep</i>' +
			'		<div>' +
			'			回收' +
			'		</div>' +
			'	</button>' +
			'	<button class="btn_action"' +
			'style="position:absolute; top:0px; left:0px; width:100%; height:100%; opacity: 0"' +
			' 			onclick="recycle()"></button>' +
			'</div>');*/
		$('#ToolbarTitle').text('已分诊');
	}
}

// 分配操作
function getExpertList(consultId, hospitalId, centerId, expertId) {
	console.log('DiagnosisDetails:分配操作时数据:[centerId:' + centerId + ',hospitalId:' +
		hospitalId + ",expertId:" + expertId + "]");
	$.ajax({
		type: 'GET',
		url: resturl + 'getCenterExpertList',
		async: true,
		data: {
			centerId: centerId,
			hospitalId: hospitalId,
			expertId: expertId
		},
		timeout: 10000,
		success: function(response) {

			console.log('DiagnosisDetails:获取专家列表成功, 返回结果: ' + response);

			setExpertListAdapter(JSON.parse(response));

			showExpertList();
		},
		error: function(jqXHR, textStatus) {
			console.log('DiagnosisDetails:获取专家列表时发生连接错误: ' + textStatus);
		}
	});
}

function setExpertListAdapter(adapter) {

	/*var template = '<li class="mui-table-view-cell mui-collapse mui-active">' +*/
	var template = '<li class="mui-table-view-cell mui-active">' +
		'				<a class="mui-navigate-right" href="#">' +
		'					centerNameTemplate</a>' +
		'				<div class="mui-collapse-content">' +
		'					<ul class="mui-table-view">' +
		'                 	subTemplate' +
		'					</ul>' +
		'				</div>' +
		'			</li>';

	var expertItemTemplate = '<div class="mui-input-row mui-radio mui-left">' +
		'<label >expertNametemplate</label>' +
		'<input name="expert" type="radio" data-expert-id="expertIdTemplate">' +
		'</div>';

	/*if(adapter.length <= 0) {

	} else {
		var content = '';
		for(var i = 0; i < adapter.length; i++) {
			content += expertItemTemplate
				.replace(/expertIdTemplate/, adapter[i].UserID)
				.replace(/expertNametemplate/, adapter[i].DisplayName);
		}
		$('#expertListView').html(content);
	}*/
	/*********************************************************************************/
	var centerSet = new Set();
	for(var adapterIndex = 0; adapterIndex < adapter.length; adapterIndex++) {
		console.log('获取site = ' + adapterIndex);
		var centerArray = adapter[adapterIndex].expcenter.split(',');
		for(var i = 0; i < centerArray.length; i++)
			centerSet.add(centerArray[i]);
	}

	var content = '';
	console.log('Diagnosis: centerSet:' + centerSet );
	
	//centerArray.forEach(function(element, index, data) {
	centerSet.forEach(function(element, index, data) {
		console.log('DiagnosisDetails:遍历中...[' + index + '] is ' + element);

		var subList = '';
		if(element != '') {
			for(var i = 0; i < adapter.length; i++) {
				if(adapter[i].expcenter.indexOf(element) >= 0) {
					console.log('DiagnosisDetails:' + element + '中拥有数据:' + adapter[i].DisplayName);
					subList += expertItemTemplate
						.replace(/expertIdTemplate/, adapter[i].UserID)
						.replace(/expertNametemplate/, adapter[i].DisplayName);
				}
			}

			content += template
				.replace(/centerNameTemplate/, element)
				.replace(/subTemplate/, subList);
		}

		$('#expertListView').html(content);
	});
}

/**********************************************************************/
/**
 * 额外逻辑
 * 
 * 
 * 
 * 
 * 
 *
 *
 */

function isComplete() {
	var URL = "http://" + getParameterNoPlus("DiagHisIp") +
		":" + getParameterNoPlus("DiagHisPort") + "";
	console.log("DiagnosisDetails:判定是否站点是否连接:" + URL);

	if(getParameterNoPlus("DiagHisIp") != "localhost") {
		$.ajax({
			url: URL + "/API/Ver",
			type: "GET",
			dataType: "text",
			async: true,
			timeout: 1000,
			success: function(response) {
				// "1" 状态标识云切片
				SiteStatus = 1;
			},
			error: function(jqXHR, textStatus) {
				// "0" 状态标识上传中
				SiteStatus = 0;
			},
			complete: function(XMLHttpRequest, status) { //请求完成后最终执行参数
				if(status == 'timeout') { //超时,status还有success,error等值的情况
					/*					ajaxTimeoutTest.abort();*/
					SiteStatus = 0;
				}
			}
		});
	} else {
		SiteStatus = 0;
	}
}