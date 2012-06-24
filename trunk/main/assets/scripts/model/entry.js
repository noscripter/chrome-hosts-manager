/**
 * ���
 */
define(function(require, exports, module) {

	// ע�͵�����
	var regQute = /^#+\s*/,

	// ������
	util = require('../util/util.js'),

	/**
	 * ���췽��
	 */
	Entry = function(line) {
		this.addr = ''; // IP
		this.comment = ''; // ע��
		this.enable = false; // �Ƿ�����
		this.hostname = ''; // ����
		this.line = line; // hosts�ļ��ж�Ӧ����
		this.next = this; // ��һ����¼
		this.target = null; // ��Ӧ��DOM
		this.hide = false; // �Ƿ�����(ֻ������Ч)
		if (line && line.charAt(0) == '@') {
			this.hide = true;
			this.line = line.substring(1);
		}
	};

	Entry.prototype = {

		/**
		 * �ӵ�ǰ������һ����ʼ����, ���ر������Ľ�����
		 */
		traverse: function(callback) {
			var c = 0, p = this.next, q;
			while (p != this) {
				c++;
				q = p.next;
				if (callback && callback.call(p) === false) {
					return c;
				}
				p = q;
			}
			return c;
		},

		/**
		 * ��λ������
		 */
		findGroup: function() {
			var group = null;
			this.traverse(function() {
				if (!this.addr) {
					group = this;
					return false;
				}
			});
			return group;
		},

		/**
		 * ����Ŀ����
		 */
		setTarget: function(target) {
			if (target && (target instanceof $)) {
				this.target = target;
				target.data('target', this);
			}
		},

		/**
		 * ����Ƿ�����
		 */
		checkEnable: function() {
			var that = this;
			if (!this.addr) {
				this.enable = true;
				this.traverse(function() {
					if (!this.enable) {
						that.enable = false;
						return false;
					}
				});
			}
			return this.enable;
		},

		/**
		 * ����
		 */
		link: function(entry) {
			var p = entry;
			while (p.next != entry) {
				p = p.next;
			}
			p.next = this.next;
			this.next = entry;
		},

		/**
		 * �Ͽ�����
		 */
		delink: function() {
			var p;
			if (this.addr) { // ��
				this.traverse(function() {
					p = this;
				});
				if (p) { // ǰһ�����
					p.next = this.next;
				}
			} else { // ��
				this.traverse(function() {
					this.next = null;
					this.target = null;
				});
			}
			this.next = null;
			this.target = null;
		},

		/**
		 * ����
		 */
		analysis: function(line) {
			var regQute = /^#+/;
			line = $.trim(line);
			if (/^#*\s*[0-9A-Za-z:\.]+\s+[^#]+/.test(line)) {
				this.enable = !regQute.test(line); // �Ƿ�����
				if (!this.enable) {
					line = line.replace(regQute, '');
				}
				var index = line.indexOf('#');
				if (index != -1) {
					this.comment = $.trim(line.substring(index).replace(regQute, '')); // ע��
					line = $.trim(line.substring(0, index));
				}
				line = line.split(/\s+/);
				if (line.length > 1 && util.isValidIP(line[0])) { // �ǺϷ���IP��ַ
					this.addr = line[0];
					this.hostname = line[1];
					for (var i = 2; i < line.length; i++) { // һ��IP��Ӧ�������
						var entry = new Entry();
						entry.addr = this.addr;
						entry.comment = this.comment;
						entry.enable = this.enable;
						entry.hostname = line[i];
						this.link(entry);
					}
					return true;
				}
			}
			if (line instanceof Array) {
				line = line.join(' ');
			}
			this.line = $.trim(line.replace(regQute, ''));
			return false;
		},

		/**
		 * ��ԭΪ����
		 */
		toString: function() {
			var text = '';
			if (this.addr) { // ��
				text += (this.enable ? '' : '#') + this.addr + '\t' + this.hostname;
				text += (this.comment ? '\t# ' + this.comment : '') + '\n';
			} else { // ��(�������������)
				text += '\n# ' + (this.hide ? '@' : '') + this.line + '\n';
				this.traverse(function() {
					text += this.toString();
				});
			}
			return text;
		},

		/**
		 * ���������Ƶ�������
		 * @param array
		 */
		pushEnables: function(array) {
			if (this.addr) {
				if (this.enable) {
					array.push({
						addr: this.addr,
						hostname: this.hostname
					});
				}
			} else {
				this.traverse(function() {
					this.pushEnables(array);
				});
			}
		}
	};

	module.exports = Entry;

});
