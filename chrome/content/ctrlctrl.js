if (typeof CtrlCtrl != "undefined") {
	CtrlCtrl.ns.handysearch = {};
}

Components.utils.import("resource://ctrlctrl/enginemng.js");
(function() {
	with(CtrlCtrl.lib) {
		var _ctrlStamp = 0,
		evt = null,
		KV_CTRL = 17,
		REPEAT_RIVISION = 50;

		function setCtrlStamp(val, e) {

			// 检查是否是同一个控件的两次Ctrl
			if ( evt && evt.originalTarget !== e.originalTarget) {
				evt = null;
				_ctrlStamp = val;
				return;
			}

			evt = e;

			// 检查两次Ctrl间的间隔
			let c = val - _ctrlStamp;
			if (c > REPEAT_RIVISION && c < CCEM.interv ) {
				fireDoubuleCtrl(evt);
			}
			
			_ctrlStamp = val;
			
		}

		function getSelectedStr(event) {
			let rslt = '';
			if (event && event.originalTarget) {
				let box = event.originalTarget;
				let localName = box.localName || "";
				$Log("call getSelectedStr ==> localName : " + localName);
				// 输入框
				if (['textarea', 'input'].indexOf(localName) >= 0 ) {
					rslt = box.value.substring(box.selectionStart, box.selectionEnd);
				// 页面
				} else if (['html','body'].indexOf(localName) >= 0) {
					rslt = $Win.getSelection().toString().trim();
				// 快键触发	
				}else if (localName=="key") {	
					return getSelectedStr({originalTarget:$Doc.activeElement})
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
				$event(contentArea,{keyup:searchBySingleKey})
			}

			// 长按问题
			// https://developer.mozilla.org/en/DOM/KeyboardEvent#Auto-repeat_handling
			window.addEventListener('keydown', initCtrlCtrlAction, false);
		}

		// 添加单键处理
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

		// 处理单键检索
		function searchBySingleKey(e) {
			if (e.shiftKey || e.altKey || e.ctrlKey || e.metaKey) return;
			var key = String.fromCharCode(e.keyCode).toLowerCase();
			if (!CCEM.getEngine(key)) return;
			CCEM.searchByAlias(gBrowser, key, getSelectedStr(e));
		}

		// 触发检索窗口
		function fireDoubuleCtrl(event) {
			let ui = "chrome://ctrlctrl/content/search.xul";
			let param = ["modal,titlebar=no,dialog,centerscreen,width=" + CCEM.width ];
			window.openDialog(ui, "ctrl Ctrl", param, getSelectedStr(event));
		}

		// 处理双击Ctrl
		function initCtrlCtrlAction(e) {
			if (e.shiftKey || e.altKey || e.metaKey || !isPressCtrlKey(e)) return;
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

