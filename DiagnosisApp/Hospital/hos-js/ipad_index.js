<script type="text/javascript">
		// 修改index页显示主题
		var centerName = localStorage.centerName;
		var title = centerName ? centerName : 'KFBIO病理远程会诊平台';
		document.getElementById("index-title").innerHTML = title;

		//启用双击监听
		mui.init({
			gestureConfig: {
				doubletap: true
			},
			subpages: [{
				url: 'caselist_sub.html?type=0&ipad=0',
				id: 'caselist',
				styles: {
					top: '0px',
					bottom: '0px',
					left: '255px',
					width: jQuery(window).width() - 255
				}

			}]
		});

		jQuery(".mm").on('tap', function() {
			//console.log("ipad index");

			jQuery(".mm").each(function() {
				var isclass = jQuery(this).hasClass("mui-btn-outlined");
				if(isclass == false) {
					jQuery(this).addClass("mui-btn-outlined");
				}
				var jumpurl = "";
			});
			jQuery(this).removeClass("mui-btn-outlined");
			var id = this.getAttribute('data-id');
			var ipad = "&ipad=0";
			var xname = "";
			if(id == "99") {
				jumpurl = 'book_sub.html?type=' + id;
				xname = "booklist";

			} else if(id == "95") { 
				jumpurl = 'setting.html?type=' + id;
				xname = "setting";

			} else if(id == "201") {
				jumpurl = 'statistics.html?type=' + id;
				xname = "statistics";
			} else if (id == "200") {
				jumpurl = 'message_case_main.html?type=' + id;
				xname = "msglist";				
			}
			else {
				jumpurl = 'caselist_sub.html?type=' + id;
				xname = "caselist";
			}
			
			if(mui.os.plus) {
				
				var array = plus.webview.all();
				if(array) {
					for(var i = 0, len = array.length; i < len; i++) {
						var id = array[i].id;
						//console.log(array[i].id);
						if(id != "HBuilder" && id != "index.html" && id != "caselist") {
							plus.webview.getWebviewById(id).close();
						}
					}
				}
				
				plus.webview.getWebviewById("caselist").loadURL(jumpurl + ipad);
				//plus.webview.getWebviewById("caselistsub").reload();

				// 修改页面跳转方式，
				// 原：通过网页的跳转实现页面的切换
				// 调整：通过添加webview跳转页面
				/*mui.openWindow({
					url: jumpurl + ipad,
					id: xname
				})*/

			} else {
			
				jQuery("#caselist").attr("src", jumpurl + ipad);
			}

		});

		getNumber();

		function fresh() {
			getNumber();
//			plus.webview.getWebviewById("caselist").evalJS("refresh()");
			plus.webview.getWebviewById('caselist').reload();
		}

		mui.ready(function() {

			LoadInfo();

		});

		function LoadInfo() {
			var userInfo = localStorage.getItem("userInfo");
			var user = userInfo ? window.eval("(" + userInfo + ")") : "";
			jQuery("#head-img").attr("src", coreurl + user.photo);
		
			jQuery("#sp_displayname").html("欢迎您," + user.name);
			//jQuery("#sp_displayname").html("这是一个测试名，需要被省略");
		}

		function getNumber() {
			console.log("左侧导航刷新");

			var userInfo = localStorage.getItem("userInfo");
			var user = userInfo ? window.eval("(" + userInfo + ")") : "";
			jQuery.ajax(resturl + "GetNumber", {
				data: {
					UserID: user.userid
				},
				dataType: 'json', //服务器返回json格式数据
				type: 'get', //HTTP请求类型
				timeout: 10000, //超时时间设置为10秒；
				success: function(ret) {
					ret = eval(ret);
					$("#sp_dzd").html(ret[0].num1);
					$("#sp_yzd").html(ret[0].num2);
					$("#sp_yy").html(ret[0].BookNum);
					$("#sp_th").html(ret[0].ReturnNum);
					$("#sp_sy").html(ret[0].InviteNumber);
					$("#sp_cc").html(ret[0].CollectNum);
					$("#sp_fh").html(ret[0].ReviewerNum);
				
				},
				error: function(xhr, type, errorThrown) {
					//超时处理
					if(type == 'timeout') {}
				}
			});
		}
	</script>