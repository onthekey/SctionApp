function onWebViewResult(requestCode, resultCode, data) {
	console.log('预约列表界面callback, resultCode: ' + resultCode);
	console.log('预约当前列表状态: ' + getParameter(statusKey));
	notifyDataChange(data);
	/*switch(resultCode) {
		case RESERVATION_COMPLETED: // 完成预约
			if(getParameter(statusKey) == 2) // 触发条件: 未分配界面
				notifyDataChange(data);
			break;
		case RESERVATION_RETURN: // 退回预约
			if(getParameter(statusKey) == 2) // 触发条件: 未分配界面
				notifyDataChange(data);
			break;
	}*/
}

function notifyDataChange(data) {

	console.log('notifyDataChange');

	setParameter(currentCountKey, 0);
	getDataList()

	if(mui.os.ipad)
		plus.webview.getWebviewById('index.html')
		.evalJS('onWebViewResult()');
}