			mui.init({
				pullRefresh: {
					container: '#pullrefresh',
					down: {

						callback: pulldownRefresh
					},
					up: {

						contentrefresh: '正在加载...',
						callback: pullupRefresh,
						contentnomore: '没有更多留言消息'
					}
				}
			});

			var pageindex = 0;
			var totalCount = 0;
			var totalPageCount = 0;
			var code = [
				'<li class="mui-table-view-cell mui-media ">',
				'<a class="mui-navigate-right case"  data-id="@ConsultID" data-xExpid="@Expid" data-sid="@ConsultStatusID" data-checkid="@IsRecheck" data-invitetedid="@isinviteted" data-DiagHisIp="@DiagHisIp" data-DiagHisPort="@DiagHisPort" >',
				'<div class="mui-badge mui-badge-@xbadge" style="padding-top:6px;padding-bottom:6px;position: relative; left: 0px; top: 35px; margin-right: 5px ; font-size: 30px; float:left; " >@xstatus</div>',
				'<div class="mui-media-body" style="margin-top:8px;">',
				'<p class="mui-ellipsis" style="text-indent:0px;margin-bottom:10px;font-size:16px;">@caseinfo</p>',//病理号Case_No与姓名Name
				'<p class="mui-ellipsis" style="text-indent:0px;margin-bottom:10px;font-size:16px;">留言:@leaveMessage</p>',
				
				'</div>',
				'<div class="mui-badge mui-badge-warning" style="top:10px;margin-right: -35px; ">@tjdate</div>',
				'<div class="mui-btn mui-btn-success mui-btn-outlined" style="padding:0px;font-size:12px ;top: 75px;  margin-right: -25px; @xexpnameshow" >@expname</div>',
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

			//查询数据
			function selectData(_pageindex, isup) {
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
				jQuery.ajax(resturl + 'get_message_data', {
					data: {
						StarPage: StarPage,
						EndPage: EndPage,
						
						UserID: user.userid

					},
					dataType: 'json', //服务器返回json格式数据
					type: 'get', //HTTP请求类型
					timeout: 10000, //超时时间设置为10秒；
					cache: false,
					success: function(data) {
						data = eval(data);
						//如果是下拉
						if(!isup) {

							jQuery('#wrapper-data').html('');
						}
						var div = " ";
						if(data.length > 0) {

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
								//alert(statusvalue);
								
								var caseinfo = data[i].Case_No + "-" + data[i].Name; 
								div += code.join('').replace(/@xstatus/, xstatus)
								
									.replace(/@caseinfo/, caseinfo)
									.replace(/@ConsultID/, data[i].ConsultID)

									.replace(/@tjdate/, data[i].MessageTime.replace('T', ' '))
									
									.replace(/@expname/, data[i].DisplayName)
								    .replace(/@leaveMessage/,data[i].Message)
								    .replace(/@xbadge/, xbadge)
//								    .replace(/@name/,data[i].name)
								totalPageCount = data[i].pagecount;

							}

							//如果是下拉
							if(!isup) {

								jQuery('#pullrefresh .mui-table-view').html(div);

							} else {
								jQuery('#pullrefresh .mui-table-view').append(div);
							}                                                                                                                 

							mui('#pullrefresh .mui-table-view').on('tap', '.case', function() {
								var caseurl = 'message_details.html?ConsultID=' + this.getAttribute('data-id')
								var ipad = getQueryString2("ipad");
								if(ipad == "0") {

									if(mui.os.plus) {
										jump2(caseurl, 'message_details.html', {

										});
									} else {
										window.location.href = caseurl;
									}

								} else {

									jump(caseurl, 'message_details.html', {

									});
								}

							});

						} else {
							if(!isup) {

								jQuery('#pullrefresh .mui-table-view').html(" ");
								jQuery('#p_nomore').css("display", "");
							}
						}
						jQuery("#div_loading").css("diaplay", "none");
						if(!isup) {
							if(init == "0") {
								mui('#pullrefresh').pullRefresh().endPullupToRefresh();
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
							mui('#pullrefresh').pullRefresh().endPullupToRefresh(_pageindex * pagesize >= totalPageCount);
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

					//InitPage();
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

					//LoadSite();
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
		
				});
			}

			//mui('.mui-scroll-wrapper').scroll();
			mui('#consultStatuslist').on('tap', '.li_consult', function() {
				var consultID = this.getAttribute('data-id');

				jQuery('.mui-backdrop').removeClass('mui-active');
				$('#consulttitle').text(this.innerText);
				mui('#topPopover2').popover('');
                
                
				jQuery("#hidden_consultStatus").val(consultID);
				jQuery("#div_loading").css("display", "");
				selectData(0, 0);
			});
			mui('#caseStatuslist').on('tap', '.li_case', function() {
				var consultID = this.getAttribute('data-id');

				jQuery('.mui-backdrop').removeClass('mui-active');
				$('#casetitle').text(this.innerText);
				mui('#topPopover3').popover('hide');

				jQuery("#hidden_caseStatus").val(consultID);

			});



			//加载站点
			
			(function($) {
				$.init();
				var result = $('#result')[0];
				var btns = $('.btn');
				btns.each(function(i, btn) {
					btn.addEventListener('tap', function() {
						var optionsJson = this.getAttribute('data-options') || '{}';
						var options = JSON.parse(optionsJson);
						var id = this.getAttribute('id');
						/*
						 * 首次显示时实例化组件
						 * 示例为了简洁，将 options 放在了按钮的 dom 上
						 * 也可以直接通过代码声明 optinos 用于实例化 DtPicker
						 */
						var picker = new $.DtPicker(options);
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
						});
					}, false);
				});
			})(mui);

