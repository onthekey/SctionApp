    			var slidedata = [
				'<li class="mui-table-view-cell mui-media">',
					'<a class="mui-navigate-right slide" data-Status="@Status" data-id="@kfbpath" data-name="@Aslidename">',
						'<img class="mui-media-object mui-pull-left" data-lazyload="@labelurl">',
						'<img class="mui-media-object mui-pull-left" data-lazyload="@thumburl">',
						'<div class="mui-media-body">@slidename',
							'<div class="mui-badge mui-btn-success" style="@slidetypeshow">云数据</div>',
							'<p class="mui-ellipsis">@ranse</p>',
						'</div>',
					'</a>',
				'</li>'
			]
			
			var annexdata = [
				'<li class="mui-table-view-cell mui-media">',
					'<a class="mui-navigate-right annex" data-id="@AnnexPath" data-name="@Xannexame" data-Status="@Status" data-ClientPath="@ClientPath">',
						'<img class="mui-media-object mui-pull-left" src="images/annex.png">',
						'<div class="mui-media-body">@AnnexName',
							'<div class="mui-badge mui-btn-success" style="@annextypeshow">云数据</div>',
							'<p class="mui-ellipsis">@AnnexType</p>',
						'</div>',
					'</a>',
				'</li>'
			]
			var messagedata = [
				'<div class="msg-item @self" >@selfimg',
				'<div class="msg-content">',
				'<div class="msg-content-inner">@message<br/>[@time]</div>',
				'<div class="msg-content-arrow"></div>',
				'</div>',
				'<div class="mui-item-clear"></div>',
				'</div>'
			]
			var inviteddata = [
				'<li class="mui-table-view-cell invite">',
				' <div class="mui-table">',
				' <div class="mui-table-cell mui-col-xs-10">',
				'<h4>专家：@displayname</h4>',
				'<h5>回复时间：@DiagnosisTime</h5>',
				'<p >回复：@xDiagnosis</p>',
				'</div>',
				'</div>',
				'</li>',
			]

		//	console.log("info-coreurl:"+Viewer);
			var viewerurl = coreurl+"Viewer";
			var _ConsultID = 0;
			var _CaseNo = "";
			var _ip = "";
			var _port = "";
			var _IsCollect=0;
			var deceleration = mui.os.ios ? 0.003 : 0.0009;
			var wating;
			
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
			
			//初始化
			mui.ready(function() {
				var ConsultID = getQueryString2("ConsultID");
				_ConsultID = ConsultID;
				LoadCase(ConsultID);
				LoadControl();
				LoadMessage(ConsultID, true) ;// flag什么作用?
			});
			
			//加载留言
			function LoadMessage(ConsultID, flag) {
				 if(jQuery('#msg-list div').hasClass('msg-item') == false || flag == true) {
					var userInfo = localStorage.getItem("userInfo");
					var user = userInfo ? window.eval("(" + userInfo + ")") : "";
					jQuery.ajax(resturl + 'Message', {
						data: {
							ConsultID: ConsultID
						},
						dataType: 'json', //服务器返回json格式数据
						type: 'get', //HTTP请求类型
						timeout: 10000, //超时时间设置为10秒；
						cache: false,
						success: function(data) {
							var div = "";
							data = eval(data);
							if(data.length > 0) {
								for(var i = 0; i < data.length; i++) {
									var selfclass = "msg-item-self";
									var selfimg = "<img class=\"msg-user mui-icon \" style=\"width:37px;height:37px;margin:3px;\" src=\"../images/user-photo.png\" >"
									
									if(data[i].UserID != user.userid) {
										selfclass = "";
									selfimg = "<img class=\"msg-user-img mui-icon-person\" style=\"width:37px;height:37px;margin:3px;\" src=\"../images/HisLogo.png\" alt=\"\" />";
									}
									div += messagedata.join('').replace(/@message/, data[i].Message)
										.replace(/@self/, selfclass)
										.replace(/@selfimg/, selfimg)
										.replace(/@time/, data[i].MessageTime.replace('T', ' '))
								}

								jQuery("#msg-list").html(div);
								if(flag == true) {

									var xheight = jQuery("#msg-list").height();
									mui('#scroll4').scroll().scrollTo(0, -xheight, 100);
									mui('#scroll4').scroll().refresh();
								}

							}
							else{
								jQuery('#msg-list').html("<div align=\"center\"><p>暂无留言</p></div>");
								
							}

						},
						error: function(xhr, type, errorThrown) {
							if(type == 'timeout') {
								mui.toast("网络不给力，请重新操作！");

							}
						}
					});
				}

			}
			
			//加载附件
			
			function LoadAnnex(ConsultID) {
				var URL = "http://" + getQueryString2("DiagHisIp") + ":" + getQueryString2("DiagHisPort") + "";
				if(jQuery('#annexlist li').hasClass('mui-media') == false) {

					jQuery.ajax(resturl + 'GetAnnexDataMode', {
						data: {
							ConsultID: ConsultID,
						},
						dataType: 'json', //服务器返回json格式数据
						type: 'get', //HTTP请求类型
						timeout: 10000, //超时时间设置为10秒；
						cache: false,
						success: function(data) {
							var div = "";
							data = eval(data);
							if(data.length > 0) {
								for(var i = 0; i < data.length; i++) {
									var annextypeshow = "display:none";
									var path = data[i].Path;
									var annexpath = path.replace(new RegExp(/(\\)/g), '\\\\');
									var ClientPath=data[i].ClientPath.replace(new RegExp(/(\\)/g), '\\\\');
									if (data[i].Status != "1") {
											annextypeshow="";
										}
									
									div += annexdata.join('').replace(/@AnnexName/, data[i].AnnexName)
										.replace(/@AnnexType/, data[i].AnnexType)
										.replace(/@AnnexPath/, annexpath)
										.replace(/@Xannexame/, data[i].AnnexName + "(" + data[i].AnnexType + ")")
										.replace(/@Status/, data[i].Status)
										.replace(/@ClientPath/,ClientPath)
										.replace(/@annextypeshow/, annextypeshow)
										
								}
								
								jQuery('#annexlist').html(div);
								mui('.mui-table-view').on('tap', '.annex', function() {
									var jumpurl = "";
									var annexpath = this.getAttribute('data-id');
									var Status=this.getAttribute('data-Status');
									
									if(Status!="1"){
										annexpath=this.getAttribute('data-ClientPath');
									}
									
									
									if(annexpath.indexOf('.pdf') != -1) {
										console.log("infopdf"+URL);
										jumpurl = "../pdfviewer.html?annexpath=" + escape(encodeURI(annexpath)) + "&annexUrl=" + URL + "&Status=" + Status + "&title=" + escape(encodeURI(this.getAttribute('data-name')));
									} else {
										console.log("infopic"+URL);
										jumpurl = "../picviewer.html?annexpath=" + escape(encodeURI(annexpath)) + "&annexUrl=" + URL + "&Status=" + Status + "&title=" + escape(encodeURI(this.getAttribute('data-name')));
									}
									jump(jumpurl, 'school_detail3', {

									});

								});
							}else{
								jQuery('#annexlist').html("<div align=\"center\"><p>无附件上传</p></div>");
								
							}

						},
						error: function(xhr, type, errorThrown) {
							if(type == 'timeout') {
								mui.toast("网络不给力，请重新操作！");

							}
						}
					});
				}

			}

			//加载切片
			
			
			function LoadSlide(ConsultID) {
				var URL = "http://" + getQueryString2("DiagHisIp") + ":" + getQueryString2("DiagHisPort") + "";
				if(jQuery('#slidelist li').hasClass('mui-media') == false) {
					jQuery.ajax(resturl + 'GetSlideDataMode', {
					
						data: {
							ConsultID: ConsultID,
						},
						dataType: 'json', //服务器返回json格式数据
						type: 'get', //HTTP请求类型
						timeout: 10000, //超时时间设置为10秒；
						cache: false,
						
						success: function(data) {
														
							var div = "";
							data = eval(data);
							if(data.length > 0) {
								for(var i = 0; i < data.length; i++) {
									var ranse = "HE";
									var UncToken = "";
									var kfbpath = data[i].Path.replace(new RegExp(/(\\)/g), '\\\\');
								    var slidetypeshow = "display:none";
									if(data[i].RanSe == "0") {
										ranse = "其他";
									} else if(data[i].RanSe == "2") {
										ranse = "免疫组化";
									} else if(data[i].RanSe == "3") {
										ranse = "其它染色";
									}
									if(data[i].UncToken != "") {
										UncToken = "&UncToken=" + data[i].UncToken;
									}

									if (data[i].Status == "1") {
							            var LabUrl = viewerurl + "../LabelHandler.ashx?kfbpath=" + encodeURI(kfbpath);
										var PreUrl = viewerurl + "../ThumnailHandler.ashx?kfbpath=" + encodeURI(kfbpath);
										
										console.log('caseInfo:PreUrl' + PreUrl);
							        }
							        else {

            							var ClientPath = data[i].ClientPath;            
						                kfbpath = ClientPath.replace(new RegExp(/(\\)/g), '\\\\');
						                PreUrl = "" + URL + "/API/ThumnailHandler?kfbpath=" + encodeURI(ClientPath);
						                LabUrl = "" + URL + "/API/LabelHandler?kfbpath=" + encodeURI(ClientPath);
						                console.log('caseInfo:URL获取:' + PreUrl);
						               	console.log('caseInfo:coreurl获取:' + coreurl);
						               slidetypeshow="";
							        }
									div += slidedata.join('').replace(/@labelurl/, LabUrl)
										.replace(/@thumburl/, PreUrl)
										.replace(/@slidename/, data[i].SlideName)
										.replace(/@ranse/, ranse)
										.replace(/@kfbpath/, kfbpath)
										.replace(/@Aslidename/, data[i].SlideName + "(" + ranse + ")")
										.replace(/@Status/, data[i].Status)
										.replace(/@slidetypeshow/, slidetypeshow)
								}
								jQuery('#slidelist').html(div);
								(function($) {
									$(document).imageLazyload({
										placeholder: 'images/60x60.gif'
									});
								})(mui);
								mui('.mui-table-view').on('tap', '.slide', function() {
									var Status=this.getAttribute('data-Status');
									console.log("caseinfo Status："+(Status=="1"));
									if(Status=="1"){
										//var url = viewerurl + "/Html5/SeadragonViewer.aspx";
										console.log("caseinfo jupurl"+jumpurl);
										var jumpurl = "../slideviewer.html?lang=zh-cn&CaseNo=" + _ConsultID + "&kfbpath=" + encodeURI(escape(this.getAttribute('data-id'))) + "&SwitchCut=1&ToolBottom=40&title=" + encodeURI(this.getAttribute('data-name')) + "";
										jump(jumpurl, 'slideviewer', {

										});
									}else{
										var jumpurl = "../slideviewer2.html?lang=zh-cn&URL=" + URL + "&CaseNo=" + ConsultID + "&kfbpath=" + encodeURI(escape(this.getAttribute('data-id')))  + "&SwitchCut=1&title=" + encodeURI(this.getAttribute('data-name')) + "";
										jump(jumpurl, 'slideviewer2', {

										});
									}
								});
							}else{
								jQuery('#slidelist').html("<div align=\"center\"><p>无切片上传</p></div>");
							}
						},
						error: function(xhr, type, errorThrown) {
							if(type == 'timeout') {
								mui.toast("网络不给力，请重新操作！");
							}
						}
					});
				}
			}
			 
			//加载病例
			function LoadCase(ConsultID) {
				var userInfo = localStorage.getItem("userInfo");
				var user = userInfo ? window.eval("(" + userInfo + ")") : "";
				jQuery.ajax(resturl + 'Case', {
					data: {
						ConsultID: ConsultID,
						UserID:user.userid
					},
					dataType: 'json', //服务器返回json格式数据
					type: 'get', //HTTP请求类型
					timeout: 10000, //超时时间设置为10秒；
					cache: false,
					success: function(data) {
						data = eval(data);

						if(data.length > 0) {
							_CaseNo = data[0].Case_No;
							jQuery("#sp_info").html(data[0].Name + " " + data[0].Sex + " " + data[0].Age);
							jQuery("#sp_caseno").html(data[0].Case_No);
							jQuery("#sp_z_Marriage").html(data[0].z_Marriage);
							jQuery("#sp_SendHos").html(data[0].SendHos);
							jQuery("#sp_Clinical_Data").html(data[0].Clinical_Data);
							jQuery("#sp_z_Digagnosis").html(data[0].z_Digagnosis);
							
							var Gennerally_See=data[0].Gennerally_See//大体所见
							if(Gennerally_See==""){
								Gennerally_See="无";
							}
							jQuery("#sp_Gennerally_See").html(Gennerally_See);
							
							var Immune_Group=data[0].Immune_Group//免疫组化
							if(Immune_Group==""){
								Immune_Group="无";
							}
							jQuery("#sp_Immune_Group").html(Immune_Group);
							
							var Early_Digagnosis=data[0].Early_Digagnosis//原病理诊断
							if(Early_Digagnosis==""){
								Early_Digagnosis="无";
							}
							jQuery("#sp_Early_Digagnosis").html(Early_Digagnosis);
							
							jQuery("#caseloading").css("display", "none");
							jQuery("#divcase").css("display", "");
							jQuery("#sp_slidecount").html(data[0].slidecount);
							jQuery("#sp_annexcount").html(data[0].annexcount);
							jQuery("#txt_z_Mirror").val(data[0].z_Mirror);
							if(getQueryString2("ConsultStatusID")==1){
								jQuery("#txt_Diagnosis").val(data[0].DraftDiagnosis);
							    jQuery("#txt_remark").val(data[0].DraftDiagnosis_Remark);
							
							}
							else if(getQueryString2("ConsultStatusID")==4||getQueryString2("ConsultStatusID")==2){
								jQuery("#txt_fh_text").val(data[0].Diagnosis);
								jQuery("#txt_Diagnosis").val(data[0].Diagnosis);
							    jQuery("#txt_remark").val(data[0].Diagnosis_Remark);
							}

							jQuery("#p_return").html(data[0].RecheckReturn);
							jQuery("#sp_Received_Date").html(data[0].Received_Date);
							jQuery("#sp_MaterialParts").html(data[0].MaterialParts);
							jQuery("#sp_z_Digagnosis").html(data[0].z_Digagnosis);
							jQuery("#txt_sy_bz").val(data[0].InviteReason);
							jQuery("#txt_sy_zd").val(data[0].DiagnosisReason);
							var Remark=data[0].Remark//原病理诊断
							if(Remark==""){
								Remark="无";
							}
							jQuery("#sp_Remark").html(Remark);
							_IsCollect=data[0].IsCollect;
							if(_IsCollect==null)
							{
								_IsCollect=0;
							}
							

							if(_IsCollect==0)
							{
								jQuery("#btncollection").removeClass("mui-icon-star-filled")
								jQuery("#btncollection").addClass("mui-icon-star")
							 
							}
							else
							{
						    	jQuery("#btncollection").removeClass("mui-icon-star")
								jQuery("#btncollection").addClass("mui-icon-star-filled")
							}
							
						}

					},
					error: function(xhr, type, errorThrown) {
						if(type == 'timeout') {
							_error = new Error(jQuery('body'), '网络不给力呀亲...');
							_error.show();
						}
					}
				});

			}
			
			
			//加载权限隐藏
			function LoadControl() {
				var ConsultStatusID = getQueryString2("ConsultStatusID");
				var IsRecheck = getQueryString2("IsRecheck");
				var type = getQueryString2("type");
				 	jQuery("#div_zd").css("display", "");
		           	jQuery("#div_sy").css("display", "none");
		           	jQuery("#div_fh").css("display", "none");
		           	
				if(ConsultStatusID == "1") //待诊断
				{ 
					jQuery("#statustitle").html("待诊断");
					jQuery("#div_tool").css("display", "");
					jQuery("#div_tool2").css("display", "none");
					if(type=="99"){
						jQuery("#statustitle").html("已收藏");
						jQuery("#div_tool").css("display", "none");
				     	jQuery("#div_tool2").css("display", "");
				     	jQuery("#sp_righthead").text("查看诊断");
				    	jQuery("#txt_Diagnosis").attr("readonly",true);
						jQuery("#txt_remark").attr("readonly",true);
						jQuery("#txt_z_Mirror").attr("readonly",true);
					}
				} 
				else if(ConsultStatusID == "-1"||ConsultStatusID == "-2") //已退回
				{ 
					jQuery("#statustitle").html("被退回");
					
				} 
				else if(ConsultStatusID == "-88"){
				jQuery("#statustitle").html("撤回");					
				}
				else if(ConsultStatusID == "0"){
				jQuery("#statustitle").html("草稿");	
				}
				else if(ConsultStatusID == "2") //复核中
				{
					if(IsRecheck == -1) {
						jQuery("#div_tool").css("display", "");
						jQuery("#div_tool2").css("display", "none");
						jQuery("#statustitle").html("<a href=\"#topPopover2\">复核退回<span class=\"mui-icon mui-icon-arrowdown\"></span></a>")
					} else {
						jQuery("#statustitle").html("复核中");
						jQuery("#div_tool").css("display", "none");
						jQuery("#div_tool2").css("display", "");
					}
				} 
				else if(ConsultStatusID == "4") //已诊断
				{
					jQuery("#statustitle").html("已诊断");
					if(type=="99"){
						jQuery("#statustitle").html("已收藏");
					}
					jQuery("#div_tool").css("display", "none");
					jQuery("#div_tool2").css("display", "");
					jQuery("#sp_righthead").text("查看诊断");
				    jQuery("#txt_Diagnosis").attr("readonly",true)
					jQuery("#txt_remark").attr("readonly",true)
					jQuery("#txt_z_Mirror").attr("readonly",true)
				}
				else if(ConsultStatusID == "200") //留言列表
				
				
				
				//受邀
				 if(type== "98") //待回复
				{
					var isinviteted=getQueryString2("isinviteted")
					jQuery("#div_tool").css("display", "none");
		           	
		           	jQuery("#div_zd").css("display", "none");
		           	jQuery("#div_sy").css("display", "");

					if(isinviteted=="0"){
						jQuery("#sp_righthead").text("回复");
						jQuery("#statustitle").html("待回复");
					}
					else if(isinviteted=="1"){
						jQuery("#sp_righthead").text("查看回复");
						jQuery("#statustitle").html("已回复");
						jQuery("#txt_sy_zd").attr("readonly","readonly");
						jQuery("#btn_InvitedAsk").css("display","none");
					}
					
				
				}
				//复核
				 if(type== "97") 
				{
					var IsRecheck=getQueryString2("IsRecheck")
					jQuery("#div_tool").css("display", "none");
		           	
		           	jQuery("#div_zd").css("display", "none");
		           	jQuery("#div_sy").css("display", "none");
		           	jQuery("#div_fh").css("display", "");
		           	
					if(IsRecheck=="0"){
						jQuery("#sp_righthead").text("复核");
						jQuery("#statustitle").html("待复核");
					}
					else if(IsRecheck=="1"){
						jQuery("#sp_righthead").text("查看");
						jQuery("#statustitle").html("已复核");
						jQuery("#div_fh_btn").css("display", "none");
					}
					else if(IsRecheck=="-1"){
						LoadReviewReturn();
						jQuery("#sp_righthead").text("查看");
						jQuery("#statustitle").html("复核退回");
						jQuery("#div_fh_btn").css("display", "none");
					}
				}

			}
			
			mui('.mui-scroll-wrapper').scroll({
				bounce: false,
				indicators: true, //是否显示滚动条
				deceleration: deceleration
			});
			
			window.addEventListener('touchmove', function(e) {
				var target = e.target;
				if(target && target.tagName === 'TEXTAREA') { //textarea阻止冒泡
					e.stopPropagation();
				}
			}, true);
			
			
			
			//病例Tab事件
//			console.log("123"+(event.detail.slideNumber == 0));
			document.querySelector(".mui-slider").addEventListener("slide", function(event) 
			{
				//病例
				if(event.detail.slideNumber == 0){
					jQuery("#footerid").css("display", "none");
					LoadSlide(_ConsultID);
				}
				
				//切片
				
				if(event.detail.slideNumber == 1) {
					jQuery("#footerid").css("display", "none");  					
					LoadSlide(_ConsultID);
					
				}
				//附件
				else if(event.detail.slideNumber == 2) {
					jQuery("#footerid").css("display", "none");					
					LoadAnnex(_ConsultID);
				}
				//留言
				else if(event.detail.slideNumber == 3) {
					
					var ConsultStatusID = getQueryString2("ConsultStatusID");
					var type = getQueryString2("type");
					
					
					if(ConsultStatusID==1&&type!="99"&&type!="98"){
						jQuery("#footerid").css("display", "");					
					}
					
					LoadMessage(_ConsultID, false);
					jQuery("#xsroll").css("z-index", -1);
				}
			});
			


			//预览报告
			function LookReport() {
				var jumpurl = "../report.html?ConsultID=" + _ConsultID +
					"&ConsultStatusID=" + getQueryString2("ConsultStatusID") +
					"&IsRecheck=" + getQueryString2('IsRecheck') +
					"&type=" + getQueryString2("type")
					var ipad=getQueryString2("ipad");
                	if(ipad == "0") {
						if(mui.os.plus) {
							console.log("infop2"+jump2);
							jump2(jumpurl, 'report.html', {
				
							});
						} else {
							window.location.href = jumpurl;
						}
				
					} else {
						console.log("infop"+URL);
						jump(jumpurl, 'report.html', {
				
						});
					}
			}
			
			
			//留言操作
			function sendmsg() {

				var userInfo = localStorage.getItem("userInfo");
				var user = userInfo ? window.eval("(" + userInfo + ")") : "";
				var messtext = jQuery("#msg-text").val();
			    messtext=messtext.replace(/(<br[^>]*>|  |\s*)/g,'');
				jQuery.ajax(resturl + 'AddMessage', {
					data: JSON.stringify({
						ConsultID: _ConsultID,
						Message: messtext,
						UserID: user.userid

					}),
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 10000, //超时时间设置为10秒；
					cache: false,
					success: function(data) {
						data = eval(data);
						if(data == "1") {
							var div = "";
							var selfclass = "msg-item-self";
						    var selfimg = "<img class=\"msg-user mui-icon \" style=\"width:37px;height:37px;margin:3px;\" src=\"../images/user-photo.png\" >"

							div = messagedata.join('').replace(/@message/, messtext)
								.replace(/@self/, selfclass)
								.replace(/@selfimg/, selfimg)

							jQuery("#msg-list").append(div);

							//mui('#scroll4').scroll().scrollToBottom();
							LoadMessage(_ConsultID, true);
							jQuery("#msg-text").val("");
						}
					},
					error: function(xhr, type, errorThrown) {
						if(type == 'timeout') {
							mui.toast("网络不给力，请重新操作！");

						}
					}
				});

			}
			
			
			var ui = {
				body: document.querySelector('body'),
				footer: document.querySelector('footer'),
				footerRight: document.querySelector('.footer-right'),
				footerLeft: document.querySelector('.footer-left'),
				btnMsgType: document.querySelector('#msg-type'),
				boxMsgText: document.querySelector('#msg-text'),
				boxMsgSound: document.querySelector('#msg-sound'),
				btnMsgImage: document.querySelector('#msg-image'),
				areaMsgList: document.querySelector('#msg-list'),
				boxSoundAlert: document.querySelector('#sound-alert'),
//				h: document.querySelector('#h'),
				content: document.querySelector('.mui-content2')
			};
			
//			ui.h.style.width = ui.boxMsgText.offsetWidth + 'px';
			
			var footerPadding = ui.footer.offsetHeight - ui.boxMsgText.offsetHeight;

			var focus = false;
			ui.boxMsgText.addEventListener('tap', function(event) {

				//jQuery("footer").css("bottom", "10px")
				ui.boxMsgText.focus();
				setTimeout(function() {
					ui.boxMsgText.focus();
				}, 0);
				focus = true;
				setTimeout(function() {
					focus = false;
				}, 1000);
				event.detail.gesture.preventDefault();

			}, false);

			//点击消息列表，关闭键盘
			ui.areaMsgList.addEventListener('tap', function(event) {
				if(!focus) {
					ui.boxMsgText.blur();
				}
			})

			jQuery('.mui-off-canvas-backdrop').bind('tap', function() {
				jQuery("#offCanvasHide").focus();
			});
			
			
			window.addEventListener('resize', function() {
				var xheight = jQuery("#msg-list").height();
				mui('#scroll4').scroll().scrollTo(0, -xheight, 100);
				mui('#scroll4').scroll().refresh();
				//ui.areaMsgList.scrollTop = ui.areaMsgList.scrollHeight + ui.areaMsgList.offsetHeight;
				if(isremark == true) {

					mui('#offCanvasSideScroll').scroll().scrollTo(0, -200, 0);
					document.getElementById("txt_remark").focus();
				}
			}, false);
			
			ui.footerRight.addEventListener('release', function(event) {
				if(jQuery("#msg-text").val() != "") {
					sendmsg();
				} else {
					mui.toast("发送内容不能为空!");
				}

			});
			
			//解决长按“发送”按钮，导致键盘关闭的问题；
			ui.footerRight.addEventListener('touchstart', function(event) {
				if(ui.btnMsgType.classList.contains('mui-icon-paperplane')) {
					if(jQuery("#msg-text").val() == "") {
						//jQuery("footer").css("bottom", "10px")
						msgTextFocus();
						event.preventDefault();
					}
				}
			});
			
			//解决长按“发送”按钮，导致键盘关闭的问题；
			ui.footerRight.addEventListener('touchmove', function(event) {
				if(ui.btnMsgType.classList.contains('mui-icon-paperplane')) {
					if(jQuery("#msg-text").val() == "") {
						//jQuery("footer").css("bottom", "10px")
						msgTextFocus();
						event.preventDefault();
					}
				}
			});

			function msgTextFocus() {
				ui.boxMsgText.focus();
				setTimeout(function() {
					ui.boxMsgText.focus();
				}, 150);
			}
			
			var isremark = false;
			document.getElementById("txt_remark").addEventListener('tap', function(event) {
				isremark = true;
				//event.preventDefault();

			})
			document.getElementById("txt_remark").addEventListener('blur', function(event) {
				isremark = false;
				//event.preventDefault();

			})
			
			mui.back = function() {
			
				if(navigator.userAgent.indexOf("Html5Plus") < 0) { //不支持5+ API
					var ipad=getQueryString2("ipad");
					var param='?type=' + getQueryString2("type")+"&invitedtype="+getQueryString2("invitedtype")+"&ipad="+getQueryString2("ipad");
					if(ipad=="0"){
						
						 window.location.href='ipad_index.html'+param;
					}
					else{
						 window.location.href='caselist_sub.html'+param;
					}
					
				
					
				} else { //支持5+ API
					
						plus.webview.close("caseinfo.html")
	//					plus.webview.getWebviewById("caselist").reload();							
						plus.webview.getWebviewById("caselist").evalJS("Number()");

				}
			};
			
			function isComplete() {
				var URL = "http://" + getQueryString2("DiagHisIp") + ":" + getQueryString2("DiagHisPort") + "";
				console.log("判定是否站点是否连接:" + URL);
				
				if (getQueryString2("DiagHisIp") != "localhost") {
					$.ajax({
						url: URL + "/API/Ver",
						type: "GET",
						dataType: "text",
						async: true,
						timeout: 1000,
						success: function (response) {
							// "1" 状态标识云切片
							SiteStatus = 1;
						},
						error: function (e) {
							// "0" 状态标识上传中
							SiteStatus = 0;
						},
						complete: function (XMLHttpRequest, status) { //请求完成后最终执行参数
							if (status == 'timeout') {//超时,status还有success,error等值的情况
								ajaxTimeoutTest.abort();				
								SiteStatus = 0;
							}
						}
					});
				} else {
					SiteStatus = 0;
				}
			}
			
			
			
	