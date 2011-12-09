Components.utils.import("resource://ctrlctrl/enginemng.js");
var tabs, searchBox;
var flg = false

// ��ʼ������
function init() {
	initUI();
	initEvent()
}

// ����
function search(e) {
	// ������ѯ�ַ���
	var searchReq = new ParseSearchTxt(searchBox.value)

	// ʹ��UIѡ�е���������
	if (searchReq.engines == "") {
		searchReq.engine = tabs.selectedItem.getAttribute('name');
	}

	// ִ�м���
	CCEM.executeSearchReq(window.opener.gBrowser, searchReq)

	// �����������
	searchBox.s('value', searchReq.searchTxt);

	window.close();
}

// ���������ַ��� 
function ParseSearchTxt(value) {
	this.searchStr = (value || "").trim();
	this.searchTxt = (value || "").trim();
	this.engines = "";
	this.param = "";
	var that = this;

	var arr = this.searchStr.split(' ');
	var csi = 0;
	var cei = arr.length;

	if (arr.length >= 2) {
		let atArr = arr[0];
		let spArr = arr[arr.length - 1]

		// �жϵ�һ������
		if (atArr.indexOf('@') == 0 && atArr.length > 1) { // @xxxxxx
			// ������
			csi = 1;
			this.engines = atArr.replace('@', "")
		} else if (atArr.length == 1 && CCEM.getEngine(atArr)) {
			csi = 1;
			this.engines = atArr
		}

		// �ж����һ������
		if (spArr) {
			var spc = '!#$'
			var fnc = [_searchSite, _multiContent, _searchFixed]
			var cnt = spArr.length - 1
			var fncIndx = spc.indexOf(spArr[cnt])
			var execFn = []

			// ���ö�Ӧ�ķ���������ɾ����
			while (fncIndx != - 1) {
				execFn.push(fnc[fncIndx]) // ����Ԥ������
				fnc.splice(fncIndx, 1) // ɾ����Ӧ�ķ���
				spc = spc.replace(spArr[cnt--], "") // ���»�׼�ַ���
				fncIndx = spc.indexOf(spArr[cnt])
			}

			if (spArr.length == execFn.length) {
				cei--
			}
		}

		this.searchTxt = arr.slice(csi, cei).join(' ')
	}

	if (cei != arr.length) {
		for (var cnt in execFn) {
			execFn[cnt]();
		}
	}

	// ��ȡվ�ڼ�������			
	function _searchSite() {
		try {
			that.param = "site:" + window.opener.content.location.hostname
		} catch(e) {}
	}

	// �������ݼ���
	function _multiContent() {
		that.searchTxts = that.searchTxt.split(CCEM.rule).filter(function(value) {
			return value.trim() != ""
		})
	}

	// ���ӹ̶������
	function _searchFixed() {
		that.fixedFlg = true
	}

}

function $(id) {
	let element = document.getElementById(id)
	element.s = element.setAttribute;
	element.g = element.getAttribute
	element.e = function(n, o) {
		element.addEventListener(n, o, true);
	}
	return element
}

function initUI() {
	// ��ɫ�Ͱ�ť
	$('Setting-Button').s('collapsed', ! CCEM.isshowsetting);
	$('Help-Button').s('collapsed', ! CCEM.isshowhelp);
	$('Search-Dialog').s('style', 'background-color:' + CCEM.backgroundcolor);
	$('EngineName-Label').s('style', 'color:' + CCEM.enginenamecolor);

	// ��Ⱥ͸߶�
	window.innerHeight = $('SearchWin-Box').clientHeight + parseInt(CCEM.heightoffset);
	$('Engines-Box').s('width', $('SearchWin-Box').clientWidth * 0.65)
	$('EngineName-Label').s('width', $('SearchWin-Box').clientWidth * 0.2)

	// ����
	tabs = $('Engines-Tabs')
	searchBox = $('Search-TextBox')

	if (window.arguments[0].toString()) {
		searchBox.value = window.arguments[0].toString();
	}

	var currentEngine = CCEM.genEngineTabs(document, tabs, currentEngine)
	$('EngineName-Label').s('value', currentEngine)

	searchBox.select();
	searchBox.focus();

}

function initEvent() {
	// ѡ������ʱ�ı���ʾ������
	tabs.e('select', function(e) {
		$('EngineName-Label').s('value', e.originalTarget.selectedItem.getAttribute('name'))
	},
	false)

	// ˫��ִ�м���
	window.addEventListener('dblclick', function(e) {
		if (e.target.tagName != 'textbox') search();
	},
	true);

	// ��������ʱ��ʾ����
	window.addEventListener('input', function(e) {
		// �����������ʾ
		if (searchBox.value.match(/^\S\s/)) {
			$('SKEngine-Button').s('src', CCEM.getEngineIcon(searchBox.value.charAt(0)))
			$('SKEngine-Button').s('collapsed', $('SKEngine-Button').g('src') == "" ? true: false)
		} else {
			$('SKEngine-Button').s('collapsed', true)
		}

		// �����������ʾ
		if (searchBox.value.charAt(0) == '@') {
			if (flg) return
			// �б���������tab��label��ɱ�����û�б���������tab������	
			for (var cnt = 0; cnt < tabs.itemCount; cnt++) {
				var tab = tabs.getItemAtIndex(cnt)
				if (tab.getAttribute('alias') && tab.getAttribute('alias').length == 1) {
					tab.setAttribute('label', tab.getAttribute('alias'))
				} else {
					tab.setAttribute('hidden', true)
				}
			}
			flg = true
		} else {
			if (!flg) return;
			// �����������ȥ����������ʾ.
			for (var cnt = 0; cnt < tabs.itemCount; cnt++) {
				tabs.getItemAtIndex(cnt).setAttribute('label', '')
				tabs.getItemAtIndex(cnt).setAttribute('hidden', false)
			}
			flg = false
		}
	},
	false);

	// ���� �л�����
	window.addEventListener('DOMMouseScroll', function(e) {
		nextTab(e.detail > 0 ? 1: - 1)
	},
	true);

	// tab / shift+tab �л�����
	window.addEventListener('keypress', function(e) {
		if (e.altKey || e.ctrlKey || e.metaKey || e.target.tagName == 'tab' || e.keyCode != 9) return;
		e.preventDefault()
		nextTab(e.shiftKey ? - 1: 1)
		searchBox.focus()
	},
	false);
}

// �����ý���
function openSettingWin() {
	window.openDialog("chrome://ctrlctrl/content/options.xul", "", ["dialog,centerscreen"]);
}

// �򿪰���ҳ��
function openHelpPage() {
	window.opener.gBrowser.selectedTab = window.opener.gBrowser.addTab("http://www.ourfirefox.com/archives/1023");
	window.close();
}

function nextTab(inc) {
	var cnt = 1;
	do {
		tabs.advanceSelectedTab(inc, true)
		// ������ѭ��
		if (cnt++ > tabs.itemCount) break;
	} while (tabs.selectedItem.getAttribute('hidden') == true)
	// ȷ������ɼ�
	$('Engines-Box').ensureElementIsVisible(tabs.selectedItem);
}

