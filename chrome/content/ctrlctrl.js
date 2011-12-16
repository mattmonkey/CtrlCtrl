if (typeof CtrlCtrl != "undefined") {
	CtrlCtrl.ns.handysearch = {};
}
Components.utils.import("resource://ctrlctrl/enginemng.js");
(function() {
	with(CtrlCtrl.lib) {
		var _ctrlStamp = 0,
		evt = null,
		KV_CTRL = 17;

		function setCtrlStamp(val, e) {

			if (evt == null) evt = e;

			// 检查是否是同一个控件的两次Ctrl
			if (evt.originalTarget !== e.originalTarget) {
				evt = null;
				_ctrlStamp = val;
				return;
			}
			evt = e;

			// 检查两次Ctrl间的间隔
			let c = val - _ctrlStamp;
			if (c > 0 && c < CCEM.interv) {
				fireDoubuleCtrl(evt);
			} else {
				_ctrlStamp = val;
			}
		}

		function getSelectedStrFromPage() {
			return $Win.getSelection().toString().trim();
		}

		function getSelectedStr(event) {
			let rslt = '';
			if (event && event.originalTarget) {
				let box = event.originalTarget;
				let localName = box.localName || "";
				$Log("call getSelectedStr localName : " + localName);
				if (['textarea', 'input'].indexOf(localName) != - 1) {
					rslt = box.value.substring(box.selectionStart, box.selectionEnd);
				} else if (localName == 'html') {
					rslt = getSelectedStrFromPage();
				}
			}
			return rslt.substr(0, 150);
		}

		function init() {
			var contentArea = gBrowser.mPanelContainer;
			if (!contentArea) return;
			// 单键操作
			if (CCEM.issinglekeyoperation) {
				genSingleShortCut();
			}

			// 单键搜索
			if (CCEM.issinglekeysearch) {
				contentArea.addEventListener('keyup', searchBySingleKey, false);
			}

			window.addEventListener('keydown', initCtrlCtrlAction, false);
		}

		function genSingleShortCut() {

			$Attr('ctrlctrl_keyset', 'disabled', false);
			for (var i = 97; i <= 122; i++) {
				try {
					var c = String.fromCharCode(i);
					if (!$GetPref("sko." + c, false)) continue;
					var cmd = $GetPref("sko." + c + "2", ""),
					evtName = /\(*\)/.test(cmd) ? "oncommand": "command";
					var data = {};
					data.key = c;
					data[evtName] = cmd;
					ce("key", "ctrlctrl_keyset", data);
					$Log("call init " + c + " | " + evtName + " | " + cmd)
				} catch(e) {
					$Log("error " + e)
				}
			}

		}

		function searchBySingleKey(e) {
			if (e.shiftKey || e.altKey || e.ctrlKey) return;
			var key = String.fromCharCode(e.keyCode).toLowerCase()
			if (!CCEM.getEngine(key)) return;
			CCEM.searchByAlias(gBrowser, key, getSelectedStrFromPage());
		}

		function fireDoubuleCtrl(event) {
			let ui = "chrome://ctrlctrl/content/search.xul";
			let param = ["modal,titlebar=no,dialog,centerscreen,width=" + CCEM.width + ""];
			window.openDialog(ui, "ctrl Ctrl", param, getSelectedStr(event));
		}

		function initCtrlCtrlAction(e) {
			if (e.shiftKey || e.altKey || ! isPressCtrlKey(e)) return;
			setCtrlStamp(new Date().getTime(), e);
		}

		function isPressCtrlKey(e) {
			return e.keyCode == KV_CTRL;
		}
	}
	this.init = init
	this.fireDoubuleCtrl = fireDoubuleCtrl;
	this.initCtrlCtrlAction = initCtrlCtrlAction;

}).apply(CtrlCtrl.ns.handysearch);

