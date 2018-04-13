		//启用双击监听
		mui.init({
			gestureConfig: {
				doubletap: true
			},
			subpages: [{
				url: 'message_case_sub.html' ,
				id: 'message_case_sub',
				styles: {
					top: '45px',
					bottom: '0px',
				}
			}]
		});
		var contentWebview = null;
		jQuery('#div_head').on('tap', function() {
			if(mui.os.plus) {
				if(contentWebview == null) {
					contentWebview = plus.webview.currentWebview().children()[0];
				}
				contentWebview.evalJS("mui('#pullrefresh').pullRefresh().scrollTo(0,0,100)");
			}

		});

    
		//ipad隐藏退回按钮
		if(getQueryString2("ipad") == "1"){
			$(document).ready(function(){
     		$("a:has(span)").css("display","none");
     	});     
		};	
		
//		mui.back = function() {
//			if(navigator.userAgent.indexOf("Html5Plus") < 0) { //不支持5+ API
//				jump('index.html', 'index.html', {
//
//				});
//			} else { //支持5+ API
//				plus.webview.close("msglist")
//				plus.webview.getWebviewById("index.html").reload();
//			}
//		};

		mui.back = function() {
			if(navigator.userAgent.indexOf("Html5Plus") < 0) { //不支持5+ API
				jump('index.html', 'index.html', {
				});
			} else { //支持5+ API
				plus.webview.getWebviewById("index.html").evalJS("Number()");
				//关闭当前页
				plus.webview.close("msglist")
			}
		};
	