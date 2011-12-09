var CtrlCtrl = {
		handleEvent:function(){
			if(!CtrlCtrl.ns)return;
			for each(var kit in CtrlCtrl.ns){
				if(kit.init) kit.init();
			}
		}
};

CtrlCtrl.ns= {};
window.addEventListener("load", CtrlCtrl, false);

// ���߿�
CtrlCtrl.lib = {
	css: Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService),
	PAGE_WELCOME: "http://code.google.com/p/site-specific-pages/",
	PREF_PREFIX: "extensions.handysearch.",
	PAGE_RELEASE_LOG: "http://site-specific-pages.googlecode.com/svn/trunk/RELEASE_CHANGE_LOG.txt",
	PAGE_BETA_LOG: "http://site-specific-pages.googlecode.com/svn/trunk/BETA_CHANGE_LOG.txt",
	ADDON_ID: "handysearch@mattmonkey",
	TLDS: Components.classes["@mozilla.org/network/effective-tld-service;1"].getService(Components.interfaces.nsIEffectiveTLDService),
	$: function $(id) {
		return document.getElementById(id);
	},

	$Log: function log2(val) {
		// if (DBRUtil.getPref('debug', null)) 
		this.css.logStringMessage(this.ADDON_ID + " debug : " + val)
	},

	$Attr: function(obj, attr, arg) {
		if (typeof obj == "string") {
			obj = document.getElementById(obj);
		}
		if (typeof arg === "undefined") {
			return obj.getAttribute(attr);
		} else {
			obj.setAttribute(attr, arg);
		}

	},

	$Clean: function(node) {
		while (node.firstChild) {
			node.removeChild(node.firstChild);
		}
	},

	get $Win() {
		return document.commandDispatcher.focusedWindow;
	},

	get $Doc() {
		return document.commandDispatcher.focusedWindow.document;
	},

	$SetPref: function() {
		if (arguments.length == 2) {
			var name = arguments[0],
			value = arguments[1]
			Application.prefs.setValue(this.PREF_PREFIX + name, value)
		}
	},

	$GetPref2: function(key, defaultVal) {
		return JSON.parse(Application.prefs.getValue(this.PREF_PREFIX + key, defaultVal ? defaultVal: null))
	},

	$SetPref2: function(key, value) {
		return Application.prefs.setValue(this.PREF_PREFIX + key, JSON.stringify(value));
	},

	$GetPref: function() {
		if (arguments.length == 2) {
			var name = arguments[0],
			value = arguments[1]
			return Application.prefs.getValue(this.PREF_PREFIX + name, value)
		}
	},

	$GetHost: function(aURI) {
		return CtrlCtrl.lib.TLDS.getBaseDomain(aURI);
	},

	ce: function ce(name, node, data, handles, insertflg, doc) {
		var object = document.createElement(name);
		for (var p in data) {
			object.setAttribute(p, data[p])
		}
		for (var p in handles) {
			object.addEventListener(p, handles[p], false)
		}
		if (typeof node === 'string') {
			node = document.getElementById(node)
		}
		if (insertflg != true) {
			if (node) node.appendChild(object)
		}
		else {
			if (node) node.insertBefore(object, node.firstChild)
		}
		return object
	},

	openPage: function openPage(val, flg, delay) {
		setTimeout(function() {
			if (flg) {
				gBrowser.selectedTab = gBrowser.addTab(val);
			} else {
				gBrowser.loadURI(val);

			}
		},
		delay ? delay: 0)
	},

	checkFirstRun: function() {
		// �״ΰ�װ�򿪰���˵��
		var flg = this.$GetPref("firstrun", null);
		if (!flg) {
			this.openPage(this.PAGE_WELCOME, true, 3000);
			this.setPref("firstrun", true);
		}
	},

	checkVersion: function() {
		// �򿪰汾˵��ҳ��
		var $GetPref = this.$GetPref,
		setPref = this.setPref,
		openPage = this.openPage,
		PAGE_RELEASE_BETA = this.PAGE_BETA_LOG,
		PAGE_RELEASE = this.PAGE_RELEASE_LOG;
		that = this,
		Components.utils.import("resource://gre/modules/AddonManager.jsm");
		AddonManager.getAddonByID(this.ADDON_ID, function(addon) {
			try {
				Components.utils.import("resource://gre/modules/AddonManager.jsm");
				Components.utils.import("resource://gre/modules/Services.jsm");
				var vc = Services.vc,
				curtVersion = addon.version,
				betaFlg = curtVersion.indexOf('beta') >= 0,
				param = betaFlg ? 'versionrec2': 'versionrec',
				versionRec = $GetPref.call(that, param, betaFlg ? '0.1beta1': '0.1.0'),
				release_url = betaFlg ? PAGE_RELEASE_BETA: PAGE_RELEASE;

				// ���ڵ�ǰ�汾������˵��ҳ
				// ���˵���ĵ���https://developer.mozilla.org/en/XPCOM_Interface_Reference/nsIVersionComparator
				if (vc.compare(curtVersion, versionRec) > 0) {
					// TOTO !!!
					// �򿪰汾˵��
					that.openPage(release_url, true, 2000)
					// �汾�������� 1.1�汾������1.2 ����������
					if (curtVersion == "1.2" && versionRec == "1.1") {
						setPref({})
					}
					setPref.call(that, param, curtVersion);
				}
			} catch(e) {
				alert(e)
			}
		})
	},
	
	// �л���ǩ������״̬
	toggleBookmarkToolbar: function() {
		var ptb = document.getElementById("PersonalToolbar");
		if (window.setToolbarVisibility != null) {
			window.setToolbarVisibility(ptb, ptb.collapsed); // Firefox 4
		} else {
			ptb.collapsed = ! ptb.collapsed //  Firefox 3
		}
	}
}


