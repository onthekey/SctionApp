		var title = null;

		console.log("caselist_main" + getQueryString2("type"));
		//启用双击监听
		mui.init({
			gestureConfig: {
				doubletap: true
			},
			subpages: [{
				url: 'caselist_sub.html?type=' + getQueryString2("type") + "&invitedtype=" + getQueryString2("invitedtype"),
				id: 'caselistsub',
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

		function show() {
			if(navigator.userAgent.indexOf("Html5Plus") < 0) { //不支持5+ API
				window.frames["caselistsub"].close();
			} else { //支持5+ API
				if(contentWebview == null) {
					contentWebview = plus.webview.currentWebview().children()[0];
				}
				contentWebview.evalJS("showdiag()");

			}
		}

		mui.back = function() {
			if(navigator.userAgent.indexOf("Html5Plus") < 0) { //不支持5+ API
				jump('index.html', 'index.html', {

				});
			} else { //支持5+ API				
		
				plus.webview.getWebviewById("index.html").evalJS("Number()");
				plus.webview.close("caselist");
			}
		};

		function changeHead(sum) {
			var text;
			if(title == null)
				title = jQuery("#headertitle").text();
			text = title;
			text += "(" + sum + ")";
			jQuery("#headertitle").text(text);
		}