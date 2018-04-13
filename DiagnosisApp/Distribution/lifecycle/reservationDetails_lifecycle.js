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

function setResult(resultId, consultId) {
	
	var data = JSON.stringify({
		id: consultId
	});
	
	console.log('reservationDetails:准备调用返回入口');
	
	var webViewId = mui.os.ipad ? indexContentId : ReservationListId;
	plus.webview.getWebviewById(webViewId)
			.evalJS('onWebViewResult(' + null + ', "' + resultId + '", ' + data + ')');
}