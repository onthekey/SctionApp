function showExpertList() {
	var offestBottom = $('#details_layout').css('height');
	var height = window.innerHeight 
			|| document.documentElement.clientHeight
			|| document.body.clientHeight;
	console.log('计算高度: ' + height);
	var actualHeight = height - parseInt($('header').css('height')) + 'px';
	console.log('actualHeight:' + actualHeight);
	$('#expertListlayout').css('height', actualHeight);
	$('#details_layout').animate({
		bottom: offestBottom,
		opacity: '0.4'
	}, 'slow');
	$('#expertListlayout').animate({
		top: $('header').css('height')
	}, 'fast', onAnimationFinish(true));
}

function hideExpert() {
	var offestTop = window.innerHeight ||
		document.documentElement.clientHeight ||
		document.body.clientHeight;
		
	$('#details_layout').animate({
		bottom: 0,
		opacity: '1'
	}, 'slow');
	$('#expertListlayout').animate({
		top: offestTop
	}, 'fast', onAnimationFinish(false));
}

var listener;

function setOnAnimationFinish(animationListener){
	listener = animationListener;
}

function onAnimationFinish(isShowExpertList) {
	if (listener != null)
		listener();
}

// 适配分配专家列表初始化, 将列表隐藏与底部
function setExpertListLayout() {

	console.log('brower window height: ' + window.innerHeight ||
		document.documentElement.clientHeight ||
		document.body.clientHeight);

	var offestTop = window.innerHeight ||
		document.documentElement.clientHeight ||
		document.body.clientHeight;

	$('#expertListlayout').css('top', offestTop);
}


