/**
 * ����ģ��
 */
define(function(require, exports) {

	// ��̨ҳ����ģ��
	var model = chrome.extension.getBackgroundPage().model,
	
	// ���߼�
	util = require('../util/util.js'),

	// ���
	Entry = require('./entry.js'),

	/**
	 * ʹ�ô����ñ��������Ч
	 */
	doProxy = function(array) {
		var script = '', i;
		for (i = 0; i < array.length; i++) {
			script += '}else if(host=="' + array[i].hostname + '"){';
			script += 'return "PROXY ' + array[i].addr + ':80; DIRECT";';
		}
		chrome.proxy.settings.set({
			value: {
				mode: "pac_script",
				pacScript: {
					data: 'function FindProxyForURL(url,host){if(shExpMatch(url,"http:*")){if(isPlainHostName(host)){return "DIRECT";' +
							script + '}else{return "DIRECT";}}else{return "DIRECT";}}'
				}
			},
			scope: 'regular'
		}, $.noop);
	},

	manifest = {};

	// ����manifest.json�ļ�
	$.ajax({
		async: false,
		dataType: 'json',
		success: function(data) {
			manifest = data;
		},
		url: '/manifest.json'
	});

	/**
	 * �洢����
	 */
	exports.put = model.put;

	/**
	 * ��ȡ����
	 */
	exports.get = model.get;

	/**
	 * ɾ������
	 */
	exports.remove = model.remove;

	/**
	 * �����
	 */
	exports.addGroup = function(groupData) {
		var data = model.get('data') || exports.loadData(),
		group = data[groupData.line] || new Entry(groupData.line),
		entry = new Entry();
		data[groupData.line] = group;
		group.enable = false;
		entry.enable = false;
		entry.comment = groupData.comment;
		entry.addr = groupData.addr;
		entry.hostname = groupData.hostname;
		group.link(entry);
	};

	/**
	 * ��hosts�ļ���������
	 */
	exports.loadData = function() {
		var file = exports.getHostsPath(),
		content = model.readFile(file),
		data = {},
		i, c, d, entry, group;
		if (content) {
			for (i = 0; i < content.length; i++) { // ɨ���utf8�ַ�
				c = content.charAt(i);
				if (c == '\ufffc' || c == '\ufffd') {
					data.error = 'unknownChar';
					break;
				}
			}
			content = content.split(/\r?\n/);
			for (i = 0; i < content.length; i++) {
				entry = new Entry();
				if (entry.analysis(content[i])) { // �ǺϷ���¼
					c = group || util.i18n('defaultGroup');
					d = c.charAt(0) == '@' ? c.substring(1) : c;
					data[d] = data[d] || new Entry(c);
					data[d].link(entry);
				} else { // ��ע�ͻ����
					group = entry.line;
				}
			}
			for (i in data) {
				if (i != 'error') {
					data[i].checkEnable();
				}
			}
		}
		model.put('data', data);
		return data;
	};

	/**
	 * �������ݵ�ָ���ļ�
	 */
	exports.saveData = function(file) {
		var data = model.get('data'),
		bm = chrome.benchmarking,
		array = [],
		content = '', i;
		if (bm) {
			for (i in data) {
				content += data[i].toString();
			}
			model.saveFile(file || exports.getHostsPath(), content);
			bm.clearCache();
			bm.clearHostResolverCache();
			bm.clearPredictorCache();
			bm.closeConnections();
		} else {
			for (i in data) {
				content += data[i].toString();
				data[i].pushEnables(array);
			}
			model.saveFile(file || exports.getHostsPath(), content);
			doProxy(array);
		}
	};

	/**
	 * ����hosts�ļ�·��
	 */
	exports.setHostsPath = function(path) {
		model.put('hostsPath', path);
	};

	/**
	 * ��ȡhosts�ļ�·��(�����ֶ����õ�ֵ,���Ĭ��ֵ)
	 */
	exports.getHostsPath = function() {
		return model.get('hostsPath') || model.getHostsPath();
	};

	/**
	 * ��ȡ�汾��
	 */
	exports.getVersion = function() {
		return manifest.version;
	};

});