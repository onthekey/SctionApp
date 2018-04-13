		    var title = null;

			mui.init({
				pullRefresh: {
					container: '#pullrefresh',
					down: {

						callback: pulldownRefresh
					},
					up: {

						contentrefresh: '正在加载...',
						callback: pullupRefresh,
						contentnomore: '没有更多会诊'
					}
				}
			});

			function showdiag() {
				mui("#popover4").popover("toggle");
			}

			function InitPage() {

				if(getQueryString2("ipad") == "0") {
					jQuery("#div_head").css("display", "");
					//if(mui.os.plus){
					jQuery("#pullrefresh").css("margin-top", "44px");
					//}

				}
				
					jQuery("#hidden_consultStatus").val(getQueryString2("type"));

				//初始页面默认 全部站点 草稿、待诊断...

				//console.log("sub"+ getQueryString2("type"));

				if(getQueryString2("type") == 0) {
					jQuery("#consulttitle").text("草稿");
					jQuery("#tb_hz").css("display", "");
				}
				if(getQueryString2("type") == 1) {
					jQuery("#consulttitle").text("待诊断");
					jQuery("#tb_hz").css("display", "");
				}
				if(getQueryString2("type") == 4) {
					jQuery("#consulttitle").text("已诊断");
					jQuery("#tb_hz").css("display", "");
				}
				if(getQueryString2("type") == -1) {
					jQuery("#consulttitle").text("退回");
					jQuery("#tb_hz").css("display", "");
				}
				if(getQueryString2("type") == -88) {
					jQuery("#consulttitle").text("撤回");
					jQuery("#tb_hz").css("display", "");					
				}

			}
			// InitPage();

			var pageindex = 0;
			var totalCount = 0;
			var totalPageCount = 0;
			var code = [
				'<li class="mui-table-view-cell mui-media ">',
				'<a class="mui-navigate-right case"  data-id="@ConsultID" data-xExpid="@Expid" data-sid="@ConsultStatusID" data-checkid="@IsRecheck" data-invitetedid="@isinviteted" data-DiagHisIp="@DiagHisIp" data-DiagHisPort="@DiagHisPort" >',
				'<div class="mui-badge mui-badge-@xbadge" style="padding-top:6px;padding-bottom:6px;position: relative; left: 0px; top: 35px; margin-right: 5px ; font-size: 30px; float:left; " >@xstatus</div>',
				'<div class="mui-media-body" style="margin-top:8px;">',
				'<p class="mui-ellipsis" style=\"text-indent:0px;\">@caseinfo</p>',
				'<p class="mui-ellipsis" style=\"text-indent:0px;\">取材部位：@qcbw</p>',
				'<p class="mui-ellipsis" style=\"text-indent:0px\">来自@yy</p>',
				'</div>',
				'<div class="mui-btn mui-btn-royal mui-btn-outlined" style="font-size:12px ; padding:0px;top:10px;left:0px;width:40px;@xreviewtypeshow">@reviewtype</div>',
				'<div class="mui-btn mui-btn-royal mui-btn-outlined" style="font-size:12px ; padding:0px;top:10px;left:0px;width:40px;@xinvitetype">@invitetype</div>',
				'<div class="mui-badge mui-badge-warning" style="top:10px;margin-right: -35px; ">@tjdate</div>',
				//				'<div  class="mui-badge mui-badge-warning" style="top: 80px; margin-right: -25px;@show" >@xxstatus</div>',
				'<div class="mui-btn mui-btn-success mui-btn-outlined" style="padding:0px;font-size:12px ;top: 75px;  margin-right: 38px;@fromexpshow" >来自：@xfromexp</div>',
				//				'<div class="mui-btn mui-btn-success mui-btn-outlined" style="padding:0px;font-size:12px ;top: 75px;  margin-right: -25px; @xexpnameshow" >@expname</div>',
				'</a>',
				'</li>'
			];
			var sitemode = [
				'<li class="mui-table-view-cell lisiteid" data-id="@HisID">',
				'<a href="#">@sitename</a>',
				'</li>'
			]
			var _error = null;
			var wating = null;
			var pagesize = 10;
			var pageindex = 0;

			// 初始化标志
			var isInitialize = true;

			//查询数据
			function selectData(_pageindex, isup) {
				

				//console.log("查询数据中");

				//向缓冲区中放入数据
				jQuery("#hidden_startTime").val(jQuery("#btn_starttime").val());
				jQuery("#hidden_endTime").val(jQuery("#btn_endtime").val());
				jQuery("#hidden_keyword").val(jQuery("#txt_keyword").val());
				jQuery("#hidden_caseStatus").val(jQuery("#showUserPicker").val());

				jQuery('#p_nomore').css("display", "none");
				var userInfo = localStorage.getItem("userInfo");
				var user = userInfo ? window.eval("( " + userInfo + ") ") : " ";

				//下拉是重置页码
				if(!isup) {
					pageindex = 0;
					//jQuery('#wrapper-data').html('');
				}

				var StarPage = _pageindex * pagesize + 1;
				var EndPage = (_pageindex + 1) * pagesize;
				jQuery.ajax(resturl + 'getdata', {
					data: {
						StarPage: StarPage,
						EndPage: EndPage,
						HisID: jQuery("#hidden_siteid").val(),
						ConsultStatusID: jQuery("#hidden_consultStatus").val(),
						UserID: user.userid,
						keyword: jQuery("#txt_keyword").val(),
						sdate: jQuery("#btn_starttime").val(),
						edate: jQuery("#btn_endtime").val(),
						casetype: jQuery("#hidden_caseStatus").val(),
						invitedtype: jQuery('input:radio[name="invitedradio"]:checked').val(),
						reviewtype: jQuery('input:radio[name="reviewradio"]:checked').val()

					},
					dataType: 'json', //服务器返回json格式数据
					type: 'get', //HTTP请求类型
					timeout: 10000, //超时时间设置为10秒；
					cache: false,
					success: function(data) {
						console.log(data);
						
	
						data = eval(data);

						console.log("查询返回");

						//如果是下拉
						if(!isup) {

							jQuery('#wrapper-data').html('');
						}
						var div = " ";
						if(data.length > 0) {

							if(isInitialize)
								isInitialize = !isInitialize;

							// 添加一个标题修改操作
							if(!mui.os.ipad) {
								plus.webview.getWebviewById("caselist").evalJS("changeHead(" + data[0].pagecount + ")");
							} else {
								changeTitle(data[0].pagecount);
							}

							for(var i = 0; i < data.length; i++) {
								var xstatus = " ";
								var xbadge = "warning";
								if(data[i].CaseTypeID == "1") {
									xstatus = "常 ";
									xbadge = "primary";
								} else if(data[i].CaseTypeID == "2") {
									xstatus = "细 ";
									xbadge = "success";
								} else if(data[i].CaseTypeID == "3") {
									xstatus = "冰 ";
									xbadge = "warning";
								}
								var statusvalue = " ";
								var showvalue = "display:none";
								var showfromexp = "display:none";
								if(jQuery("#hidden_consultStatus").val() == "98") {

									showfromexp = "";
								}
								if(data[i].ConsultStatusID == 1) {
									statusvalue = "待诊断 "
								} else if(data[i].ConsultStatusID == 4) {
									statusvalue = "已诊断 "
								} else if(data[i].ConsultStatusID == -1 || data[i].ConsultStatusID == -2) {
									statusvalue = "退回 "
								} else if(data[i].ConsultStatusID == 2) {
									statusvalue = "复核中 "
									if(data[i].IsRecheck == "-1") {
										statusvalue = "复核退回"
									}
								}
								if(jQuery("#hidden_consultStatus ").val() == 0 || data[i].ConsultStatusID == 2) {

									showvalue = " "
								}
								var showinvitetype = "未回复"
								var showinvitevalue = "0";
								var xshowinvitetype = "display:none";
								if(data[i].isInvite == null) {
									showinvitevalue = "1";
									showinvitetype = "已回复";
								}

								var isv = jQuery('input:radio[name="invitedradio"]:checked').val();
								if(jQuery("#hidden_consultStatus").val() == 98 && isv == 0) {

									xshowinvitetype = "";
								}
								var xexpnameshow = "display:none";
								var isreview = jQuery('input:radio[name="reviewradio"]:checked').val();
								var reviewtypeshow = "display:none";
								if(jQuery("#hidden_consultStatus").val() == 97) {
									showvalue = "display:none";
									xexpnameshow = "";
									if(isreview == "0") {
										reviewtypeshow = "";
									}
								}
								var reviewtype = "";
								if(data[i].IsRecheck == "1") {

									reviewtype = "已";
								} else if(data[i].IsRecheck == "0") {

									reviewtype = "未";
								} else if(data[i].IsRecheck == "-1") {

									reviewtype = "退";
								}
								var caseinfo = data[i].Case_No + "- " + data[i].Name + "- " + data[i].Sex + "- " + data[i].Age
								div += code.join('').replace(/@xstatus/, xstatus)
									.replace(/@show/, showvalue)
									.replace(/@xxstatus/, statusvalue)
									.replace(/@qcbw/, data[i].MaterialParts)
									.replace(/@yy/, data[i].SendHos)
									.replace(/@xbadge/, xbadge)
									.replace(/@caseinfo/, caseinfo)
									.replace(/@ConsultID/, data[i].ConsultID)
									.replace(/@IsRecheck/, data[i].IsRecheck)
									.replace(/@ConsultStatusID/, data[i].ConsultStatusID)
															
									.replace(/@tjdate/, data[i].ConsultTime.replace('T', ''))	
									.replace(/@xfromexp/, data[i].fromexp)
									.replace(/@fromexpshow/, showfromexp)
									.replace(/@invitetype/, showinvitetype)
									.replace(/@xinvitetype/, xshowinvitetype)
									.replace(/@isinviteted/, showinvitevalue)
									.replace(/@expname/, data[i].expname)
									.replace(/@xexpnameshow/, xexpnameshow)
									.replace(/@reviewtype/, reviewtype)
									.replace(/@xreviewtypeshow/, reviewtypeshow)
									.replace(/@Expid/, data[i].ExpId)
									.replace(/@DiagHisIp/, data[i].HisIp)
									.replace(/@DiagHisPort/, data[i].HisPort)
								totalPageCount = data[i].pagecount;
								 

							}

							//如果是下拉
							if(!isup) {

								jQuery('#pullrefresh .mui-table-view').html(div);

							} else {
								jQuery('#pullrefresh .mui-table-view').append(div);
							}

							mui('#pullrefresh .mui-table-view').on('tap', '.case', function() {
								var caseurl = 'caseinfo.html?ConsultID=' + this.getAttribute('data-id') +
									"&ConsultStatusID=" + this.getAttribute('data-sid') +
									"&IsRecheck=" + this.getAttribute('data-checkid') +
									"&invitedtype=" + jQuery('input:radio[name="invitedradio"]:checked').val() +
									"&isinviteted=" + this.getAttribute('data-invitetedid') +
									"&Expid=" + this.getAttribute('data-xExpid') +
									"&ipad=" + getQueryString2('ipad') +
									"&type=" + jQuery("#hidden_consultStatus").val() +
									"&DiagHisIp=" + this.getAttribute('data-DiagHisIp') +
									"&DiagHisPort=" + this.getAttribute('data-DiagHisPort');

								var ipad = getQueryString2("ipad");

								if(ipad == "0") {

									if(mui.os.plus) {
										jump2(caseurl, 'caseinfo.html', {

										});
									} else {
										window.location.href = caseurl;
									}

								} else {

									jump(caseurl, 'caseinfo.html', {

									});
								}

							});

						} else {

							if(isInitialize) {
								// 初始化时不存在数据，显示为0
								var sum = 0;
								// 添加一个标题修改操作
								if(!mui.os.ipad) {
									plus.webview.getWebviewById("caselist").evalJS("changeHead(" + sum + ")");
								} else {
									changeTitle(sum);
								}

								isInitialize = !isInitialize;
							} else {
								// 查看是否时上滑操作，if true, 即已经没有可以再次加载的数据但依然有数据显示
								// else false, 没有数据显示,设置显示case count为0
								if(!isup) {
									var sum = 0;
									if(!mui.os.ipad) {
										plus.webview.getWebviewById("caselist").evalJS("changeHead(" + sum + ")");
									} else {
										changeTitle(sum);
									}
								}
							}

							if(!isup) {

								jQuery('#pullrefresh .mui-table-view').html(" ");
								jQuery('#p_nomore').css("display", "");
							}
						}
						
						// iPad端刷新左侧导航
						var ipadM = getQueryString2("ipad");
						if (ipadM == "0") {
							plus.webview.getWebviewById("index.html").evalJS("getNumber()");
						}
						
						jQuery("#div_loading").css("diaplay", "none");
						if(!isup) {
							if(init == "0") {
								mui('#pullrefresh').pullRefresh().endPullupToRefresh();
								mui('#pullrefresh').pullRefresh().endPulldownToRefresh();
								init = 1;
							} else {
								//停止下拉动画
								mui('#pullrefresh').pullRefresh().endPulldownToRefresh();
								mui('#pullrefresh').pullRefresh().refresh(true);
							}

						} else {
							//pageindex=_pageindex-1;
							//停止上拉动画
							mui('#pullrefresh').pullRefresh().endPullupToRefresh(_pageindex * pagesize >= totalPageCount);
						}
					},
					error: function(xhr, type, errorThrown) {
						if(!isup) {
							//停止下拉动画

							mui('#pullrefresh').pullRefresh().endPulldownToRefresh();
							mui('#pullrefresh').pullRefresh().refresh(true);

						} else {
							// pageindex=_pageindex-1;
							//停止上拉动画
							mui('#pullrefresh').pullRefresh().endPullupToRefresh(!(_pageindex * pagesize >= totalPageCount));
						}
						if(wating) {
							wating.remove();
						}
						//超时处理
						if(type == 'timeout') {
							mui.toast("网络不给力，请重新操作！");
						}
					}
				});
			}
			/**
			 * 下拉刷新具体业务实现
			 */
			function pulldownRefresh() {
				setTimeout(function() {
					selectData(0, 0);
					//mui('#pullrefresh').pullRefresh().endPulldownToRefresh(); //refresh completed
					Number()
				}, 1500);
			}
			var init = 0;
			/**
			 * 上拉加载具体业务实现
			 */
			function pullupRefresh() {
				setTimeout(function() {
					if(init == 1) {
						pageindex = pageindex + 1;

						selectData(pageindex, 1);
					} else {
						selectData(0, 0);

					}

					//mui('#pullrefresh').pullRefresh().endPullupToRefresh(pageindex>=totalPageCount); //参数为true代表没有更多数据了。

				}, 1500);
			}
			if(mui.os.plus && getQueryString2("ipad") != "0") {

				mui.plusReady(function() {

					InitPage();
					//jQuery("#div_loading").css("diaplay", "");

					setTimeout(function() {
						mui('#pullrefresh').pullRefresh().pullupLoading();
					}, 1000);
					jQuery(".invitedclass").change(function() {

						jQuery("#div_loading").css("diaplay", "");
						selectData(0, 0);

					})
					jQuery(".reviewclass").change(function() {

						jQuery("#div_loading").css("diaplay", "");
						selectData(0, 0);

					})

					LoadSite();
				});
				if(getQueryString2("ipad") == "0") {
					InitPage();
					jQuery(".invitedclass").change(function() {

						jQuery("#div_loading").css("diaplay", "");
						selectData(0, 0);

					})
					jQuery(".reviewclass").change(function() {

						jQuery("#div_loading").css("diaplay", "");
						selectData(0, 0);

					})

				}
			} else {

				mui.ready(function() {
					InitPage();
					//jQuery("#div_loading").css("diaplay", "");
					//selectData(0, 0);
					mui('#pullrefresh').pullRefresh().pullupLoading();
					jQuery(".invitedclass").change(function() {

						jQuery("#div_loading").css("diaplay", "");
						selectData(0, 0);

					})
					jQuery(".reviewclass").change(function() {

						jQuery("#div_loading").css("diaplay", "");
						selectData(0, 0);

					})
					LoadSite();
				});
			}

			mui('#consultStatuslist').on('tap', '.li_consult', function() {
				var consultID = this.getAttribute('data-id');

				jQuery('.mui-backdrop').removeClass('mui-active');
				$('#consulttitle').text(this.innerText);
				mui('#topPopover2').popover('hide');

				jQuery("#hidden_consultStatus").val(consultID);
				jQuery("#div_loading").css("diaplay", "");
				selectData(0, 0);
			});
			mui('#caseStatuslist').on('tap', '.li_case', function() {
				var consultID = this.getAttribute('data-id');

				jQuery('.mui-backdrop').removeClass('mui-active');
				$('#casetitle').text(this.innerText);
				mui('#topPopover3').popover('hide');

				jQuery("#hidden_caseStatus").val(consultID);

			});

			function btnselectdata() {
				//mui('#pullrefresh').pullRefresh().pullupLoading();
				//pulldownRefresh();

				jQuery("#div_loading").css("diaplay", "");
				selectData(0, 0);
				mui("#popover4").popover("toggle");
				//var offCanvasWrapper = mui('#offCanvasWrapper');
				//offCanvasWrapper.offCanvas('close');
			}

			//加载站点
			function LoadSite() {
				var userInfo = localStorage.getItem("userInfo");
				var user = userInfo ? window.eval("( " + userInfo + ") ") : " ";

				//console.log("进入医院"+ user.userid);
				jQuery.ajax(resturl + 'GetSiteByExp', {
					data: {
						UserID: user.userid
					},
					dataType: 'json', //服务器返回json格式数据
					type: 'get', //HTTP请求类型
					timeout: 10000, //超时时间设置为10秒；
					cache: false,
					success: function(data) {

						//console.log("进入医院"+ user.userid);
						var div = " ";
						data = eval(data);

						if(data.length > 0) {

							div += sitemode.join('').replace(/@sitename/, "全部医院")
								.replace(/@HisID/, "0")

							for(var i = 0; i < data.length; i++) {

								div += sitemode.join('').replace(/@sitename/, data[i].HisName)
									.replace(/@HisID/, data[i].HisID)

							}
							jQuery("#sitelist").html(div);
							mui('#sitelist').on('tap', '.mui-table-view-cell', function() {
								var HisID = this.getAttribute('data-id');

								jQuery('.mui-backdrop').removeClass('mui-active');
				
								jQuery("#hidden_siteid").val(HisID);
								jQuery("#div_loading").css("diaplay", "");
								selectData(0, 0);
							});
						}

					},
					error: function(xhr, type, errorThrown) {
						if(type == 'timeout') {
							mui.toast("网络不给力，请重新操作！");
						}
					}
				});
			}

			if(!mui.os.android) {
				// 当在android运行激活scroll时无法滚动
				mui('#pullrefresh').scroll({});
			}
			mui('#hosList').scroll({});

			var picker;
			(function($) {
				$.init();
				var result = $('#result')[0];
				var btns = $('.btn');
				btns.each(function(i, btn) {
					btn.addEventListener('tap', function() {
						var optionsJson = this.getAttribute('data-options') || '{}';
						var options = JSON.parse(optionsJson);
						var id = this.getAttribute('id');

						if(!picker) {
							/*
							 * 首次显示时实例化组件
							 * 示例为了简洁，将 options 放在了按钮的 dom 上
							 * 也可以直接通过代码声明 optinos 用于实例化 DtPicker
							 */
							picker = new $.DtPicker(options);
							pickerShow();
						} else {
							pickerShow();
						}

						function pickerShow() {
							picker.show(function(rs) {
								/*
								 * rs.value 拼合后的 value
								 * rs.text 拼合后的 text
								 * rs.y 年，可以通过 rs.y.vaue 和 rs.y.text 获取值和文本
								 * rs.m 月，用法同年
								 * rs.d 日，用法同年
								 * rs.h 时，用法同年
								 * rs.i 分（minutes 的第二个字母），用法同年
								 */
								jQuery("#" + id).val(rs.text);
								jQuery("#" + id).text(rs.text);
								/* 
								 * 返回 false 可以阻止选择框的关闭
								 * return false;
								 */
								/*
								 * 释放组件资源，释放后将将不能再操作组件
								 * 通常情况下，不需要示放组件，new DtPicker(options) 后，可以一直使用。
								 * 当前示例，因为内容较多，如不进行资原释放，在某些设备上会较慢。
								 * 所以每次用完便立即调用 dispose 进行释放，下次用时再创建新实例。
								 */
								picker.dispose();
								picker = null;
							});
						}
					}, false);
				});
			})(mui);

			//清除筛选操作，清除所有相关的val与text
			function clearselectdata() {
				console.log("取消筛选");
				//初始化所有选项
				jQuery("#txt_keyword").val("");
				jQuery("#hidden_keyword").val("");

				jQuery("#btn_starttime").val("");
				jQuery("#btn_starttime").text("请选择开始时间");
				jQuery("#hidden_startTime").val("")

				jQuery("#btn_endtime").val("");
				jQuery("#btn_endtime").text("请选择结束时间");
				jQuery("#hidden_endTime").val("");

				jQuery("#showUserPicker").val("");
				jQuery("#showUserPicker").text("全部类型");
				jQuery("#hidden_caseStatus").val("");

				jQuery("#div_loading").css("diaplay", "");
				selectData(0, 0);
			}

			$(function() {
				// 数据缓冲区写回
				$(document).on('tap', '.mui-backdrop', function() {
					console.log("恢复缓冲区中的数据被触发");
					// 查询字符串
					if(jQuery("#hidden_keyword").val() != null && jQuery("#hidden_keyword").val() != "") {
						jQuery("#txt_keyword").val(jQuery("#hidden_keyword").val());
						jQuery("#txt_keyword").text(jQuery("#hidden_keyword").val());
					} else {
						jQuery("#txt_keyword").val("");
						jQuery("#txt_keyword").text("");
					}

					// 查询开始时间
					if(jQuery("#hidden_startTime").val() != null && jQuery("#hidden_startTime").val() != "") {
						jQuery("#btn_starttime").val(jQuery("#hidden_startTime").val());
						jQuery("#btn_starttime").text(jQuery("#hidden_startTime").val());
					} else {
						jQuery("#btn_starttime").val("");
						jQuery("#btn_starttime").text("请选择开始时间");
					}

					// 查询结束时间
					if(jQuery("#hidden_endTime").val() != null && jQuery("#hidden_endTime").val() != "") {
						jQuery("#btn_endtime").val(jQuery("#hidden_endTime").val());
						jQuery("#btn_endtime").text(jQuery("#hidden_endTime").val());
					} else {
						jQuery("#btn_endtime").val("");
						jQuery("#btn_endtime").text("请选择结束时间");
					}

					// 查询类型
					if(jQuery("#hidden_caseStatus").val() != null && jQuery("#hidden_caseStatus").val() != "") {
						jQuery("#showUserPicker").val(jQuery("#hidden_caseStatus").val());
						//console.log(jQuery("#hidden_caseStatus").val());
						switch(jQuery("#hidden_caseStatus").val()) {
							case "1":
								jQuery("#showUserPicker").text("常规");
								break;
							case "2":
								jQuery("#showUserPicker").text("细胞");
								break;
							case "3":
								jQuery("#showUserPicker").text("冰冻");
								break;
							default:
								jQuery("#showUserPicker").text("全部类型");
								break;
						}

					} else {
						jQuery("#showUserPicker").val("");
						jQuery("#showUserPicker").text("全部类型");
					}
				});
			});

			(function($, doc) {
				$.init();
				$.ready(function() {
					//普通示例
					var userPicker = new $.PopPicker();
					userPicker.setData([{
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
					var showUserPickerButton = doc.getElementById('showUserPicker');
					var userResult = doc.getElementById('userResult');
					showUserPickerButton.addEventListener('tap', function(event) {
						userPicker.show(function(items) {

							jQuery('#showUserPicker').text(items[0].text);
							jQuery('#showUserPicker').val(items[0].value);
							//jQuery("#hidden_caseStatus").val(items[0].value);
							//userResult.innerText = JSON.stringify(items[0]);
							//返回 false 可以阻止选择框的关闭
							//return false;
						});
					}, false);

				});
			})(mui, document);

			// Android刷新bug修复模块(在存在PopMenu时能够进行滑动的bug)
			var isActive = false;
			if(mui.os.android) {
				console.log("Android进入");
				// 监听mui-backdrop是否存在, if true, 设置滑动更新操作为禁止
				// 当 mui-backdrop 不存在时重新激活滑动操作
				setInterval(function() {
					if(jQuery(".mui-backdrop").hasClass("mui-active")) {
						if(!isActive) {
							mui('#pullrefresh').pullRefresh().setStopped(true);
							isActive = !isActive;
						}
					} else {
						if(isActive) {
							mui('#pullrefresh').pullRefresh().setStopped(false);
							isActive = !isActive;
						}

					}
				}, 100);
			}

			// 刷新回调函数，当其他也页面回退到该页面，刷新页面
			function refreshData() {
				console.log("内容刷新中");
				selectData(0, 0);
			}

			function changeTitle(sum) {
				var text;
				if(title == null)
					title = jQuery("#headertitle").text();
				text = title;
				text += "(" + sum + ")";
				jQuery("#headertitle").text(text);
			}

	