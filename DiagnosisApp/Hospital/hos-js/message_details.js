			var messagedata = [
				'<div class="msg-item @self" >@selfimg',
				'<div class="msg-content">',
				'<div class="msg-content-inner">@message<br/>[@time]</div>',
				'<div class="msg-content-arrow"></div>',
				'</div>',
				'<div class="mui-itemLoadSite-clear"></div>',
				'</div>'
			]
			
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
				//LoadCase(ConsultID);
				//LoadControl();
				LoadMessage(ConsultID, true) ;
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
				h: document.querySelector('#h'),
				content: document.querySelector('.mui-content2')
			};
			
			ui.h.style.width = ui.boxMsgText.offsetWidth + 'px';
			
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
			
			
			mui.back = function() {
			
				if(navigator.userAgent.indexOf("Html5Plus") < 0) { //不支持5+ API
					var ipad=getQueryString2("ipad");
					var param='?type=' + getQueryString2("type")+"&invitedtype="+getQueryString2("invitedtype")+"&ipad="+getQueryString2("ipad");
					if(ipad=="1"){
						
						 window.location.href='message_case_main.html'+param;
					}
					else{
						 window.location.href='message_case_sub.html'+param;
					}
					
				
					
				} else { //支持5+ API
					
						plus.webview.close("message_details.html")
						plus.webview.getWebviewById("message").reload();
													
				}
			};
	