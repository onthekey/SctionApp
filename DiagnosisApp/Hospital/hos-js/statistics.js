		mui.init({
			swipeBack: true //启用右滑关闭功能
     	});
	
		var statisticsdata = [
		      
			'<li class="mui-table-view-cell mui-scroll">',
			'<p style="margin-bottom:2px"><i class="mui-icon newiconfont icon-yisheng">&nbsp</i>@UserName</p>',
			'<p style="position: absolute;  right: 14px; top: 14px;">共@totalcount例</p>',
			'<div style="border-bottom:2px solid #efeff4 ; margin-bottom: 4px;"></div>',
			'<table style="width: 100%;">',
			'<tr>',
			'<td>',
			'<p style="text-align: center; color: #51c4d4; line-height: 20px;" >@num1例</p>',
			'<p style="text-align: center; color: #51c4d4; line-height: 20px;font-size: 12px">待诊断</p>',
			'</td>',
			'<td>',
			'<p style="text-align: center; color: #51c4d4; line-height: 20px;" >@num2例</p>',
			'<p style="text-align: center; color: #51c4d4; line-height: 20px;font-size: 12px">已诊断</p>',
			'</td>',
			'<td>',
			'<p style="text-align: center; color: #51c4d4; line-height: 20px;" >@num3例</p>',
			'<p style="text-align: center; color: #51c4d4; line-height: 20px;font-size: 12px;">退回</p>',
			'</td>',
			'</tr>',
			'</table>',

			'</li>'	
		]
		
		
		var sitemode = [
			'<li class="mui-table-view-cell lisiteid" data-id="@HisID">',
			'<a href="#">@sitename</a>',
			'</li>'
		]
		mui.ready(function() {
//			LoadSite();
			GetNumber();
			var ispad = getQueryString2("ipad");
			if(ispad == "1") {
				jQuery("#btnback").css("display", "none");
			}

		});

		function btnselectdata() {
			//mui('#pullrefresh').pullRefresh().pullupLoading();
			//pulldownRefresh();
			jQuery("#div_loading").css("diaplay", "");
			GetNumber();
			var offCanvasWrapper = mui('#offCanvasWrapper');
			offCanvasWrapper.offCanvas('close');
		}
		
		// 清除查询
		function clearselectdata() {
			jQuery("#txt_nameword").val("");
			jQuery("#txt_nameword").text("全部专家");
			jQuery("#hidden_siteid").val("");

			jQuery("#btn_starttime").val("");
			jQuery("#btn_starttime").text("请选择开始时间");

			jQuery("#btn_endtime").val("");
			jQuery("#btn_endtime").text("请选择结束时间");

			jQuery("#btn_dstarttime").val("");
			jQuery("#btn_dstarttime").text("请选择开始时间");

			jQuery("#btn_dendtime").val("");
			jQuery("#btn_dendtime").text("请选择结束时间");

			//jQuery("#div_loading").css("diaplay", "");
			GetCount();
			var offCanvasWrapper = mui('#offCanvasWrapper');
			//offCanvasWrapper.offCanvas('close');		
		}
		

		document.getElementById('offCanvasHide').addEventListener('tap', function() {
			var offCanvasWrapper = mui('#offCanvasWrapper');
			offCanvasWrapper.offCanvas('close');
		});

		function GetNumber() {
			var userInfo = localStorage.getItem("userInfo");
			var user = userInfo ? window.eval("(" + userInfo + ")") : "";
			jQuery.ajax(resturl + 'GetApplyStatisticsCount', {
				data: {
					ExpID: user.userid,
					sdate: jQuery("#btn_starttime").val(),
					edate: jQuery("#btn_endtime").val(),
					dsdate: jQuery("#btn_dstarttime").val(),
					dedate: jQuery("#btn_dendtime").val(),
					HisID: jQuery("#hidden_siteid").val(),
					nameword: jQuery("#txt_nameword").val(),
				},
				dataType: 'json', //服务器返回json格式数据
				type: 'get', //HTTP请求类型
				timeout: 10000, //超时时间设置为10秒；
				cache: false,
				success: function(data) {
					var div = "";
					data = eval(data);

					if(data.length > 0) {
						var tnum1 = 0;
						var tnum2 = 0;
						var tnum3 = 0;
						var tnum4 = 0;
						for(var i = 0; i < data.length; i++) {
							var total = Number(data[i].num1) + Number(data[i].num2) + Number(data[i].num3);
							div += statisticsdata.join('').replace(/@UserName/, data[i].UserName)
								.replace(/@num1/, data[i].num1)
								.replace(/@num2/, data[i].num2)
								.replace(/@num3/, data[i].num3)
								.replace(/@totalcount/, total)
							tnum1 += Number(data[i].num1);
							tnum2 += Number(data[i].num2);
							tnum3 += Number(data[i].num3);
							tnum4 += Number(data[i].num4);
						}
						jQuery("#AllNum1").html(tnum1 + "例");
						jQuery("#AllNum2").html(tnum2 + "例");
						jQuery("#AllNum3").html(tnum3 + "例");
						jQuery("#sp_numtotal").html(tnum1 + tnum2 + tnum3);
						jQuery("#sp_nummoney").html(tnum4);
						jQuery('#ultotallist').html(div);
					} else {
						jQuery("#AllNum1").html("0例");
						jQuery("#AllNum2").html("0例");
						jQuery("#AllNum3").html("0例");
						jQuery("#sp_numtotal").html(0);
						jQuery("#sp_nummoney").html(0);
						jQuery('#ultotallist').html("<div align=\"center\"><p>暂无历史记录</p></div>");
					}
				}
			});
		}

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
		
		mui('.mui-scroll-wrapper').scroll({
			scrollY: true, //是否竖向滚动
			indicators: false, //是否显示滚动条
   			deceleration:0.0006, //阻尼系数,系数越小滑动越灵敏
   			startX: 0, //初始化时滚动至x
            startY: 0, //初始化时滚动至y
            bounce: true //是否启用回弹
		});	

