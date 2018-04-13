function onWebViewResult(requestCode, resultCode, data) {
	console.log('index: onWebViewResult');
	notifyDataChange();
}

function notifyDataChange(data) {
	
	console.log('index: notifyDataChange')
	getDistributionCount();
}