/**
 * ��ʼ��ҳ��
 */
define(function(require, exports) {

	// ��ͼ�߼�
	var view = require('./handle/view.js');

	// ��Ⱦͷ
	view.renderHead();

	// ���¼�
	require('./bind.js');

	// ������ʽ
	require('../styles/common.css');
	require('../styles/icons.css');
	require('../styles/popup.css');
	
	// ˢ������
	view.refresh(false);

	// ��ʼ��ʱ��������ʾ��Ϣ
	view.initInfoTip();
});