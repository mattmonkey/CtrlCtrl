if (typeof CtrlCtrl != "undefined") {
	CtrlCtrl.ns.sspsetting = {}
}

(function() {

	with(CtrlCtrl.lib) {
		var crtListBox, mapping = $GetPref2("mapping");

		// ------ public method ------
		// ҳ���ʼ��
		this.init = function() {

			// ����վ�㼰ָ��ҳ��Ϣ
			for (var domain in mapping) {
				ce("menuitem", "menup_site", {
					label: domain,
					cmd: domain
				})
				var pages = mapping[domain].pages
				var indx = 0;
				if (pages && pages.length > 0) {
					var gbox = ce("groupbox", "vbox_pages", {
						_domain: domain,
					})
					var rbox = ce("richlistbox", gbox, {
						_domain: domain,
					},
					{
						click: processor,
						dragover: dragoverProcessor,
						dragstart: dragstartProcessor,
						drop: dropProcessor
					})
					ce("caption", gbox, {
						label: domain
					})
					for each(var page in pages) {
						appendPageInfo(rbox, page, domain, indx)
					}
				}
			}
		}

		// վ��˵�ѡ����
		this.menuSelectProcessor = function(event) {
			var cmd = $Attr(event.target.selectedItem, "cmd")
			var elms = document.getElementsByTagName("groupbox");
			for (var i = 0; i < elms.length; i++) {
				var elm = elms[i];
				if (cmd == "all") {
					elm.collapsed = false;
				} else {
					$Attr(elm, "collapsed", $Attr(elm, "_domain") != cmd)
				}
			}
		}

		// ָ��ҳƫ���ƶ����������º���ҷʹ�ã�
		this.movePosition = function(offset) {
			var p = crtListBox.currentIndex,
			domain = $Attr(crtListBox, "_domain"),
			rowCount = crtListBox.getRowCount();
			// ����ʱ��Ѱ��Ŀ�꣨p+offset����������һ����
			// ����ʱ��Ѱ��Ŀ��
			var p2 = p + offset
			if (p2 >= 0 && p2 <= rowCount - 1) {
				exchange(domain, p, p2)
			}
			crtListBox.focus();
		}

		//---------private method--------------
		// ���б����ָ��ҳ��Ŀ
		function appendPageInfo(container, page, domain, indx) {
			var item = ce("richlistitem", container, {
				id: page.url,
				_index: indx,
				_url: page.url,
				_title: page.title,
				_domain: domain,
				draggable: "true",
			})
			ce("description", item, {
				value: page.title,
				class: "header",
				tooltiptext: page.url
			})
		}

		// ��ҷ������鴦��ͬ���жϣ�
		function dragoverProcessor(event) {
			var targetDomain = event.dataTransfer.getData("domain");
			var item = getListItemFromEvent(event)
			itemBox = item.parentNode;
			if ($Attr(itemBox, "_domain") == targetDomain) {
				event.preventDefault()
			}
		}

		// ��ҷ��ʼ���� ��dataTransfor���봫�����ݣ�
		function dragstartProcessor(event) {
			if (crtListBox) {
				event.dataTransfer.setData('domain', $Attr(crtListBox, "_domain"))
				event.dataTransfer.setData('crtIndex', crtListBox.currentIndex)
			}
		}

		// ��ҷ�Ӵ�����
		function dropProcessor(event) {
			var item = getListItemFromEvent(event),
			indx = crtListBox.getIndexOfItem(item),
			targetIndx = event.dataTransfer.getData("crtIndex");
			if (indx != targetIndx) {
				CtrlCtrl.ns.sspsetting.movePosition(indx - targetIndx)
			}
		}

		// ��ȡrichlist���� (����description)
		function getListItemFromEvent(event) {
			var item = event.target
			if (event.target.tagName == "description") {
				item = event.target.parentNode;
			}
			return item;
		}

		function exchange(domain, a, b) {
			var indx = exchangeItem(a, b);
			if (indx != - 1) {
				exchangeData(domain, a, b);
			}
		}

		// ���ݶԻ�
		function exchangeData(domain, a, b) {
			var pages = mapping[domain].pages,
			target,
			tmp;
			tmp = pages[a];
			pages[a] = pages[b]
			pages[b] = tmp
			setPref(mapping,"mapping")
		}

		// ָ��ҳ��Ŀ�Ի�
		function exchangeItem(a, b) {
			try {
				var refElm = crtListBox.getItemAtIndex(b)
				var tmpElm = refElm.cloneNode(true);
				var objElm = crtListBox.removeItemAt(a);
				crtListBox.replaceChild(objElm, refElm);
				crtListBox.insertBefore(tmpElm, crtListBox.getItemAtIndex(a));
			} catch(e) {
				return - 1;
			}
		}

		// ��Ŀ����¼����� �����浱ǰ��ѡ����Ŀ��
		function processor(event) {
			var item = getListItemFromEvent(event)
			crtListBox = item.parentNode;
		}
	}

}).apply(CtrlCtrl.ns.sspsetting);

