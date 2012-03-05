var CtrlCtrl = {
		handleEvent:function(){
			if(!CtrlCtrl.ns)return;
			for each(var kit in CtrlCtrl.ns){
				if(kit.init) kit.init();
			}
			CtrlCtrl.lib.checkVersion();
			CtrlCtrl.lib.checkFirstRun();
		},
		ns:{}
}

window.addEventListener("load", CtrlCtrl, false);

// 工具库
CtrlCtrl.lib = {
	css: Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService),
	PAGE_WELCOME: "http://mattmonkey.github.com/CtrlCtrl/#t_releasenote",
	PREF_PREFIX: "extensions.handysearch.",
	PAGE_RELEASE_LOG: "http://mattmonkey.github.com/CtrlCtrl/",
	PAGE_BETA_LOG: "http://mattmonkey.github.com/CtrlCtrl/",
	ADDON_ID: "handysearch@mattmonkey",
	ADDON_NAME: "Ctrl Ctrl",
	TLDS: Components.classes["@mozilla.org/network/effective-tld-service;1"].getService(Components.interfaces.nsIEffectiveTLDService),
	$: function $(id) {
		return document.getElementById(id);
	},

	$Log: function log2(val) {
		if (CtrlCtrl.lib.$GetPref('debug', false)) 
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

	$GenStr : function(){
		let pattern = arguments[0];
		for(var i = 1; i < arguments.length;i++){
			pattern = pattern.replace("%"+i,arguments[i]);
		}
		return pattern;	
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

	$HasPrefValue : function(key){
		var pref =Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
		return  pref.prefHasUserValue(this.PREF_PREFIX + key);
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

	$event:function(elm,handles){
		this.ce(elm,null,null,handles)
	},

	ce: function ce(elm, node, data, handles,useCapture, insertflg, doc) {
			
		if (typeof elm === 'string') {
			elm = document.createElement(elm);
		}
			
		for (var p in data) {
			elm.setAttribute(p, data[p])
		}
		for (var p in handles) {
			elm.addEventListener(p, handles[p], useCapture?true:false)
		}
		if (typeof node == 'string') {
			node = document.getElementById(node)
		}
		if (insertflg != true) {
			if (node) node.appendChild(elm)
		}
		else {
			if (node) node.insertBefore(elm, node.firstChild)
		}
		return elm 
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

	$GetOS : function(arg){
		var aWin = arg? arg:window;
		var ua =  aWin.navigator.userAgent.toLowerCase();
		CtrlCtrl.lib.$Log(ua);
		if(ua.indexOf("window")!=-1)return "window"
		if(ua.indexOf("linux")!=-1)return "linux"
		return "other";		
	},

	$OpenDialog :function(url,vals,size,pos){
		window.openDialog(url, CtrlCtrl.lib.ADDON_NAME,"chrome=yes, dialog, modal, resizable=yes,centerscreen",vals);
	},

	checkFirstRun: function() {
		// 首次安装打开帮助说明
		var flg = this.$GetPref("firstrun", null);
		if (!flg) {
			this.openPage(this.PAGE_WELCOME, true, 3000);
			this.$SetPref("firstrun", true);
		}
	},

	checkVersion: function() {
		// 打开版本说明页面
		var $GetPref = this.$GetPref,
		setPref = this.$SetPref,
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

				// 大于当前版本打开升级说明页
				// 相关说明文档：https://developer.mozilla.org/en/XPCOM_Interface_Reference/nsIVersionComparator
				if (vc.compare(curtVersion, versionRec) > 0) {
					// TOTO !!!
					// 打开版本说明
					that.openPage(release_url, true, 2000)
					setPref.call(that, param, curtVersion);
				}
			} catch(e) {
				alert(e)
			}
		})
	},
	
	// 切换书签工具栏状态
	toggleBookmarkToolbar: function() {
		var ptb = document.getElementById("PersonalToolbar");
		if (window.setToolbarVisibility != null) {
			window.setToolbarVisibility(ptb, ptb.collapsed); // Firefox 4
		} else {
			ptb.collapsed = ! ptb.collapsed //  Firefox 3
		}
	}
}


