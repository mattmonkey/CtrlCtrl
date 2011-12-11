if (typeof CtrlCtrl != "undefined") {
	CtrlCtrl.ns.sspage = {}
}

(function() {
	with(CtrlCtrl.lib) {
		var mapping = {},
		url = "",
		title = "",
		host = "";

		// 初始化入口
		function init() {

			// 地址栏加入图标，图标加入click事件
			ce('image', 'urlbar-icons', {
				src: 'chrome://ctrlctrl/skin/web_site.ico',
				id: 'ssp_ico'
			},
			{
				click: popup
			})

			// popuoset加入一个menupopup 用于显示指定页的菜单项
			ce('menupopup', 'sspage_menu_root', {
				id: 'sspage_popup'
			},
			{
				command: itemClickProcessor,
				popupshowing: menuCreater
			})
		}

		// 刷新页面参数。（host,url,title）
		function refreshPageInfo() {
			mapping = $GetPref2("mapping",{});
			if (gBrowser.currentURI.spec.indexOf("about:") == 0) {
				host = "about";
				url = gBrowser.currentURI.spec;
				title = gBrowser.contentDocument.title;
			} else if (gBrowser.currentURI.spec.indexOf("chrome:") == 0) {
				host = "chrome";
				url = gBrowser.currentURI.spec;
				title = gBrowser.contentDocument.title;
			} else {
				host = $GetHost(gBrowser.currentURI);
				url = gBrowser.currentURI.spec;
				title = gBrowser.contentDocument.title;
			}
		}

		// 点击菜单项处理。（打开页面，添加页面，删除页面）
		function itemClickProcessor(e) {
			var url = $Attr(e.target, 'href')
			if (url) {
				CtrlCtrl.lib.openPage(url, e.ctrlKey)
			} else {
				if (e.target.id == 'ssp_fn_append') {
					append()
				} else {
					remove()
				}
				$SetPref2("mapping",mapping)
			}
		}

		// 生成菜单
		function menuCreater(e) {
			if (e.target.id == 'sspage_popup') {
				refreshPageInfo();
				$Clean(e.target);
				genMenuItem(e.target);
			}
		}

		// 生成指定页菜单
		function genMenuItem(m) {
			var flg = false,
			siteMap, cnt = 1;
			// 加入指定页菜单项
			siteMap = mapping[host]
			if (siteMap) {
				for each(var page in siteMap.pages) {
					if (page.url == url) flg = true;
					// if(c=='lp') continue;
					ce('menuitem', m, {
						label: page.title,
						href: page.url,
						tooltiptext: page.url,
						accesskey: cnt < 10 ? cnt++ : ''
					})
				}
			}

			// 加入一个分隔线
			if (siteMap) ce('menuseparator', m, {
				id: 'ssp_ms'
			})

			// 显示<append>或者<remove>菜单
			if (flg) {
				ce('menuitem', m, {
					label: 'remove page',
					id: 'ssp_fn_remove',
					accesskey: 'r'
				})
			} else {
				ce('menuitem', m, {
					label: 'append page',
					id: 'ssp_fn_append',
					accesskey: 'a'
				})
			}

			// 加入设置菜单项 
			ce('menuitem', m, {
				label: 'setting',
				href: "chrome://ctrlctrl/content/ssp_setting.xul",
				id: 'ssp_fn_setting',
				accesskey: 's'
			},
			{
				command: itemClickProcessor
			})

			// 加入<site>菜单项
			ce('menu', m, {
				label: 'site',
				id: 'ssp_m_m'
			})
			ce('menupopup', 'ssp_m_m', {
				id: 'ssp_m_com'
			})

			for each(var site in mapping) {
				var t = site.host
				var p = ce('menu', 'ssp_m_com', {
					label: t,
					href: t,
					tooltiptext: t
				})
				ce('menupopup', p, {
					host: t
				},
				{
					popupshowing: genSubMenuItem
				})
			}

		}

		function genSubMenuItem(menu) {
			if (menu.target.childNodes.length > 0) return;

			var host = $Attr(menu.target, 'host'),
			site = mapping[host];

			for each(var page in site.pages) {
				ce('menuitem', menu.target, {
					label: page.title,
					href: page.url,
					tooltiptext: page.url
				})
			}
		}

		// 追加页面信息
		function append() {
			var pageInfo = {
				title: title,
				url: url
			}
			alert(title)
			var siteInfo = mapping[host];
			// 初始站点信息
			if (siteInfo == undefined) {
				siteInfo = {
					host: host,
					title: "",
					pages: []
				}
				mapping[host] = siteInfo
			}
			// 加入页面信息
			siteInfo.pages.push(pageInfo)
		}

		// 删除页面信息
		function remove() {
			if (!mapping[host]) var pages = mapping[host].pages
			for (var indx in pages) {
				if (pages[indx].url != url) continue;
				for (var s = parseInt(indx); s <= pages.length - 2; s++) {
					pages[s] = pages[1 + s]
				}
				pages.pop();
				if (pages.length == 0) {
					delete mapping[host]
				}
				break

			}

		}

		function popup(e) {
			var node = e ? e.target: gBrowser.selectedTab
			$('sspage_popup').openPopup(node, "after_end", 0, 0, false, false)
		}
	}
	this.init = init
	this.popup = popup

}).apply(CtrlCtrl.ns.sspage)

