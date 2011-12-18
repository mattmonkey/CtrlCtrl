with(CtrlCtrl.lib) {
	var SettingHandler = {
		crtListBox: null,
		mapping: $GetPref2("mapping"),

		load: function() {
			let host = window.arguments[0];
			this.initUI(host);
		},

		initUI: function(host) {
			var self = this;
			// ����վ�㼰ָ��ҳ��Ϣ
			for (var domain in this.mapping) {
				ce("menuitem", "menup_site", {
					label: domain,
					cmd: domain,
					id: "mi_" + domain,
				})
				var pages = this.mapping[domain].pages
				var indx = 0;
				if (pages && pages.length > 0) {
					var gbox = ce("groupbox", "vbox_pages", {
						_domain: domain,
					})
					var rbox = ce("richlistbox", gbox, {
						_domain: domain,
					},
					{
						click: self,
						dragover: self,
						dragstart: self,
						drop: self
					})
					
					ce("caption", gbox, {
						label: domain
					})
					for each(var page in pages) {
						this.appendPageInfo(rbox, page, domain, indx)
					}
				}
			}
			//  ѡ���Ӧվ��
			if($('mi_'+host)) $("menu_site").selectedItem = $("mi_"+host)
			
		},
		
		handleEvent:function(event){
				let processorName = event.type+"Processor"
				if(typeof this[processorName] != "function")return;
				this[processorName](event);
		},
		
		// վ��˵�ѡ����
		menuSelectProcessor: function(event) {
			var cmd = $Attr(event.target.selectedItem, "cmd")
			var elms = document.getElementsByTagName("groupbox");
			for (var i = 0; i < elms.length; i++) {
				var elm = elms[i];
				if (cmd == "all") {
					elm.collapsed = false;
				} else {
					$Attr(elm, "collapsed", $Attr(elm, "_domain") != cmd)
				}
				elm.firstChild.selectedIndex = 0;
			}
		},

		// ָ��ҳƫ���ƶ����������º���ҷʹ�ã�
		movePosition: function(offset) {
			var p = this.crtListBox.currentIndex,
			domain = $Attr(this.crtListBox, "_domain"),
			rowCount =this.crtListBox.getRowCount();
			var p2 = p + offset
			if (p2 >= 0 && p2 <= rowCount - 1) {
				this.exchange(domain, p, p2)
			}
			this.crtListBox.focus();
		},

		remove : function(){
			if(!this.crtListBox)return;
			let title = $Attr(this.crtListBox.selectedItem,"_title")
			let domain = $Attr(this.crtListBox.selectedItem,"_domain")
			if(confirm($GenStr("[remove] %1 ?",title))){
				this.mapping[domain].pages.splice(this.crtListBox.selectedIndex,1);
				$SetPref2("mapping", this.mapping)
				this.crtListBox.removeItemAt(this.crtListBox.selectedIndex)
			}

		},

		rename:function(){
			if(!this.crtListBox)return;
			var title = $Attr(this.crtListBox.selectedItem, "_title");
			var newTitle =prompt($GenStr("[rename ?] %1",title),title).trim(); 
			if(newTitle){
				$Attr(this.crtListBox.selectedItem,"_title",newTitle);
				$Attr(this.crtListBox.selectedItem.firstChild,"value",newTitle);
				let domain = $Attr(this.crtListBox.selectedItem,"_domain");
				this.mapping[domain].pages[this.crtListBox.selectedIndex].title = newTitle;
				$SetPref2("mapping", this.mapping);
			}
		},

		// ���б����ָ��ҳ��Ŀ
		appendPageInfo: function(container, page, domain, indx) {
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
		},

		// ��ҷ������鴦��ͬ���жϣ�
		dragoverProcessor: function(event) {
			var targetDomain = event.dataTransfer.getData("domain");
			var item = this.getListItemFromEvent(event)
			itemBox = item.parentNode;
			if ($Attr(itemBox, "_domain") == targetDomain) {
				event.preventDefault()
			}
		},

		// ��ҷ��ʼ���� ��dataTransfor���봫�����ݣ�
		dragstartProcessor: function(event) {
			if (this.crtListBox) {
				event.dataTransfer.setData('domain', $Attr(this.crtListBox, "_domain"))
				event.dataTransfer.setData('crtIndex', this.crtListBox.currentIndex)
			}
		},

		// ��ҷ�Ӵ�����
		dropProcessor: function(event) {
			var item = this.getListItemFromEvent(event),
			indx = this.crtListBox.getIndexOfItem(item),
			targetIndx = event.dataTransfer.getData("crtIndex");
			if (indx != targetIndx) {
				this.movePosition(indx - targetIndx)
			}
		},

		// ��ȡrichlist���� (����description)
		getListItemFromEvent: function(event) {
			var item = event.target
			if (event.target.tagName == "description") {
				item = event.target.parentNode;
			}
			return item;
		},

		exchange: function(domain, a, b) {
			var indx = this.exchangeItem(a, b);
			if (indx != - 1) {
				this.exchangeData(domain, a, b);
			}
		},

		// ���ݶԻ�
		exchangeData: function(domain, a, b) {
			var pages =this.mapping[domain].pages,
			tmp = pages[a];
			pages[a] = pages[b]
			pages[b] = tmp
			$SetPref2("mapping", this.mapping)
		},

		// ָ��ҳ��Ŀ�Ի�
		exchangeItem: function(a, b) {
			try {
				var refElm = this.crtListBox.getItemAtIndex(b)
				var tmpElm = refElm.cloneNode(true);
				var objElm = this.crtListBox.removeItemAt(a);
				this.crtListBox.replaceChild(objElm, refElm);
				this.crtListBox.insertBefore(tmpElm, this.crtListBox.getItemAtIndex(a));
			} catch(e) {
				return - 1;
			}
		},

		// ��Ŀ����¼����� �����浱ǰ��ѡ����Ŀ��
		clickProcessor: function(event) {
			var item = this.getListItemFromEvent(event)
			this.crtListBox = item.parentNode;
		}

	}
}

