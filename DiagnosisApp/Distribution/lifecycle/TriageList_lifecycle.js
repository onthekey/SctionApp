function onWebViewResult(requestCode, resultCode, data) {
	notifyDatachange(data);
}

function notifyDatachange(data) {

	console.log('TriageList: notifyDataChange');
	console.log('TriageList_lifecycle: data.status:' + data.status);
	if(data.status == getParameter(statusKey)) {
		// 状态匹配, 查询数据是否已经在list中
		
		if($("#consultId" + data.id).length > 0) {
			console.log('TriageList_lifecycle: add');
			setParameter(currentCountKey, 0);
			getDataList();
		} else {
			console.log('TriageList_lifecycle: add');
			setParameter(currentCountKey, 0);
			getDataList();
		}
	} else {
		console.log('TriageList_lifecycle: delete');
		setParameter(currentCountKey, 0);
		getDataList();
	}
	
	if (mui.os.ipad)
		plus.webview.getWebviewById('index.html')
			.evalJS('onWebViewResult()');
}