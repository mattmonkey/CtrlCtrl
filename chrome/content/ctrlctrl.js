if (typeof CtrlCtrl != "undefined") {
	CtrlCtrl.ns.handysearch = {};
}

Components.utils.import("resource://ctrlctrl/enginemng.js");

(function() {
	var _ctrlStamp, evt = null;

	function setCtrlStamp(val) {
		let c = val - _ctrlStamp;
		if (val != 0 && c < CCEM.interv) {
			// 丑陋的方式，应对地址栏的popup和一个未知情况，以后再改。
			if (c < 100) return;
			openSecSearchBox();
		} else {
			_ctrlStamp = val
		}
	}

	function getSelectedStr2() {
		let focusedWindow = document.commandDispatcher.focusedWindow;
		return focusedWindow.getSelection().toString().trim();
	}

	function getSelectedStr(event) {
		let rslt = '';
		if (event && event.originalTarget) {
			let box = event.originalTarget;
			let tagName = box.tagName;
			if (['html:input', 'TEXTAREA', 'INPUT'].indexOf(tagName) > - 1) {
				rslt = box.value.substring(box.selectionStart, box.selectionEnd);
			} else if (tagName == 'HTML') {
				rslt = getSelectedStr2();
			}
		}
		return rslt.substr(0, 150);
	}

	function init() {
		if (!gBrowser) return;
		var contentArea = gBrowser.mPanelContainer;
		if (!contentArea) return;

		// 单键操作
		if (CCEM.issinglekeyoperation) {
			document.getElementById('ctrlctrl_keyset').setAttribute('disabled', false)
		}

		// 单键搜索
		if (!CCEM.issinglekeysearch) return;
		contentArea.addEventListener('keyup', function(e) {
			if (!e.shiftKey && ! e.altKey && ! e.ctrlKey) {
				var key = String.fromCharCode(e.keyCode).toLowerCase()
				if (!CCEM.getEngine(key)) return;
				let sel = getSelectedStr2();
				CCEM.searchByAlias(gBrowser, key, sel)
			}
		},
		false)
	}

	function openSecSearchBox(event) {
		let ui = "chrome://ctrlctrl/content/search.xul"
		let param = ["modal,titlebar=no,dialog,centerscreen,width=" + CCEM.width + ""];
		window.openDialog(ui, "ctrl Ctrl", param, getSelectedStr(event == null ? evt: event));
	}

	function initCtrlCtrlAction(e) {
		// 连按两次Ctrl判断
		if (!e.shiftKey && ! e.altKey && e.keyCode == 17) {
			evt = e
			setCtrlStamp(new Date().getTime());
		} else {
			evt = null;
			setCtrlStamp(0) // 清除
		}
	}

	this.init = init
	this.fireDoubuleCtrl = openSecSearchBox;
	this.initCtrlCtrlAction = initCtrlCtrlAction;

}).apply(CtrlCtrl.ns.handysearch)

