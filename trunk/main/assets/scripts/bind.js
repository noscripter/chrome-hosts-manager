/**
 * �¼���
 */
define(function(require, exports) {

	// ��ͼ�߼�
	var view = require('./handle/view.js');

	$('body')

	// �����
	.on('mouseenter mouseleave', '.group', function(evt) {
		$(this).parent()[evt.type == 'mouseenter' ? 'addClass' : 'removeClass']('hover');
	})

	// ������ʾ
	.on('mousemove mouseout', 'span[data-title]', function(evt) {
		view.showTip(evt);
	})

	// ��ť���
	.on('click', 'span[data-handle]', function(evt) {
		var target = $(evt.target);
		view[target.data('handle')](target);
	})

	// �����ڷǰ�ť����ĵ���󶨵����ð�ť��
	.on('click', '.node', function(evt) {
		!evt.target.getAttribute('data-handle') && view.check($(this).find('span[data-handle="check"]'));
	})

	// �༭ȡ��
	.on('click', '#mask', function(evt) {
		evt.target.id == 'mask' && view.olCancel();
	})

	/********** ����Ϊ�Զ����¼� **********/

	// "����/����"�¼�
	.on('checkon checkoff', '.node', function(evt) {
		$(this).find('span[data-handle="check"]').removeClass('checkon checkoff').addClass(evt.type);
	})

	// "ɾ��"�¼�
	.on('remove', '.node', function(evt) {
		var $this = $(this);
		if ($this.hasClass('group')) {
			$this.closest('.block').remove();
		} else {
			$this.remove();
		}
	})

	// �����Ҽ�
	.on('contextmenu', function() {
		return false;
	});

	// ������Ч
	$('#content').bind('scroll', function() {
		if (this.scrollHeight > this.clientHeight) { // ���ֹ�����
			view.scroll($(this));
		}
	});

});
