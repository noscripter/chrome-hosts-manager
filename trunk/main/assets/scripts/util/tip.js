/**
 * ������ʾ
 */
define(function(require, exports) {

	// body
	var body = $('body').css('min-width', '410px'),

	// title
	titleTip = $('#titleTip'),

	// ������Ϣ
	errorTip = $('#errorTip').removeClass('hidden'),

	// ������Ϣ
	infoTip = $('#infoTip').removeClass('hidden'),

	// ��ǰ��Ϣ
	currentTip = null,

	// ȷ�Ϻ�Ҫ����ִ�еķ���
	confirmFn = null,

	/**
	 * ��ʾtitle
	 */
	showTip = function() {
		var position = titleTip.data('position'),
		width = titleTip.outerWidth(),
		bodyWidth = body.innerWidth();
		position.top -= titleTip.height() + 16;
		position.left -= width / 2;
		if (position.top < 0) {
			position.top = 0;
		}
		if (position.left < 0) {
			position.left = 0;
		}
		if (position.left > bodyWidth - width) {
			position.left = bodyWidth - width;
		}
		titleTip.css(position).addClass('tip-show');
	};

	/**
	 * ��ʾ������Ϣ
	 */
	exports.showErrorTip = function(text) {
		if (currentTip != errorTip) { // �������е���ʾ��Ϣ
			exports.close();
			currentTip = errorTip;
		}
		clearTimeout(errorTip.data('timeout'));
		errorTip.children().eq(0).text(text);
		errorTip.css('left', (body.innerWidth() - errorTip.outerWidth()) / 2);
		errorTip.addClass('tip-show').data('timeout', setTimeout(exports.close, 8000));
	};

	/**
	 * ��ʾ��ʾ��Ϣ
	 */
	exports.showInfoTip = function(text, fn) {
		if (currentTip != errorTip) { // �д�����Ϣ��������ʾ��Ϣ
			currentTip = infoTip;
			confirmFn = fn;
			clearTimeout(infoTip.data('timeout'));
			infoTip.children().eq(0).text(text);
			infoTip.css('left', (body.innerWidth() - infoTip.outerWidth()) / 2);
			infoTip.addClass('tip-show').data('timeout', setTimeout(exports.close, 8000));
		}
	};

	/**
	 * ��ť������ʾ
	 */
	exports.showTip = function(evt) {
		var target = $(evt.target);
		clearTimeout(titleTip.data('timeout'));
		if (evt.type == 'mousemove') {
			titleTip.html(target.data('title')).data('position', {
				left: evt.clientX,
				top: evt.clientY
			}).removeClass('hidden');
			titleTip.data('timeout', setTimeout(showTip, 400));
		} else {
			titleTip.css('top', '-50px').addClass('hidden').removeClass('tip-show');
		}
	};

	/**
	 * ȷ����ʾ
	 */
	exports.confirm = function() {
		confirmFn && confirmFn();
		exports.close();
	};

	/**
	 * �ر���ʾ
	 */
	exports.close = function() {
		if (currentTip) {
			clearTimeout(currentTip.data('timeout'));
			currentTip.removeClass('tip-show');
			currentTip = null;
		}
	};
});