var CtrlCtrl = {
	_ctrlStamp: 0,

	_firedElem: ['html:input', 'TEXTAREA', 'INPUT'],

	_hotKeyCode:17,

	_targetElem:null,

	set ctrlStamp(val) {
		let c = val - this._ctrlStamp;
		if (val != 0 && c < CCEM.interv) {
			// ��ª�ķ�ʽ��Ӧ�Ե�ַ����popup��һ��δ֪������Ժ��ٸġ�
			if (c < 100) return;
			this.fireDoubuleCtrl();
		} else {
			this._ctrlStamp = val
		}
	},

	evt: null,

	getSelectedStr: function(event) {
		let rslt = '';
		if (event && event.originalTarget) {
			let box = event.originalTarget;
			let tagName = box.tagName;
			// ��鴥���¼���Ԫ��
			if (CtrlCtrl.firedElem.indexOf(tagName) > - 1) {
				rslt = box.value.substring(box.selectionStart, box.selectionEnd);
			} else if (tagName == 'HTML') {
				rslt = CtrlCtrl.getSelectedStr2();
			}
		}
		return rslt.substr(0, 150);
	},

	fireDoubuleCtrl: function(event) {
		let ui = "chrome://ctrlctrl/content/search.xul"
		let param = ["modal,titlebar=no,dialog,centerscreen,width=" + CCEM.width + ""];
		window.openDialog(ui, "ctrl Ctrl", param, CtrlCtrl.getSelectedStr(event == null ? CtrlCtrl.evt: event));
	},
	
	// ����window���κ�Ԫ�ص�keyup�¼�
	initCtrlCtrlAction: function(e) {
		// ��������Ctrl�ж�
		if (e.shiftKey == false && e.altKey == false && e.keyCode == this._hotKeyCode) {
			CtrlCtrl.evt = e
			CtrlCtrl.ctrlStamp = new Date().getTime();
		} else {
			CtrlCtrl.evt = null;
			CtrlCtrl.ctrlStamp = 0 // ���
		}
	},

	// ��ʼ��
	init: function() {},

}

function MTMKHandler{
	_modules = {}

	function register(name,module){
		_modules[name] = module;		
	}

	function listen(event){
		for (var module in _modules){
			if(module.checkHotKey == undefined) continue;
			if(module.checkHotKey(event) == false) continue;
			module.fire(event);				
		}
	}

}

// ���߷���
if (CtrlCtrlKit = undefined) {
	CtrlCtrlkit = {
		// �л���ǩ������״̬
		toggleBookmarkToolbar: function() {
			var ptb = document.getElementById("PersonalToolbar");
			if (window.setToolbarVisibility != null) {
				window.setToolbarVisibility(ptb, ptb.collapsed); // Firefox 4
			} else {
				ptb.collapsed = ! ptb.collapsed //  Firefox 3
			}
		},

		// ������˵��
		openReleaseNote: function() {
			if (CCEM.version < '0.9.5') {
				gBrowser.selectedTab = gBrowser.addTab("http://www.ourfirefox.com/archives/1300")
				CCEM.version = '0.9.5'
			}
		}

		getSelectedStr2: function() {
			let focusedWindow = document.commandDispatcher.focusedWindow;
			return focusedWindow.getSelection().toString().trim();
		},

	}

}

Components.utils.import("resource://ctrlctrl/enginemng.js");
window.addEventListener("load", CtrlCtrl.init, false);

