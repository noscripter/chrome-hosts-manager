/**
 * ��ͼ�߼�
 */
define(function(require, exports) {

	// ҵ���߼�
	var biz = require('./biz.js'),
	
	// ���߼�
	util = require('../util/util.js'),
	
	// ������Ϣ
	tip = require('../util/tip.js'),

	// �༭��
	editor = require('../util/editor.js'),

	// ��Ⱦ��
	Render = require('../model/render.js'),

	// ������Ⱦ��
	groupRender = new Render('groupTemp'),

	// �н����Ⱦ��
	lineRender = new Render('lineTemp'),

	// ͷ��Ⱦ��
	headRender = new Render('headTemp'),

	// ���˷ǵ�ǰURL�ı��
	isCurrent = false,

	/**
	 * �����ļ�
	 */
	saveData = function(file) {
		try {
			biz.saveData(file);
			file && setTimeout(function() {
				tip.showInfoTip(util.i18n('saveSuccess'));
			}, 0);
			return true;
		} catch (e) {
			tip.showErrorTip(util.i18n('cantWriteFile'));
			return false;
		}
	},

	/**
	 * ��������/����
	 */
	batchCheck = function(enables, disables) {
		if (saveData()) {
			enables && enables.trigger('checkon');
			disables && disables.trigger('checkoff');
		}
	};

	/**
	 * �л�����/���ð�ť
	 */
	exports.check = function(target) {
		var node = target.closest('.node');
		if (node.hasClass('group')) {
			try {
				biz.checkGroup(node, batchCheck);
			} catch (e) {
				tip.showErrorTip(util.i18n('duplicates'));
			}
		} else {
			biz.checkLine(node, batchCheck);
		}
	};

	/**
	 * �����
	 */
	exports.addGroup = function(target, line) {
		var fields = biz.editFields({
			addr: '127.0.0.1',
			hostname: '',
			comment: ''
		});
		if (!line) { // ����
			fields = biz.editFields({
				line: line || util.i18n('newGroup')
			}).concat(fields);
		}
		editor.show(target.data('title'), fields, function(err, data) {
			if (err) { // ����У��
				tip.showErrorTip(err);
			} else {
				if (line) { // ��������������
					data.line = line;
				}
				biz.addGroup(data);
				saveData();
				setTimeout(function() {
					exports.refresh(false);
				}, 0);
				editor.hide();
			}
		});
	};

	/**
	 * �����
	 */
	exports.addLine = function(target) {
		var node = target.closest('.node'),
		line = node.data('target').line;
		exports.addGroup(target, line);
	};

	/**
	 * �༭��ť
	 */
	exports.edit = function(target) {
		var data = target.closest('.node').data('target'),
		fields = biz.editFields(data);
		editor.show(target.data('title'), fields, function(err, nData) {
			if (err) { // ����У��
				tip.showErrorTip(err);
			} else {
				var render = data.addr ? lineRender : groupRender,
				node = null;
				for (var i in nData) { // ��ֵ����
					data[i] = nData[i];
				}
				node = $(render.render(data));
				data.target.replaceWith(node);
				data.setTarget(node);
				saveData() && editor.hide();
			}
		});
	};

	/**
	 * ɾ����ť
	 */
	exports.remove = function(target) {
		tip.showInfoTip(target.data('title') + '?', function() {
			var data = target.closest('.node').data('target');
			if (!data.addr) {
				delete biz.loadData()[data.line];
			}
			data.delink();
			saveData();
			target.trigger('remove');
		});
	};

	/**
	 * չ��/������ť
	 */
	exports.expand = function(target) {
		if (!target.hasClass('lock')) {
			target.addClass('lock');
			var group = target.closest('.group'),
			collapse = target.hasClass('collapse');
			group.data('target').hide = collapse;
			if (saveData()) {
				if (collapse) { // �����Ѿ�չ����
					group.next().slideUp(function() {
						target.removeClass('collapse lock').addClass('expand');
					});
				} else { // չ���Ѿ�������
					group.next().slideDown(function() {
						target.removeClass('expand lock').addClass('collapse');
					});
				}
			}
		}
	};

	/**
	 * ���Ӱ�ť
	 */
	exports.link = function() {
		var val = $('#hostsPath').val();
		if (!val) {
			tip.showErrorTip(util.i18n('blankPath'));
		} else if (!util.fileExists(val)) {
			tip.showErrorTip(util.i18n('fileNotExist'));
		} else if (util.isDirectory(val)) {
			tip.showErrorTip(util.i18n('noDirectory'));
		} else {
			chrome.tabs.create({
				url : 'file:///' + val.replace(/\\/g, '/')
			});
		}
	};

	/**
	 * ��Ⱦͷ
	 */
	exports.renderHead = function() {
		$('#content').before(headRender.render({
			version: biz.getVersion(),
			hostsPath: biz.getHostsPath()
		}));
	};

	/**
	 * ˢ������
	 */
	exports.refresh = function(refresh) {
		var val = $('#hostsPath').val();
		if (!val) {
			tip.showErrorTip(util.i18n('blankPath'));
		} else if (!util.fileExists(val)) {
			tip.showErrorTip(util.i18n('fileNotExist'));
		} else if (util.isDirectory(val)) {
			tip.showErrorTip(util.i18n('noDirectory'));
		} else {
			try {
				biz.setHostsPath(val);
				var data = biz.loadData(true),
				content = $('#content').html(''),
				blocks = $('<ul class="blocks clearfix"></ul>'),
				block, lines, i;
				if (data.error) {
					tip.showErrorTip(util.i18n(data.error));
					delete data.error;
				}
				for (i in data) {
					block = $('<li class="block"></li>').appendTo(blocks);
					data[i].setTarget($(groupRender.render(data[i])).appendTo(block));
					lines = $('<ul>').appendTo(block);
					data[i].hide && lines.hide();
					data[i].traverse(function() {
						this.setTarget($(lineRender.render(this)).appendTo(lines));
					});
				}
				content.append(blocks);
				if (refresh !== false) {
					tip.showInfoTip(util.i18n('loadSuccess'));
				}
			} catch (e) {
				tip.showErrorTip(util.i18n('cantReadFile'));
			}
		}
	};

	/**
	 * ��������
	 */
	exports.backup = function() {
		editor.show(util.i18n('backupPath'), [ {
			label: '{{:backupPath}}',
			name: 'path',
			value: $('#hostsPath').val()
		} ], function(err, data) {
			if (!data.path) {
				tip.showErrorTip(util.i18n('blankPath'));
			} else if (util.fileExists(data.path)) {
				tip.showInfoTip(util.i18n('overwrite'), function() {
					saveData(data.path);
					editor.hide();
				});
			} else if (util.isDirectory(data.path)) {
				tip.showErrorTip(util.i18n('noDirectory'));
			} else {
				saveData(data.path) && editor.hide();
			}
		});
	};

	/**
	 * ������ӰЧ��
	 */
	exports.scroll = function(target) {
		clearTimeout(target.data('timeout'));
		target.data('timeout', setTimeout(function() {
			target.removeClass('scroll-top scroll-bottom');
		}, 1000));
		if (target.scrollTop() < target.data('scroll')) { // top
			target.addClass('scroll-bottom').removeClass('scroll-top');
		} else if (target.scrollTop() > target.data('scroll')) { // bottom
			target.addClass('scroll-top').removeClass('scroll-bottom');
		}
		target.data('scroll', target.scrollTop());
	};

	/**
	 * ��ʾ��ǰ·���İ�
	 */
	exports.current = function() {
		if (isCurrent) {
			$('#content .hidden').removeClass('hidden');
			isCurrent = false;
		} else {
			chrome.tabs.query({
				windowId: chrome.windows.WINDOW_ID_CURRENT,
				active: true
			}, function(tabs) {
				if (tabs && tabs[0]) {
					var hostname = util.findHostname(tabs[0].url);
					if (hostname) {
						var data = biz.loadData(),
						i, sum, toHide;
						for (i in data) {
							toHide = $();
							sum = data[i].traverse(function() {
								if (this.hostname != hostname) {
									toHide = toHide.add(this.target);
								}
							});
							if (sum == toHide.length) {
								data[i].target.closest('.block').addClass('hidden');
							} else {
								toHide.addClass('hidden');
							}
						}
						isCurrent = true;
						data = null;
					}
				}
			});
		}
	};

	/**
	 * �༭ȡ��
	 */
	exports.olCancel = function() {
		editor.hide();
		exports.close();
	};

	/**
	 * ��ʾ��ʼ���Ľ�����Ϣ
	 */
	exports.initInfoTip = function() {
		if (!chrome.benchmarking) {
			tip.showInfoTip(util.i18n('recommendInfo'));
		}
	};

	/**
	 * �༭����
	 */
	exports.olSave = editor.save;

	/**
	 * ��ť������ʾ
	 */
	exports.showTip = tip.showTip;

	/**
	 * ȷ����ʾ
	 */
	exports.confirm = tip.confirm;

	/**
	 * �ر���ʾ
	 */
	exports.close = tip.close;

});
