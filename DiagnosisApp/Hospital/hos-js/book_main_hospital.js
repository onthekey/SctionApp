	<!-- bug: book_sub.html无法被载入 -->
		<!-- bug原因: book_sub WebView容器与 book_sub WebView容器 ResourceID 重复, 再Android中同  -->
		<!-- 一个Activity下不能出现重复ResourceID(唯一性) -->
		<!-- bug修复: 修改book_sub WebView的ResrouceID,本页中的三处booklist_sub由booklist修改而成 -->
		
		var title = null;
		
		//启用双击监听
		mui.init({
			gestureConfig: {
				doubletap: true
			},
			subpages: [{
				url: 'book_sub.html?ipad=' + getQueryString2("ipad"),
				id: 'booklist_sub',
				styles: {
					top: '45px',
					bottom: '0px',
				}

			}]
		});
		var contentWebview = null;

		jQuery('#div_head').on('tap', function() {

			if(contentWebview == null) {
				contentWebview = plus.webview.currentWebview().children()[0];
			}
			contentWebview.evalJS("mui('#pullrefresh').pullRefresh().scrollTo(0,0,100)");

		});

		function show() {
			if(navigator.userAgent.indexOf("Html5Plus") < 0) { //不支持5+ API
				window.frames["booklist_sub"].close();
			} else { //支持5+ API
				if(contentWebview == null) {
					contentWebview = plus.webview.currentWebview().children()[0];
				}
				contentWebview.evalJS("close()");

			}
		}
		mui.back = function() {

			if(navigator.userAgent.indexOf("Html5Plus") < 0) { //不支持5+ API
				jump('index.html', 'index.html', {

				});
			} else { //支持5+ API
				plus.webview.getWebviewById("index.html").evalJS("Number()");
				//关闭当前页
				plus.webview.close("booklist")
			}
		};
		mui.ready(function() {
			
			var ispad=getQueryString2("ipad");
			if(ispad=="0")
			{
				jQuery("#back").css("display","none");
			}
		});
		
		function refresh() {
			console.log("返回刷新中");

			var contentWebview;
			if(navigator.userAgent.indexOf("Html5Plus") < 0) { //不支持5+ API
				//window.frames["index_sub.html"].close();
			} else { //支持5+ API
				if(contentWebview == null) {
					contentWebview = plus.webview.currentWebview().children()[0];
				}
				contentWebview.evalJS("refreshData()");

			}
		}
		
		function changeHead(sum) {
			var text;
			if(title == null)
				title = jQuery("#headertitle").text();
			text = title;
			text += "(" + sum + ")";
			jQuery("#headertitle").text(text);
		}