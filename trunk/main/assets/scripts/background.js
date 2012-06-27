(function(embed, data) {

	// ����ģ��
	window.model = {

		/**
		 * �洢����
		 */
		put: function(key, value) {
			if (typeof value == 'string') {
				localStorage.setItem(key, value);
			} else {
				data[key] = value;
			}
		},

		/**
		 * ��ȡ����
		 */
		get: function(key) {
			return data[key] || localStorage.getItem(key);
		},

		/**
		 * ɾ������
		 */
		remove: function(key) {
			delete data[key];
			localStorage.removeItem(key);
		},

		/**
		 * ��ȡhosts�ļ�·��
		 */
		getHostsPath: function() {
			if (embed.getPlatform() == 'windows') {
				return embed.getSystemPath() + '\\drivers\\etc\\hosts';
			} else {
				return '/etc/hosts';
			}
		},

		/**
		 * �����ļ�
		 * @param file
		 * @param content
		 */
		saveFile: function(file, content) {
			embed.saveTextFile(file, content);
		},

		/**
		 * ��ȡ�ļ�
		 * @param file
		 */
		readFile: function(file) {
			return embed.getTextFile(file);
		}
	};

	// ���߼�
	window.util = {

		/**
		 * �ж��ļ��Ƿ����
		 */
		fileExists: function(file) {
			try {
				return embed.fileExists(file);
			} catch (e) {
				return false;
			}
		},

		/**
		 * �ж��ļ��Ƿ���Ŀ¼
		 */
		isDirectory: function(file) {
			try {
				return embed.isDirectory(file);
			} catch (e) {
				return false;
			}
		}
	};

	// ��ȡʵ�ʷ��ʵ�IP���뻺��
	chrome.webRequest.onCompleted.addListener(function(details) {
		data[details.tabId] = details.ip;
		chrome.browserAction.setTitle({
			title: details.ip,
			tabId: details.tabId
		});
	}, {
		urls: [ 'http://*/*', 'https://*/*' ],
		types: [ 'main_frame' ]
	});

	// �ر�tabʱ��������
	chrome.tabs.onRemoved.addListener(function(tabId) {
		delete data[tabId];
	});

})((function() {
	var embed = document.createElement('embed');
	embed.type = 'application/x-npapi-file-io';
	document.getElementsByTagName('body')[0].appendChild(embed);
	return embed;
})(), {});