if (typeof CtrlCtrl != "undefined") {
	CtrlCtrl.ns.handysearch = {};
}
Components.utils.import("resource://ctrlctrl/enginemng.js");
(function() {
	with(CtrlCtrl.lib) {
		var _ctrlStamp = 0,
		evt = null;

		function setCtrlStamp(val, e) {
			// 清除
			if (val == 0) {
				evt = null;
				_ctrlStamp = 0;
				return;
			}

			if (evt == null) evt = e;
			// 同一个控件上，两次Ctrl才有效
			if (evt.originalTarget !== e.originalTarget) return;
			evt = e;

			let c = val - _ctrlStamp;
			if (c > 0 && c < CCEM.interv) {
				$Log("call setCtrlStamp interv : " + c);
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
				let tagName = box.tagName.toUpperCase() || "";
				$Log("call getSelectedStr : " + tagName);
				if (['HTML:INPUT', 'TEXTAREA', 'INPUT'].indexOf(tagName) > - 1) {
					rslt = box.value.substring(box.selectionStart, box.selectionEnd);
				} else if (tagName == 'HTML') {
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
				$Attr('ctrlctrl_keyset', 'disabled', false);
			}

			// 单键搜索
			if (!CCEM.issinglekeysearch) return;
			contentArea.addEventListener('keyup', function(e) {
				if (e.shiftKey || e.altKey || e.ctrlKey) return;
				var key = String.fromCharCode(e.keyCode).toLowerCase()
				if (!CCEM.getEngine(key)) return;
				CCEM.searchByAlias(gBrowser, key, getSelectedStrFromPage());
			},
			false);
		}

		function fireDoubuleCtrl(event) {
			let ui = "chrome://ctrlctrl/content/search.xul";
			let param = ["modal,titlebar=no,dialog,centerscreen,width=" + CCEM.width + ""];
			window.openDialog(ui, "ctrl Ctrl", param, getSelectedStr(event));
		}

		function initCtrlCtrlAction(e) {
			if (e.shiftKey || e.altKey) return;
			let stamp = isPressCtrlKey(e) ? new Date().getTime() : 0;
			setCtrlStamp(stamp, e);
		}

		function isPressCtrlKey(e) {
			$Log("call isPressCtrlKey " + e.ctrlKey + " | " + e.keyCode);
			// 不同系统貌似	
			if ($GetOS() == "window") {
				return ! e.ctrlKey && e.keyCode == 17;
			}
			return e.ctrlKey;
		}
	}
	this.init = init
	this.fireDoubuleCtrl = fireDoubuleCtrl;
	this.initCtrlCtrlAction = initCtrlCtrlAction;

}).apply(CtrlCtrl.ns.handysearch);

