/**********************************************************************/
/**
 * 数据callback入口
 * 
 * 
 * 
 * 
 * 
 *
 *
 */

// status 状态为1, 4, -2等, 与UtilHelper中的状态备注相同
function setResult(resultId, consultId, status) {
	
	var data = JSON.stringify({
		id: consultId,
		status: status
	});
	
	console.log('returnCase:准备调用返回入口');
	
	var webViewId = mui.os.ipad ? indexContentId : TriageListId;
	plus.webview.getWebviewById(webViewId)
			.evalJS('onWebViewResult(' + null + ', "' + resultId + '", ' + data + ')');
}

function closeThis(consultId) {
	console.log('returnCase:returnCase 关闭入口');
	plus.webview.getWebviewById(DiagnosisDetailsId)
			.evalJS('closeThis("' + consultId + '")');
	
	plus.webview.close(ReturnCase);
}
