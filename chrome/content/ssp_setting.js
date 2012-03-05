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
			// 加入站点及指定页信息
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
			//  选择对应站点
			if($('mi_'+host)) $("menu_site").selectedItem = $("mi_"+host)
			
		},
		
		handleEvent:function(event){
				let processorName = event.type+"Processor"
				if(typeof this[processorName] != "function")return;
				this[processorName](event);
		},
		
		// 站点菜单选择处理
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

		// 指定页偏移移动处理。（上下和拖曳使用）
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

		// 往列表加入指定页条目
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

		// 拖曳划过检查处理（同组判断）
		dragoverProcessor: function(event) {
			var targetDomain = event.dataTransfer.getData("domain");
			var item = this.getListItemFromEvent(event)
			itemBox = item.parentNode;
			if ($Attr(itemBox, "_domain") == targetDomain) {
				event.preventDefault()
			}
		},

		// 拖曳开始处理 （dataTransfor加入传递数据）
		dragstartProcessor: function(event) {
			if (this.crtListBox) {
				event.dataTransfer.setData('domain', $Attr(this.crtListBox, "_domain"))
				event.dataTransfer.setData('crtIndex', this.crtListBox.currentIndex)
			}
		},

		// 拖曳接触处理
		dropProcessor: function(event) {
			var item = this.getListItemFromEvent(event),
			indx = this.crtListBox.getIndexOfItem(item),
			targetIndx = event.dataTransfer.getData("crtIndex");
			if (indx != targetIndx) {
				this.movePosition(indx - targetIndx)
			}
		},

		// 获取richlist容器 (跳过description)
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

		// 数据对换
		exchangeData: function(domain, a, b) {
			var pages =this.mapping[domain].pages,
			tmp = pages[a];
			pages[a] = pages[b]
			pages[b] = tmp
			$SetPref2("mapping", this.mapping)
		},

		// 指定页条目对换
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

		// 条目点击事件处理 （保存当前的选择条目）
		clickProcessor: function(event) {
			var item = this.getListItemFromEvent(event)
			this.crtListBox = item.parentNode;
		}

	}
}

