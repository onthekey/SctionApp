			LoadCase();

			mui.init({
				swipeBack: true, //启用右滑关闭功能
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
			var deceleration = mui.os.ios ? 0.003 : 0.0009;
			mui('#scroll1').scroll({
				bounce: false,
				indicators: true, //是否显示滚动条
				deceleration: deceleration
			});
			mui.ready(function() {

			});
			var Returndata = [
				'<div class="mui-input-row mui-radio mui-left">',
				'<label>@DisplayName</label>',
				'<input name="expradio" type="radio" value="@UserID">',
				'</div>'
			]

			function LoadCase() {
				console.log("入口");
				var userInfo = localStorage.getItem("userInfo");
				var user = userInfo ? window.eval("(" + userInfo + ")") : "";
				jQuery.ajax(resturl + 'GainBookInfo', {
					data: {
						ConsultID: getQueryString2("ConsultID"),
					},
					dataType: 'json', //服务器返回json格式数据
					type: 'get', //HTTP请求类型
					timeout: 10000, //超时时间设置为10秒；
					cache: false,
					success: function(data) {
						jQuery("#caseloading").css("display", "none");
						jQuery("#divcase").css("display", "");
						var div = "";
						data = eval(data);
						if(data.length > 0) {
							jQuery("#sp_info").html(data[0].YuName + " " + data[0].YuSex + " " + data[0].YuAge);
							jQuery("#sp_HisName").html(data[0].HisName);
							jQuery("#sp_BookTime").html(data[0].BookTime);
							jQuery("#sp_OperationPart").html(data[0].OperationPart);
							jQuery("#sp_YuDoctor").html(data[0].YuDoctor);
							jQuery("#sp_YuPhone").html(data[0].YuPhone);
							jQuery("#txt_remark").html(data[0].ReturnReason)
							var bz = data[0].BookContent;
							if(bz == "") {
								bz = "无";
							}
							jQuery("#sp_bz").html(bz);
							var ConsultStatusID = getQueryString2("ConsultStatusID");
							if(ConsultStatusID == 99) {

							} else if(ConsultStatusID == 100) {
								jQuery("#txt_remark").attr("readonly", "readonly");
								jQuery("#div_tool").css("display", "none");
							} else if(ConsultStatusID == 101) {
								jQuery("#div_tool").css("display", "none");
								jQuery("#txt_remark").attr("readonly", "readonly");
							}
						}
					}
				});
			}