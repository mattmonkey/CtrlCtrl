if (typeof CtrlCtrl != "undefined") {
	CtrlCtrl.ns.markers = {}
}

(function() {
	with(CtrlCtrl.lib) {
		var optype = "",
		headings = [],
		GENTYPE = {
			ROOT: 1,
			CONTENTS: 2,
			AUTOMARK: 3
		},
		myScope = this;

		function init() {
			genMenu(GENTYPE.ROOT);
			var appcontent = document.getElementById("appcontent")
			if (appcontent) appcontent.addEventListener("DOMContentLoaded", loadDocument);
		}

		function loadDocument(e) {
			if (e.originalTarget.nodeName != "#document") return;
			
			var aPageMark = getAPageMark(e.originalTarget);
			moveToPageMark(aPageMark);

			// if(aPageMark.type) e.originalTarget.defaultView.addEventListener("unload", autoMarkPage);
		}

		// TODO 缓存处理入口 
		function getAPageMark(aDoc) {

			var url = aDoc.defaultView.location.href,
			markedData = $GetPref2("lastedmarks")[url];
			if (markedData) {
				markedData.url = url;
				markedData.range = markedData.ranges[0];
			}

			return markedData
		}

		function itemClickProcessor(e) {
			var type = $Attr(e.target, 'itype')
			if (type == "contents") {
				var heading = headings[$Attr(e.target, "hindx")];
				heading.scrollIntoView();
			} else if (type == "pagemarks") {
				openPage($Attr(e.target, "markurl"),!e.ctrlKey)
			}
		}

		function menuCreater(e) {
			$Log("call menuCreater : " + e.target.id)
			if (e.target.id == 'marker_popup') {
				$Clean(e.target);
				var data = initMenuData(optype);
				genMenu(optype, e.target, data);
			}
		}

		function isVisible(node) {
			if (!node) return false;
			var scrollTop = $Doc.documentElement.scrollTop,
			visibleHeight = $Doc.documentElement.clientHeight;
			return node.offsetTop >= scrollTop && (node.offsetTop <= scrollTop + visibleHeight)
		}

		function evaluate(xpath) {
			var isText = /\/#text$/.test(xpath);
			var path = isText ? xpath.slice(0, - 6) : xpath;
			var rslt = $Doc.evaluate(path, $Doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
			if (rslt.singleNodeValue && isText) {
				$Log("call evaluate : " + xpath + " childNodes " + rslt.singleNodeValue.childNodes.length);
				rslt = rslt.singleNodeValue.childNodes.length > 0 ? rslt.singleNodeValue.childNodes[0] : rslt;
			}
			return rslt;
		}

		function markPage() {
			// 网页卷去的高度
			var scrollTop = $Doc.documentElement.scrollTop,
			aRangeData = getSelectionAnge($Win),
			markedDatas = $GetPref2("lastedmarks"),
			url = $Win.location.href,
			title = $Doc.title;

			$Log("call markPage : " + url);
			$Log("call markPage : " + title);
			$Log("call markPage : " + scrollTop);
			$Log("call markPage : " + aRangeData);
		

			if (!markedDatas) markedDatas = {};

			markedDatas[url] = {
				scroll: scrollTop,
				ranges: [aRangeData],
				title: title
			}
			$SetPref2("lastedmarks", markedDatas);
		}

		function unMarkPage() {
			var data = $GetPref2("lastedmarks"),
			url = $Doc.location.href;

			if (data) {
				delete data[url];
				$SetPref2("lastedmarks", data);
			}
		}

		function getSelectionAnge(aWin) {
				
			// TODO 暂时只处理第一个range。
			var rangeIndx = -1;
			for(var i = 0 ;i < aWin.getSelection().rangeCount;i++){
			$Log("call getSelectionAnge  count : " + aWin.getSelection().rangeCount)
				if(!aWin.getSelection().getRangeAt(i).collapsed){
					rangeIndx = i;	
					break;
				}
			}	
			if (rangeIndx == -1 ) return null;


			var aRange = aWin.getSelection().getRangeAt(rangeIndx),
			startNode = aRange.startContainer,
			endNode = aRange.endContainer,
			startOffset = aRange.startOffset,
			endOffset = aRange.endOffset,
			xpath = getXpath(startNode),
			xpath2 = getXpath(endNode),
			offset = startOffset,
			offset2 = endOffset;

			$Log("==\nreport:\n" + xpath + "\n offset start" + startOffset + "\n" + xpath2 + "\n offset end" + endOffset);

			return [xpath, offset, xpath2, offset2];
		}

		function selectRange(sNode, sOffset, eNode, eOffset) {
			$Log("call selectRange : sNode " + sNode);
			$Log("call selectRange : sOffset " + sOffset);
			$Log("call selectRange : sNode " + eNode);
			$Log("call selectRange : sOffset " + eOffset);
			var sel = $Win.getSelection();
			var aRange = $Doc.createRange();
			try{
				aRange.setStart(evaluate(sNode), sOffset);
				$Log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
				aRange.setEnd(evaluate(eNode), eOffset);
				sel.addRange(aRange);
				return aRange;
			}catch(e){
				$Log("call selectRange " + e)
			}
		}

		function moveToPageMark(aPageMark) {
			if (!aPageMark) return;

			if (aPageMark.range && aPageMark.range.length > 0) {
				selectRange.apply(myScope, aPageMark.range)
			}
			
			$Log("call moveToPageMark : " + aPageMark.scroll)
			$Win.scrollTo(0, aPageMark.scroll)
			showMarkArea();
		}

		function getXpath(obj) {
			var arr = [],
			iTemp = 0;
			function getTagIndex(tag) {
				var begin = 0;
				var firstChild = tag.parentNode.firstChild;
				while (firstChild) {
					if (firstChild == tag) return begin == 0 ? "": "[" + (begin + 1) + "]";
					if (firstChild.nodeType == 1 && firstChild.tagName == tag.tagName) begin++;
					firstChild = firstChild.nextSibling
				}
				return ""
			}
			while (obj) {
				arr[iTemp++] = obj.nodeName + getTagIndex(obj);
				if (obj.tagName != "HTML") obj = obj.parentNode;
				else break
			}
			return "/" + arr.reverse().join("/");
		}

		function popup(args) {
			optype = args;
			$('marker_popup').openPopup(gBrowser.selectedTab, "after_end", 0, 0, false, false)
		}

		// form localmark.uc.xul
		function showMarkArea() {
			let inteval = 200;
			for (var i = 0; i < 4; i++, inteval += 200) {
				if (i % 2 != 0) {
					setTimeout(function() {
						gBrowser.style.borderWidth = null;
						gBrowser.style.borderStyle = null;
						gBrowser.style.borderColor = null;
					},
					inteval);
				} else {
					setTimeout(function() {
						gBrowser.style.borderWidth = "3px";
						gBrowser.style.borderStyle = "solid";
						gBrowser.style.borderColor = "blue";
					},
					inteval);
				}
			}
		}

		function initMenuData(type) {
			if (type == GENTYPE.CONTENTS) {
				var tags = $GetPref2("tags");
				headings = [];
				for each(var tag in tags) {
					var list = $Doc.getElementsByTagName(tag);
					for (var i = 0; i < list.length; i++) {
						headings.push(list[i])
					}
				}
				headings.sort(function(n, n2) {
					return n.offsetTop > n2.offsetTop
				})
			} else if (type == GENTYPE.AUTOMARK) {
				return $GetPref2("lastedmarks");
			}

		}

		function genMenu(type, node, data) {
			var markFlg = false,indx=0;

			if (type == GENTYPE.ROOT) { // -----------------------------根菜单
				ce('menupopup', 'sspage_menu_root', {
					id: 'marker_popup'
				},
				{
					command: itemClickProcessor,
					popupshowing: menuCreater
				})
			} else if (type == GENTYPE.CONTENTS) { //-----------------------------书目菜单
				for (indx = 0; indx < headings.length; indx++) {
					var heading = headings[indx],
					content = heading.textContent,
					color = isVisible(heading) ? "blue": "";

					if (content.trim() == "") continue;

					ce('menuitem', node, {
						label: content,
						hindx: indx,
						itype: "contents",
						style: "color:" + color,
						accesskey: indx < 8 ? indx + 1: ""
					})
				}

				ce('menuseparator', node);

				ce('menuitem', node, {
					label: 'Top',
					accesskey: 'W',
					oncommand: "CtrlCtrl.lib.$Win.scrollTo(0,0)"
				})

				ce('menuitem', node, {
					label: 'Bottom',
					accesskey: 'S',
					oncommand: " CtrlCtrl.lib.$Win.scrollTo(0,99999)"
				})

				ce('menuitem', node, {
					label: 'Goto Input',
					accesskey: 'Q',
				},
				{
					command: function() {
						var list = $Doc.getElementsByTagName("input")
						for (var i = 0; i < list.length; i++) {
							var elm = list[i];
							if (elm.getAttribute("type") == "text" || ! elm.getAttribute("type")) {
								elm.select();
								elm.focus();
								break;
							}
						}
					}
				})

			} else if (type == GENTYPE.AUTOMARK) { //-------------页面标记菜单
				// 加入一个分隔线
				for (var url in data) {
					$Log("gen page mark :" + url);
					if (url == $Win.location.href) {
						markFlg = true;
						//continue;
					}

					ce('menuitem', node, {
						label: data[url].title,
						tooltiptext: url,
						markurl: url,
						itype: "pagemarks",
						accesskey: indx < 8 ? 1+(indx++) : ""
					});
				}

				ce('menuseparator', node)

				ce('menuitem', node, {
					label: 'Mark',
					id: 'marker_fn_auto',
					accesskey: 'v',
					style: "color:" + (markFlg ? "blue": "red")
				},
				{
					command: function(e) {
						markPage();
						showMarkArea();
					}
				})

				if (markFlg) {
					// 显示<append>或者<remove>菜单
					ce('menuitem', node, {
						label: 'remove mark',
						id: 'marker_fn_append',
						accesskey: 'c'
					},
					{
						command: unMarkPage
					})
				}

			}
		}
	}

	this.init = init
	this.popup = popup

}).apply(CtrlCtrl.ns.markers)

