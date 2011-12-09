Components.utils.import("resource://ctrlctrl/enginemng.js");
var tabs, searchBox;
var flg = false

// 初始化界面
function init() {
	initUI();
	initEvent()
}

// 检索
function search(e) {
	// 解析查询字符串
	var searchReq = new ParseSearchTxt(searchBox.value)

	// 使用UI选中的搜索引擎
	if (searchReq.engines == "") {
		searchReq.engine = tabs.selectedItem.getAttribute('name');
	}

	// 执行检索
	CCEM.executeSearchReq(window.opener.gBrowser, searchReq)

	// 记忆检索内容
	searchBox.s('value', searchReq.searchTxt);

	window.close();
}

// 解析检索字符串 
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

		// 判断第一个数组
		if (atArr.indexOf('@') == 0 && atArr.length > 1) { // @xxxxxx
			// 单引擎
			csi = 1;
			this.engines = atArr.replace('@', "")
		} else if (atArr.length == 1 && CCEM.getEngine(atArr)) {
			csi = 1;
			this.engines = atArr
		}

		// 判断最后一个数组
		if (spArr) {
			var spc = '!#$'
			var fnc = [_searchSite, _multiContent, _searchFixed]
			var cnt = spArr.length - 1
			var fncIndx = spc.indexOf(spArr[cnt])
			var execFn = []

			// 调用对应的方法，用完删除。
			while (fncIndx != - 1) {
				execFn.push(fnc[fncIndx]) // 放入预备数组
				fnc.splice(fncIndx, 1) // 删除对应的方法
				spc = spc.replace(spArr[cnt--], "") // 更新基准字符串
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

	// 获取站内检索参数			
	function _searchSite() {
		try {
			that.param = "site:" + window.opener.content.location.hostname
		} catch(e) {}
	}

	// 多重内容检索
	function _multiContent() {
		that.searchTxts = that.searchTxt.split(CCEM.rule).filter(function(value) {
			return value.trim() != ""
		})
	}

	// 叠加固定项检索
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
	// 颜色和按钮
	$('Setting-Button').s('collapsed', ! CCEM.isshowsetting);
	$('Help-Button').s('collapsed', ! CCEM.isshowhelp);
	$('Search-Dialog').s('style', 'background-color:' + CCEM.backgroundcolor);
	$('EngineName-Label').s('style', 'color:' + CCEM.enginenamecolor);

	// 宽度和高度
	window.innerHeight = $('SearchWin-Box').clientHeight + parseInt(CCEM.heightoffset);
	$('Engines-Box').s('width', $('SearchWin-Box').clientWidth * 0.65)
	$('EngineName-Label').s('width', $('SearchWin-Box').clientWidth * 0.2)

	// 引用
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
	// 选择引擎时改变提示栏内容
	tabs.e('select', function(e) {
		$('EngineName-Label').s('value', e.originalTarget.selectedItem.getAttribute('name'))
	},
	false)

	// 双击执行检索
	window.addEventListener('dblclick', function(e) {
		if (e.target.tagName != 'textbox') search();
	},
	true);

	// 多重搜索时显示别名
	window.addEventListener('input', function(e) {
		// 单引擎检索提示
		if (searchBox.value.match(/^\S\s/)) {
			$('SKEngine-Button').s('src', CCEM.getEngineIcon(searchBox.value.charAt(0)))
			$('SKEngine-Button').s('collapsed', $('SKEngine-Button').g('src') == "" ? true: false)
		} else {
			$('SKEngine-Button').s('collapsed', true)
		}

		// 多引擎检索提示
		if (searchBox.value.charAt(0) == '@') {
			if (flg) return
			// 有别名的引擎tab，label变成别名。没有别名的引擎tab，隐藏	
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
			// 所有引擎别名去掉，并且显示.
			for (var cnt = 0; cnt < tabs.itemCount; cnt++) {
				tabs.getItemAtIndex(cnt).setAttribute('label', '')
				tabs.getItemAtIndex(cnt).setAttribute('hidden', false)
			}
			flg = false
		}
	},
	false);

	// 滚轴 切换引擎
	window.addEventListener('DOMMouseScroll', function(e) {
		nextTab(e.detail > 0 ? 1: - 1)
	},
	true);

	// tab / shift+tab 切换引擎
	window.addEventListener('keypress', function(e) {
		if (e.altKey || e.ctrlKey || e.metaKey || e.target.tagName == 'tab' || e.keyCode != 9) return;
		e.preventDefault()
		nextTab(e.shiftKey ? - 1: 1)
		searchBox.focus()
	},
	false);
}

// 打开设置界面
function openSettingWin() {
	window.openDialog("chrome://ctrlctrl/content/options.xul", "", ["dialog,centerscreen"]);
}

// 打开帮助页面
function openHelpPage() {
	window.opener.gBrowser.selectedTab = window.opener.gBrowser.addTab("http://www.ourfirefox.com/archives/1023");
	window.close();
}

function nextTab(inc) {
	var cnt = 1;
	do {
		tabs.advanceSelectedTab(inc, true)
		// 避免死循环
		if (cnt++ > tabs.itemCount) break;
	} while (tabs.selectedItem.getAttribute('hidden') == true)
	// 确保引擎可见
	$('Engines-Box').ensureElementIsVisible(tabs.selectedItem);
}

