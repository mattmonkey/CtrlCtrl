if (typeof CtrlCtrl != "undefined") {
	CtrlCtrl.ns.handysearch = {};
}

Components.utils.import("resource://ctrlctrl/enginemng.js");

(function() {
	var _ctrlStamp, evt = null;

	function setCtrlStamp(val) {
		let c = val - _ctrlStamp;
		if (val != 0 && c < CCEM.interv) {
			// ��ª�ķ�ʽ��Ӧ�Ե�ַ����popup��һ��δ֪������Ժ��ٸġ�
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

		// ��������
		if (CCEM.issinglekeyoperation) {
			document.getElementById('ctrlctrl_keyset').setAttribute('disabled', false)
		}

		// ��������
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
		// ��������Ctrl�ж�
		if (!e.shiftKey && ! e.altKey && e.keyCode == 17) {
			evt = e
			setCtrlStamp(new Date().getTime());
		} else {
			evt = null;
			setCtrlStamp(0) // ���
		}
	}

	this.init = init
	this.fireDoubuleCtrl = openSecSearchBox;
	this.initCtrlCtrlAction = initCtrlCtrlAction;

}).apply(CtrlCtrl.ns.handysearch)

