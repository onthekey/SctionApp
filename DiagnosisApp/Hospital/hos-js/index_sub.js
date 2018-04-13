			mui.init({
				pullRefresh: {
					container: '#pullrefresh',
					down: {
						callback: pulldownRefresh 
					}

				}
			});
			/**
			 * 下拉刷新具体业务实现
			 */
			function pulldownRefresh() {
				setTimeout(function() {

					Number();
		//			mui('#pullrefresh').pullRefresh().endPulldownToRefresh(); //refresh completed
				}, 1500);
			}
			var count = 0;
			
	
			
		if(mui.os.plus) {
				mui.plusReady(function() {
					setTimeout(function() {
						mui('#pullrefresh').pullRefresh().pulldownLoading();
					}, 1000);
					// 退出事件监听
					exit();
				});
			} else {
				mui.ready(function() {
					mui('#pullrefresh').pullRefresh().pulldownLoading();
					// 退出事件监听
					exit();
				});
			}
			
			//站点名称
			$(function() {
			var user = getUser();
			var centerName = user.centerName == null ? '申请医院' : user.centerName;
			console.log('Index_sub: CenterName = ' + centerName);
			$('#apply').text(centerName);
			})
			
			function getUser(){
				
				var userString = localStorage.getItem('userInfo');
				var user = userString ? window.eval('(' + userString + ')') : ''; 
		
				return user;
			}


			function windowLoad() {
				console.log("windowLoad");
				setTimeout(function() {
						mui('#pullrefresh').pullRefresh().pulldownLoading();
					}, 1000);
			}
			
		
			function Number() {
				var userInfo = localStorage.getItem("userInfo");
				var user = userInfo ? window.eval("(" + userInfo + ")") : "";
				console.log(resturl);
				jQuery.ajax(resturl + "GetNumber", {
				data:{
					UserID: user.userid
					},
					dataType: 'json', //服务器返回json格式数据
					type: 'get', //HTTP请求类型
					timeout: 10000, //超时时间设置为10秒；
					success: function(ret) {
					ret = eval(ret); 
//						ret =JSON.parse();
						$("#sp_dzd").html(ret[0].num1);	
						$("#sp_fh").html(ret[0].ReviewerNum);
						$("#sp_yzd").html(ret[0].num2);
						$("#sp_th").html(ret[0].ReturnNum);
						$("#sp_sy").html(ret[0].InviteNumber);
						$("#sp_yy").html(ret[0].BookNum);
						$("#sp_cc").html(ret[0].CollectNum);						
						console.log(ret[0].ReviewerNum);
						mui('#pullrefresh').pullRefresh().endPulldownToRefresh();
					},
					error: function(xhr, type, errorThrown) {
						//超时处理
						if(type == 'timeout') {}
					}
				});
			}
			//图片切换
			var slider = mui("#slider");
			slider.slider({
				interval: 3000
			});
			mui('#list').on('tap', '.indexclass', function() {
				var id = this.getAttribute('data-id');
				
			console.log("index sub" + id);	
			if(id == "201") {
					jump('statistics.html?type=' + id, 'statistics', {
					});					
				} 
				else if(id == "200") {				
					jump('message_case_main.html?type=' + id, 'msglist', {
					});					
				}
			else if(id == "99") {
					jump('book_main.html?type=' + id, 'booklist', {
					});
				}				
				else{
					jump('caselist_main.html?type=' + id, 'caselist', {
					});
				}
			});
			//标题栏上设置按钮
			mui('#list-install-btn').on('tap', '.indexclass', function() {
				var id = this.getAttribute('data-id');				
				if(id == "202") {
					jump('setting.html?type=' + id, 'setting', {
					});
				}
			});	
			
  
    
    //退出应用操作,无需返回login页面
			function exit() {
				var exitMark = false;
				mui.back = function () {
					if (!exitMark) {
						exitMark = true;
						mui.toast('再按一次退出应用');
						setTimeout(function() {
							exitMark = false;
						}, 2000);
					} else {
						plus.runtime.quit();
					}
				}
			}
		
