/**
 * ���߼�
 */
define(function(require, exports) {

	// ��̨ҳ���߼�
	var util = chrome.extension.getBackgroundPage().util,

	// �Ƿ��ǺϷ���IPv4��ַ
	isV4 = function(ip) {
		if (/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) {
			ip = ip.split('.');
			for (i = 0; i < ip.length; i++) {
				if (Number(ip[i]) > 255) {
					return false;
				}
			}
			return true;
		} else {
			return false;
		}
	};

	/**
	 * �Ƿ��ǺϷ���IP��ַ
	 */
	exports.isValidIP = function(ip) {
		var i, parts;
		if (isV4(ip)) { // IPv4
			return true;
		} else if (ip.indexOf(':') !== -1) { // IPv6 (http://zh.wikipedia.org/wiki/IPv6)
			parts = ip.split(':');
			if (ip.indexOf(':::') !== -1) {
				return false;
			} else if (ip.indexOf('::') !== -1) {
				if (!(ip.split('::').length === 2 || parts.length > 8)) {
					return false;
				}
			} else {
				if (parts.length !== 8) {
					return false;
				}
			}
			if (parts.length === 4 && isV4(parts[3])) {
				return parts[2] === 'ffff';
			} else {
				for (i = 0; i < parts.length; i++) {
					if (!/^[0-9A-Za-z]{0,4}$/.test(parts[i])) {
						return false;
					}
				}
				return !/(^:[^:])|([^:]:$)/g.test(ip);
			}
		} else {
			return false;
		}
	};

	/**
	 * ��URL���ҳ����ܵ�����
	 */
	exports.findHostname = function(url) {
		if (url) {
			url = url.split('/');
			for (var i = 2; i < url.length; i++) {
				if (url[i]) {
					return url[i];
				}
			}
		}
		return '';
	};

	/**
	 * �ļ��Ƿ����
	 */
	exports.fileExists = util.fileExists;

	/**
	 * ·���Ƿ���Ŀ¼
	 */
	exports.isDirectory = util.isDirectory;

	/**
	 * ��ȡ���ʻ��İ�
	 */
	exports.i18n = chrome.i18n.getMessage;

});