/**
 * �༭��
 */
define(function(require, exports) {

	// ��Ⱦ��
	var Render = require('../model/render.js'),

	// ������Ⱦ��
	olRender = new Render('olTemp'),
	
	// ������Ⱦ��
	fieldRender = new Render('fieldTemp'),

	// ���߼�
	util = require('../util/util.js'),

	// ����
	mask = $('#mask').hide(),

	// ����
	overlay = $('#overlay'),

	// ��ǰ�༭�еı���
	olFields = null;

	/**
	 * ��ʾ�༭��
	 * @param title ����
	 * @param fields Ҫ�༭�ı���
	 * @param save ���水ť�Ļص�����
	 */
	exports.show = function(title, fields, save) {
		var html = '';
		field = null,
		olFields = {},
		olSave = save;
		for (var i = 0; i < fields.length; i++) {
			field = olFields[fields[i].name] = {
				label: olRender.render(null, fields[i].label),
				check: fields[i].check
			};
			html += fieldRender.render({
				name: fields[i].name,
				label: field.label,
				value: fields[i].value
			});
		}
		overlay.html(olRender.render({
			title: title,
			fields: html
		}));
		mask.fadeIn();
	};

	/**
	 * ��������
	 */
	exports.save = function() {
		if (olSave) {
			var fieldError = false,
			data = {};
			overlay.find('input').each(function() {
				var value = $.trim(this.value),
				check = olFields[this.name].check;
				if (check) { // ��ҪУ��
					if (typeof check == 'string' ? util[check](value) : check.test(value)) {
						data[this.name] = value;
					} else {
						fieldError = olRender.render(null, olFields[this.name].label);
						return false;
					}
				} else { // ����ҪУ��
					data[this.name] = value;
				}
			});
			if (fieldError) {
				fieldError =  '[' + fieldError + ']' + util.i18n('fieldError');
			}
			olSave(fieldError, data);
		}
	};

	/**
	 * ���ر༭��
	 */
	exports.hide = function() {
		mask.fadeOut();
		olFields = olSave = null;
	};
});