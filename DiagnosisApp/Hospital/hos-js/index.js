			mui.init({
				gestureConfig: {
					doubletap: true 
				},
				subpages: [{
					url: 'index_sub.html',
					id: 'index_sub',
					styles: {
						top: '46px',
						bottom: '0px',
					}
				}]
			});
	
			$(function() {
			var user = getUser();
			var centerName = user.centerName == null ? 'KFBIO病理远程会诊平台' : user.centerName;
			console.log('Index: CenterName = ' + centerName);
			$('#title').text(centerName);
			})

			function getUser() {

				// 初始化一个user对象用于获取需要的值
				var userString = localStorage.getItem('userInfo');
				var user = userString ? window.eval('(' + userString + ')') : '';

				return user;
			}