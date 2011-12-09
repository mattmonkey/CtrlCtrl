const EXPORTED_SYMBOLS = ['CCEM'];

const Cc = Components.classes;
const Ci = Components.interfaces;
const bss = Cc["@mozilla.org/browser/search-service;1"].getService(Components.interfaces.nsIBrowserSearchService);
const css = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
const Application = Components.classes["@mozilla.org/fuel/application;1"].getService(Components.interfaces.fuelIApplication);



var CCEM = {
    cache: {}, // 缓存
    getCache: function(val){
        return CCEM.cache[val];
    },
    setCache: function(alias, obj){
        CCEM.cache[alias] = obj;
    },
    clearCache: function(){
		CCEM.log("clear cache")
        CCEM.cache = {};
    },
    log: function(val){
        css.logStringMessage("CtrlCtrl debug : "+val);
    },
	test:function(){
		
	}
};

function genSetterGetter(props){
	for (var n in props) {
		var propName = props[n];
		var _fn_getter = function(){
			var p= propName;
			return function(){
				return Application.prefs.getValue('extensions.handysearch.' + p, null)
			}
		}();
		var _fn_setter = function(){
			var p= propName;
			return function(val){
				Application.prefs.setValue('extensions.handysearch.' + p, val)
			}
		}()
		CCEM.__defineGetter__(propName, _fn_getter)
		CCEM.__defineSetter__(propName, _fn_setter)
	}
}

genSetterGetter(['version','rule','interv','width','heightoffset','backgroundcolor','enginenamecolor','isshowsetting','isshowhelp','issinglekeysearch','issinglekeyoperation'])


CCEM.searchByAlias = function(ref, alias, content,type){
	if(!content)return;
    var engine = CCEM.getEngine(alias,type)
    if (engine) {
		ref.selectedTab = ref.addTab(engine.getSubmission(content, null).uri.spec);	
		// 加入检索历史	
		Components.classes["@mozilla.org/satchel/form-history;1"].getService(Components.interfaces.nsIFormHistory2).addEntry("searchbar-history", content);	
    }
}

CCEM.executeSearchReq = function(ref,req){
	var searchString = []
	if(req.searchTxts){
		var fixedContent = "" 
		if (req.fixedFlg){
			fixedContent = req.searchTxts.shift()+" "			
		}
		for(var cnt in req.searchTxts){			
			searchString[cnt] = fixedContent+req.searchTxts[cnt] + " " + req.param;	
		}
	}else{
		searchString[0] = req.searchTxt + " " + req.param;	
	}
	
	if(req.engines == "") req.engines= [req.engine]
	for(var cnt in req.engines){
		for(var cnt2 in searchString){
			CCEM.searchByAlias(ref,req.engines[cnt],searchString[cnt2],req.engine)
		}
	}		
}

CCEM.getEngine = function(alias,type){
	var flg = false;
	var engine = CCEM.getCache(alias);
    if (!engine) {
		if(type){
			engine = bss.getEngineByName(alias);
		}else{
			engine = bss.getEngineByAlias(alias);
		}
		flg = true
    }	
    if (flg && engine) {
		// 谁会把搜索引擎的名字起得和别名一样短呢？
        CCEM.setCache(alias, engine);
    }
	return engine;	
}

CCEM.getEngineIcon = function(alias){
	var icon = "chrome://ctrlctrl/skin/blank.png";
	var e = CCEM.getEngine(alias);
	if(!e) return ""
	if(e && e.iconURI) icon = e.iconURI.spec;
	return icon;
}

// 发现有时候打开搜索框，引擎图标会刷的比较慢。机制不明，这功能用的又比较频繁，所以先做写缓存措施，看看效果。
CCEM.genEngineTabs = function(doc,box){
	
	var engines = CCEM.getVisibleEngines();	
	var curtName = CCEM.getCurrentEngine().name
	var selectedIndx = 0
	for (var cnt in engines) {
		var aTab =genEngineTab(engines[cnt])
		if(engines[cnt].name == curtName) selectedIndx = cnt
		box.appendChild(aTab)
	}

	box.selectedIndex = selectedIndx;
	return curtName;
	
    function genEngineTab(engine){
		var aTab = doc.createElement('tab');
		aTab.arrowKeysShouldWrap = true;
		aTab.setAttribute('tooltiptext', (engine.alias?"keyword:"+engine.alias+" ":"")+engine.name);
		aTab.setAttribute('name', engine.name);
		aTab.setAttribute('alias', engine.alias);
		if(engine.iconURI && engine.iconURI.spec){
			aTab.setAttribute('image', engine.iconURI.spec);
		}else{
			aTab.setAttribute('image', "chrome://ctrlctrl/skin/blank.png");
		}
		return aTab
	}
}

CCEM.getVisibleEngines = function (){
	var rslt = CCEM.getCache('__ENGINES')
	if (!rslt) {
		rslt = bss.getVisibleEngines({})
		CCEM.setCache('__ENGINES',rslt)
	}
	return rslt
}

CCEM.getCurrentEngine = function (){
	return bss.currentEngine
}

CCEM.ob = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);

CCEM.ob.addObserver({
    observe: function(aSubject, aTopic, aData){
        CCEM.clearCache();
    }
}, "browser-search-engine-modified", false);

			
