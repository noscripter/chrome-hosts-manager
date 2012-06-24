/**
 * ��Ⱦ��
 */
define(function(require, exports, module) {

	// ������
	var util = require('../util/util.js'),

	/**
	 * ���췽��
	 * @param template ģ��id
	 */
	Render = function(template) {
		if (template) {
			this.template = document.getElementById(template).innerHTML;
		}
	};

	Render.prototype = {

		/**
		 * ��������Ⱦ��ģ��
		 * ���¼�����ʽ���������滻:
		 * {{:text}} �ӹ��ʻ��ļ��л�ȡtext
		 * {{a.b}} �൱��obj.a.b
		 * {{a.b?1:2}} �൱��obj.a.b?1:2
		 */
		render: function(obj, template) {
			return (template || this.template).replace(/\{\{([:\w\.\?]+)\}\}/g, function(str, p1) {
				if (p1.charAt(0) == ':') {
					return util.i18n(p1.substring(1));
				} else if (obj) {
					var i, j = obj, p = p1.split('?'), q = p[0].split('.');
					for (i = 0; i < q.length; i++) {
						if (q[i] in j) {
							j = j[q[i]];
						} else {
							return '';
						}
					}
					if (p[1]) {
						p = p[1].split(':');
						return j ? p[0] : p[1];
					}
					return j;
				} else {
					return '';
				}
			});
		}
	};

	module.exports = Render;

});
