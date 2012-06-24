/**
 * ҵ���߼�
 */
define(function(require, exports) {

	// ��̨ҳ����ģ��
	var model = require('../model/model.js'),

	/**
	 * ���õ������е�����, ���ؽ��ý�㼯��(ָ��group��entry�ĳ���)
	 */
	disableAll = function(hostnames, group, entry) {
		var data = exports.loadData(),
		disables = $(), did, i;
		for (i in data) {
			if (data[i] != group) {
				did = false;
				data[i].traverse(function() {
					if (this != entry && this.enable && hostnames[this.hostname]) {
						this.enable = false;
						disables = disables.add(this.target);
						did = true;
					}
				});
				if (did) {
					data[i].enable = false;
					disables = disables.add(data[i].target);
				}
			}
		}
		hostnames = group = entry = data = null;
		return disables;
	};

	/**
	 * �л�������״̬
	 */
	exports.checkGroup = function(node, callback) {
		var entry = node.data('target');
		if (entry.enable) { // ���õ����л�Ϊ����
			entry.traverse(function() {
				if (this.enable) {
					this.enable = false;
					node = node.add(this.target);
				}
			});
			entry.enable = false;
			callback(null, node);
			entry = node = null;
		} else { // ���õ����л�Ϊ����
			var hostnames = {},
			duplicate = false,
			disables = null,
			enables = entry.target;
			entry.traverse(function() { // Ѱ�������Ƿ����ظ�hostname
				if (hostnames[this.hostname]) {
					duplicate = true;
					return false;
				} else {
					hostnames[this.hostname] = true;
				}
			});
			if (duplicate) {
				throw 1;
			}
			disables = disableAll(hostnames, entry); // �����������ںͱ������ظ���hostname
			entry.traverse(function() {
				if (!this.enable) {
					this.enable = true;
					enables = enables.add(this.target);
				}
			});
			entry.enable = true;
			callback(enables, disables);
			entry = node = hostnames = disables = enables = null;
		}
	};

	/**
	 * �л�������״̬
	 */
	exports.checkLine = function(node, callback) {
		var entry = node.data('target'),
		group = entry.findGroup(),
		hostnames = {},
		enables = null;
		if (entry.enable) {
			entry.enable = false;
			group.enable = false;
			callback(null, entry.target.add(group.target));
		} else {
			hostnames[entry.hostname] = true;
			entry.enable = true;
			enables = group.checkEnable() ? group.target.add(entry.target) : entry.target;
			callback(enables, disableAll(hostnames, null, entry));
		}
	};

	/**
	 * ��������
	 */
	exports.loadData = function(noCache) {
		if (noCache || !model.get('data')) {
			return model.loadData();
		} else {
			return model.get('data');
		}
	};

	/**
	 * ��ȡ��Ҫ�༭�ı���
	 */
	exports.editFields = function(data) {
		var fields = [];
		if (data.addr) { // ��
			fields.push({
				label: '{{:olAddr}}',
				name: 'addr',
				value: data.addr,
				check: 'isValidIP'
			});
			fields.push({
				label: '{{:olHost}}',
				name: 'hostname',
				value: data.hostname,
				check: /^[\w\.\-]+$/
			});
			fields.push({
				label: '{{:olComment}}',
				name: 'comment',
				value: data.comment,
				check: /^[^#]*$/
			});
		} else { // ��
			fields.push({
				label: '{{:olGroup}}',
				name: 'line',
				value: data.line,
				check: /^[^@][^#]*$/
			});
		}
		return fields;
	};

	/**
	 * �����
	 */
	exports.addGroup = model.addGroup;

	/**
	 * ��������
	 */
	exports.saveData = model.saveData;

	/**
	 * ��ȡ�汾��
	 */
	exports.getVersion = model.getVersion;

	/**
	 * ��ȡhosts�ļ�·��
	 */
	exports.getHostsPath = model.getHostsPath;

	/**
	 * ����hosts�ļ�·��
	 */
	exports.setHostsPath = model.setHostsPath;

});