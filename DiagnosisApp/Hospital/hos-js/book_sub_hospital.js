	mui.init({
				pullRefresh: {
					container: '#pullrefresh',
					down: {
						callback: pulldownRefresh
					},
					up: {
						contentrefresh: '正在加载...',
						callback: pullupRefresh,
						contentnomore: '没有更多会诊信息'
					}
				}
			});

			function InitPage() {
				if(getQueryString2("ipad") == "0") {
					jQuery("#div_head").css("display", "");
					//if(mui.os.plus){
					jQuery("#pullrefresh").css("margin-top", "44px");
					//}
				}
			}
			InitPage();

			var pageindex = 0;
			var totalCount = 0;
			var totalPageCount = 0;
			var code = [
				'<li class="mui-table-view-cell mui-media ">',
				'<a class="mui-navigate-right case"  data-id="@ConsultID" data-Statusid="@ConsultStatusID">',
				'<div class="mui-badge mui-badge-warning" style="padding-top:6px;padding-bottom:6px;position: relative; left: 0px; top: 50px; margin-right: 5px ; font-size: 30px; float:left; " >冰</div>',
				'<div class="mui-media-body" style="margin-top:8px;">',
				'<p class="mui-ellipsis" style=\"text-indent:0px;\">@caseinfo</p>',
				'<p class="mui-ellipsis" style=\"text-indent:0px;\">部位：@OperationPart</p>',
				'<p class="mui-ellipsis" style=\"text-indent:0px;\">时间：@BookTime</p>',
				'<p class="mui-ellipsis" style=\"text-indent:0px\">来自@HisName</p>',
				'</div>',

				'<div class="mui-badge mui-badge-warning" style="top:10px;margin-right: -35px; ">@ConsultTime</div>',
				'<div class="mui-badge mui-badge-warning" style="top: 95px; margin-right: -25px;" >@xxstatus</div>',

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
				
				
				// ipad端左侧导航刷新
				if(mui.os.ipad) {
					//plus.webview.getWebviewById("index.html").evalJS("fresh()");
				}
				
				
				//向缓冲区中放入数据
				jQuery("#hidden_startTime").val(jQuery("#btn_starttime").val());
				jQuery("#hidden_endTime").val(jQuery("#btn_endtime").val());
				jQuery("#hidden_keyword").val(jQuery("#txt_keyword").val());
				
				
				jQuery('#p_nomore').css("display", "none");
				var userInfo = localStorage.getItem("userInfo");
				var user = userInfo ? window.eval("( " + userInfo + ")") : " ";

				//下拉是重置页码
				if(!isup) {
					pageindex = 0;
				}

				var StarPage = _pageindex * pagesize + 1;
				var EndPage = (_pageindex + 1) * pagesize;
				//alert(resturl);
				jQuery.ajax(resturl + 'getBook', {
					data: {
						StarPage: StarPage,
						EndPage: EndPage,
						HisID: jQuery("#hidden_siteid").val(),
						UserID: user.userid,
						ConsultStatusID: jQuery("#hidden_consultStatus").val(),
						keyword: jQuery("#txt_keyword").val(),
						sdate: jQuery("#btn_starttime").val(),
						edate: jQuery("#btn_endtime").val()

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

						//console.log(data[0].pagecount);

							if(isInitialize)
								isInitialize = !isInitialize;
							// 添加一个标题修改操作
							if(!mui.os.ipad) {
								plus.webview.getWebviewById("booklist").evalJS("changeHead(" + data[0].pagecount + ")");
							} else {
								changeTitle(data[0].pagecount);
							}


							for(var i = 0; i < data.length; i++) {
								var status = "预约中";
								var ConsultStatusID = data[i].ConsultStatusID
								if(ConsultStatusID == "100")
									status = "预约成功";
								else if(ConsultStatusID == "101")
									status = "退回";
								var caseinfo = data[i].YuName + "- " + data[i].YuSex + "- " + data[i].YuAge
								div += code.join('')
									.replace(/@xxstatus/, status)
									.replace(/@OperationPart/, data[i].OperationPart)
									.replace(/@BookTime/, data[i].BookTime)
									.replace(/@HisName/, data[i].HisName)
									.replace(/@caseinfo/, caseinfo)
									.replace(/@ConsultTime/, data[i].ConsultTime.replace('T', ' '))
									.replace(/@ConsultID/, data[i].ConsultID)
									.replace(/@ConsultStatusID/, data[i].ConsultStatusID)

								totalPageCount = data[i].pagecount;
							}
							
							
					
						
							//如果是下拉
							if(!isup) {
								jQuery('#pullrefresh .mui-table-view').html(div);
							} else {
								jQuery('#pullrefresh .mui-table-view').append(div);
							}

							mui('#pullrefresh .mui-table-view').on('tap', '.case', function() {									
									var caseurl='book_info.html?ConsultID=' + this.getAttribute('data-id') +
									"&ConsultStatusID=" + this.getAttribute("data-Statusid")
									
									var ipad= getQueryString2("ipad");
								
									if(ipad=="0"){
										
										if(mui.os.plus){
											jump2(caseurl, 'bookinfo', {

				                          });
										}
										else{
											 window.location.href=caseurl;
										}
										
										
									}else{
										
										jump(caseurl, 'bookinfo', {

									   	});
									}

							});

						} 
						else {
							
								if(isInitialize) {
								// 初始化时不存在数据，显示为0
								var sum = 0;
								// 添加一个标题修改操作
								if(!mui.os.ipad) {
									plus.webview.getWebviewById("booklist").evalJS("changeHead(" + sum + ")");
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
										plus.webview.getWebviewById("booklist").evalJS("changeHead(" + sum + ")");
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
						
						
//						//页面传值  
//						if(data.length == 0){
//							console.log("传值"+data.length);
//							totalPageCount=0;}						
//							var parentWin =plus.webview.getWebviewById('booklist');  //向父页面传值
//          				parentWin.evalJS('setTitle("' + totalPageCount + '")');
//        					
          					
//        				//页面传值 
//
//						if(data.length == 0) {
//							console.log("传值" + data.length);
//							totalPageCount = 0;
//						}
//
//						if(getQueryString2("ipad") == "1") {
//							jQuery("#div_head").css("display", "");
//							//if(mui.os.plus){
//							jQuery("#pullrefresh").css("margin-top", "44px");
//							setTitle(totalPageCount);
//							//}
//						} else {
//							var parentWin = plus.webview.getWebviewById('booklist'); //向父页面传值
//							console.log('book_sub:getURL' + parentWin.getURL());
//							console.log(totalPageCount);
//							parentWin.evalJS('setTitle("' + totalPageCount + '")');
//						}
						
						
						jQuery("#div_loading").css("diaplay", "none");
						if(!isup) {
 						if(init=="0"){
                        	mui('#pullrefresh').pullRefresh().endPullupToRefresh();
                        	init=1;
                        }
                        else{
                        	//停止下拉动画
							mui('#pullrefresh').pullRefresh().endPulldownToRefresh();
							mui('#pullrefresh').pullRefresh().refresh(true);
                        }
						} else {

							//停止上拉动画
							mui('#pullrefresh').pullRefresh().endPullupToRefresh(_pageindex * pagesize >= totalPageCount);
							mui('#pullrefresh').pullRefresh().refresh(true);
						}
					},
					error: function(xhr, type, errorThrown) {
						if(!isup) {
							//停止下拉动画
							mui('#pullrefresh').pullRefresh().endPulldownToRefresh();
						} else {
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
					mui('#pullrefresh').pullRefresh().endPulldownToRefresh(); //refresh completed
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
			
			if(mui.os.plus&&getQueryString2("ipad")!="0") {
				mui.plusReady(function() {
					setTimeout(function() {
						mui('#pullrefresh').pullRefresh().pullupLoading();
					}, 1000);

					LoadSite();
				});
			} else {
			
				mui.ready(function() {

					mui('#pullrefresh').pullRefresh().pullupLoading();

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

			function btnselectdata() {
				jQuery("#div_loading").css("diaplay", "");
				selectData(0, 0);
				mui("#popover3").popover("toggle");
			}


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

				/*jQuery("#showUserPicker").val("");
				jQuery("#showUserPicker").text("全部类型");
				jQuery("#hidden_caseStatus").val("");*/

				//jQuery("#div_loading").css("diaplay", "");
				selectData(0, 0);
				//mui("#popover3").popover("toggle");
			}

			//加载站点
			function LoadSite() {
				var userInfo = localStorage.getItem("userInfo");
				var user = userInfo ? window.eval("( " + userInfo + ") ") : " ";

				jQuery.ajax(resturl + 'GetSiteByExp', {
					data: {
						UserID: user.userid
					},
					dataType: 'json', //服务器返回json格式数据
					type: 'get', //HTTP请求类型
					timeout: 10000, //超时时间设置为10秒；
					cache: false,
					success: function(data) {
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
//						
								mui('#topPopover').popover('hide');

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
			function close(){
				//var offCanvasWrapper = mui('#offCanvasWrapper');
				//offCanvasWrapper.offCanvas('close');
				mui("#popover3").popover("toggle");
				
			}
        
        	function showdiag() {
				mui('#popover3').popover("toggle");
			}

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
				});
			});

			/** 
			 * 滑动禁止开关代码模块:开始
			 */
			// 禁止滑动数据加载开关
			//var cancelToggle = false;

			/*function pullRefreshToggle(cancelToggle) {
				// 取反设置切换滑动操作的开关
				// cancelToggle = !cancelToggle;
				mui('#pullrefresh').pullRefresh().setStopped(cancelToggle);
			}*/

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

		

			function refreshData() {
				console.log("内容刷新中");
				selectData(0, 0);
			}

			function changeTitle(sum) {
				var text;
				var title ;
				if(title == null)
					title = jQuery("#headertitle").text();
					
				
				text =" 预约列表 (" + sum + ")";
				jQuery("#headertitle").text(text);
			}
