		var version = null;

		if(window.plus) {
			plusReady();
		} else {
			document.addEventListener("plusready", plusReady, false);
		}

		function plusReady() {
			// 获取本地应用资源版本号
			plus.runtime.getProperty(plus.runtime.appid, function(inf) {
				version = "v" + inf.version;
				console.log("获取版本号:" + version);
				document.getElementById("sp_ver").innerHTML = version;
			});
		}

		mui.init();
		//初始化单页view
		var viewApi = mui('#app').view({
			defaultPage: '#setting'
		});
		//初始化单页的区域滚动
		mui('.mui-scroll-wrapper').scroll();
		mui.ready(function() {

			LoadInfo();
			var ispad = getQueryString2("ipad");
			if(ispad == "1") {
				jQuery("#btnback").css("display", "none");
			}
		});
		var view = viewApi.view;
		(function($) {
			//处理view的后退与webview后退
			var oldBack = $.back;
			$.back = function() {
				if(viewApi.canBack()) { //如果view可以后退，则执行view的后退
					viewApi.back();
					jQuery("#password").val("");
					jQuery("#password1").val("");
				} else { //执行webview后退
					oldBack();
					jQuery("#password").val("");
					jQuery("#password1").val("");
				}
			};
			//监听页面切换事件方案1,通过view元素监听所有页面切换事件，目前提供pageBeforeShow|pageShow|pageBeforeBack|pageBack四种事件(before事件为动画开始前触发)
			//第一个参数为事件名称，第二个参数为事件回调，其中e.detail.page为当前页面的html对象
			view.addEventListener('pageBeforeShow', function(e) {
				//				console.log(e.detail.page.id + ' beforeShow');
			});
			view.addEventListener('pageShow', function(e) {
				//				console.log(e.detail.page.id + ' show');
			});
			view.addEventListener('pageBeforeBack', function(e) {
				//				console.log(e.detail.page.id + ' beforeBack');
			});
			view.addEventListener('pageBack', function(e) {
				//				console.log(e.detail.page.id + ' back');
			});
		})(mui);

		function LoadInfo() {
			var userInfo = localStorage.getItem("userInfo");
			var user = userInfo ? window.eval("(" + userInfo + ")") : "";

	//		console.log(localStorage.getItem("userInfo"));
			jQuery("#sp_account").html(user.account);
	//		jQuery("#head-img").attr("src", coreurl + user.photo);
	//		jQuery("#img_tag").attr("src", coreurl + user.Qm);
//			jQuery("#sp_tel").html(user.phone);
			//jQuery("#sp_displayname").html(user.name + "这是一个文本溢出样式的示例");
			jQuery("#sp_displayname").html(user.name);
			//jQuery("#sp_ver").html("v" + user.ver);

		}

		function loginout() {

			var btnArray = ['否', '是'];
			mui.confirm('确定退出系统吗？', '提示', btnArray, function(e) {
				if(e.index == 1) {

					if(mui.os.ios || mui.os.ipad || mui.os.iphone || mui.os.android) {
						// 获取所有Webview窗口
						var curr = plus.webview.currentWebview();

						var wvs = plus.webview.all();
						for(var i = 0, len = wvs.length; i < len; i++) {
							//关闭除setting页面外的其他页面
							if(wvs[i].getURL() == curr.getURL())
								continue;
							plus.webview.close(wvs[i]);
						}
						//打开login页面后再关闭setting页面
						
						plus.webview.open('../login.html');
						/*mui.openWindow({
							url: 'login.html',
							id: 'login.html',
							
						})*/
						curr.close();
					} else {
						plus.runtime.quit();
					}
					localStorage.clear();
				}
			})

		}

		function loginout1() {

			var btnArray = ['否', '是'];
			mui.confirm('确定退出系统吗？', '提示', btnArray, function(e) {
				if(e.index == 1) {

					localStorage.clear()
					if(navigator.userAgent.indexOf("Html5Plus") < 0) { //不支持5+ API
						jump("../login.html", 'HBuilder', {

						});
					} else { //支持5+ API

						plus.webview.getWebviewById("HBuilder").reload();
						plus.webview.close("index.html")
						mui.back();

					}

				}

			});
		}
		//密码修改
		document.getElementById("login").addEventListener("tap", function() {

			var _password = jQuery("#password").val();
			var _password1 = jQuery("#password1").val();

			if(!_password) {
				mui.toast("请输入旧密码!");
			} else if(!_password1) {
				mui.toast("请输入新密码!");
			} else if(_password == _password1) {
				mui.toast("新旧密码不能相同!");
			} else {
				var userInfo = localStorage.getItem("userInfo");
				var user = userInfo ? window.eval("(" + userInfo + ")") : "";
				console.log(resturl);
				jQuery.ajax(resturl + "ChangePassword", {
					data: {
						userid: user.userid,
						password: hex_md5(_password),
						password1: hex_md5(_password1)
					},
					dataType: 'json', //服务器返回json格式数据
					type: 'get', //HTTP请求类型
					timeout: 10000, //超时时间设置为10秒；
					success: function(ret) {
						ret = eval(ret);
						//ret= Number(ret) ;
						console.log(ret);
						if(ret==0) {
							mui.toast("旧密码不正确，修改失败！");
						} else {
							mui.toast("修改成功！");
							viewApi.back();
							jQuery("#password").val("");
							jQuery("#password1").val("");
						}
					},
					error: function(xhr, type, errorThrown) {
						//超时处理
						if(type == 'timeout') {

						}
					}
				});
			}
		});
