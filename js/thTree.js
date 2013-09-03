/**
 * thTree.js
 * author: three
 * thTree 树图形编辑
 */

/**
 * 定义工具类
 */
var ThUtil = {};
// 字符串长度计算
ThUtil.lenStr = function(s) { 
	var l = 0; 
	if(!s) return l;
	var a = s.split(""); 
	for (var i=0;i<a.length;i++) { 
		if (a[i].charCodeAt(0)<299) { 
			l++; 
		} else { 
			l+=2; 
		} 
	} 
	return l; 
};
// 字符串截取：从0位置开始
ThUtil.subLenthStr = function(s, len) {
	
	if(ThUtil.lenStr(s)<=len) return s;
	
	var l = 0; 
	var endFlag = "...";
	var subStr = "";
	var a = s.split("");
	for (var i=0;i<a.length;i++) { 
		if (a[i].charCodeAt(0)<299) { 
			l++; 
		} else { 
			l+=2; 
		}
		subStr += a[i];
		if(l>len-4) break;
	} 
	return subStr+endFlag; 
};
// Adds all missing properties from second obj to first obj
ThUtil.extend = function(first, second){
    for (var prop in second){
        first[prop] = second[prop];
    }
};

// 加载js文件
ThUtil.loadJS = function(jsfile) {
	document.write('<script src="'+jsfile+'" type="text/javascript"></script>');
}

// 加载css文件
ThUtil.loadCSS = function(jsfile) {
	var container = document.getElementsByTagName("head")[0];
    var addStyle = document.createElement("link");
    addStyle.rel = "stylesheet";
    addStyle.type = "text/css";
    addStyle.media = "screen";
    addStyle.href = jsfile;
    container.appendChild(addStyle);
}

/**
 *  定义树类 MVC模式
 */
var th = th || {};

th.TreeModelFactory = function(o) {

	// 加载js 插件
	ThUtil.loadJS("js/plugins/expandBtn/expandBtn.js");
	ThUtil.loadCSS("js/plugins/expandBtn/expandBtn.css");
	
	this._options = {
		resource:'',
		type:'local',
		nodeId:'id',
		nodeName:'name',
		nodeUpId:'upNode',
		nodeNavi:'navi'
	};
	ThUtil.extend(this._options, o);
	
	this.model = new th.Model(this._options);
	this.getModel = function(){ return this.model; };
	this.NewTree = function(o) {
		ThUtil.extend(o, { model: this.model });
		var controller = new th.BaseTreeController(o);
		//controller.view.cntl=controller;
		controller.update();
		
		return controller;
	};
};

th.Model = function(o) {		
	this._options = {
		resource:'',
		type:'local', // server
		nodeId:'id',
		nodeName:'name',
		nodeUpId:'upNode',
		nodeNavi:'navi'
	};
	ThUtil.extend(this._options, o);
	
	this.observerSet = [];
	// 添加观察者
	this.attachObserver = function(obs) {
		for(var i=0; i<this.observerSet.length; i++) {
			if(this.observerSet[i] == obs) {
				return 0;
			}
		}
		this.observerSet[this.observerSet.length] = obs;
		
		return 0;
	};
	// 删除观察者
	this.detachObserver = function(obs) {
		var tmpObs = [];
		for(var i=0; i<this.observerSet.length; i++) {
			if(this.observerSet[i] != obs) {
				tmpObs[tmpObs.length] = this.observerSet[i];
			}
		}
		this.observerSet = tmpObs;
		return 0;
	};
	// 通知观察者
	this.notify = function() {
		for(var i=0; i<this.observerSet.length; i++) {
			this.observerSet[i].update();
		}
	};
	
	this.getData = function() {
		return this._generateTree();
	};
	
	this.getNodeData = function(id) {
		return this.dataMap[id];
	};
	// 修改节点数据
   	this.modifyNode = function(data) {
           
      ThUtil.extend(this.dataMap[data[this._options.nodeId]], data);
      
      this.notify();
   };	
	
	this._loadData();
};

th.Model.prototype = {
	dataMap: {},
	modelData: {},
	// 加载数据
	_loadData: function() {
		if('server'==this._options.type) { // 服务器数据
			
		} else { // 本地数据
			this.modelData = this._options.resource;
		}
	},
	// 生成树
	_generateTree: function() {
		var data = this.modelData;
		var dataTree = {};
		var tempMap = {};
		for(var i=0; i<data.length; i++) {
			var treeNode = {};
			treeNode['id'] = data[i][this._options.nodeId];
			treeNode['name'] = data[i][this._options.nodeName];
			treeNode['upNode'] = data[i][this._options.nodeUpId];
			treeNode['navi'] = data[i][this._options.nodeNavi];
			treeNode['child'] = [];
			if(this.dataMap[data[i][this._options.nodeId]]) {
				ThUtil.extend(this.dataMap[data[i][this._options.nodeId]],data[i]);
			} else {
				this.dataMap[data[i][this._options.nodeId]] = data[i];
			}
			tempMap[treeNode.id] = treeNode;
		}
		
		for(var id in tempMap) {
			var upNode = tempMap[id].upNode;
			if(upNode=='0') {
				dataTree = tempMap[id];
			} else {
				var childrenList = tempMap[upNode].child;
				childrenList[childrenList.length] = tempMap[id];
			}
		}
		
		return dataTree;
	}
};
/**
* 观察者，controller和viewer继承
*/
th.Observer = function(o) {
	this.model = o.model;
	this.update = function() {
		alert('收到更新通知');
	};
};

th.BaseTreeController = function(o) {
	th.Observer.apply(this, arguments);
	this.model.attachObserver(this);
	this._options = {
		cbDbClick: function($node, srcdata) {
		    alert('节点双击事件发生');
		},
	   
		cbClick: function($node, srcdata) {
		    alert('节点单击事件发生');
		},
	   
		cbContextMenu: function($node, srcdata) {
		    alert('节点右击事件发生');
		},		
		cbLoadAfter: function($node, srcdata) {
			//alert("加在完成后调用");
	   }
	};
	ThUtil.extend(this._options, o);
	
   
	viewo = {controller: this};
	ThUtil.extend(viewo, o);
	this.view = new th.BaseTreeView(viewo);
	
	this.update = function() {
		this.view.update();
	};
	
	// 外界操作接口
	this.cbDbClick = this._options.cbDbClick;
	this.cbClick = this._options.cbClick;
	this.cbContextMenu = this._options.cbContextMenu;
	// 加载后事件
	this.cbLoadAfter = this._options.cbLoadAfter;
	
	// 修改节点
	this.modifyNode = function(data) {
		this.model.modifyNode(data);
	};
	// 选择节点
	this.selectNode = function(dataId) {
		this.view.selectNode(dataId);
	}
};

th.BaseTreeView = function(o) {
	th.Observer.apply(this, arguments);
	this._options = {
		div:''
	};
	ThUtil.extend(this._options, o);
	this.cntl = this._options.controller;
	this.viewDiv = this._options.div;
	
	this.selectNode = function(dataId) {
		var selectNodes = [];
		var thisObj = this;
		$('#'+this.viewDiv).find('.TreeNode').find('.cont').removeClass("thSelectedNode");
		$('#'+this.viewDiv).find('.TreeNode').each(function(){
			if($(this).attr("id")==dataId)
			{
				var curNodeData = thisObj._options.model.dataMap[$(this).attr("id")];
				// 预留对条件选择
				$(this).find('.cont').addClass("thSelectedNode");
				selectNodes[selectNodes.length] = $(this);
			}
		});
		// 定位到选择的第一个节点
		if(selectNodes.length>0) {
			//selectNodes[0]

			var e=document.getElementById(thisObj.viewDiv);
			e.scrollTop=0;
			e.scrollLeft = 0;
			e.scrollTop=selectNodes[0].offset().top - $('#'+thisObj.viewDiv).height()/2;
			e.scrollLeft=selectNodes[0].offset().left - $('#'+thisObj.viewDiv).width()/2;
		}
		return selectNodes;
	};

	// 更新通知接口
	this.update = function() {
		this.layerCount = 0;
		$('#'+this.viewDiv).html('');
		$('#'+this.viewDiv).addClass('ThTree');
		this.showTree();
		this.bindEvent();
		this.bindPlugins();
	};
  	
	// 显示树，使用树的深度遍历
	this.showTree = function() {
		var dataTree = this.model.getData();
		this.showChildTree(dataTree, 0, 0);
	};
	this.nodeHeight = 63;
	this.nodeWidth = 150;
	// 显示子树
	this.showChildTree = function(node, lay, prev) {
		node.childTreeWidth = 1;

		var top = lay*this.nodeHeight;
		var left = this.nodeWidth* prev;
		var hr = 0;
		var hrleft = 0;

		var srcd = this.model.getNodeData(node.id)
		if(srcd.hideChild) {
			node.child=[];
		} else if(node.child) { // 显示子树
			if(node.child.length>0)
				node.childTreeWidth = 0;
			// 递归显示子树
			var prevW = prev;
			for(var i=0; i<node.child.length; i++) {
				node.childTreeWidth += this.showChildTree(node.child[i], lay+1, prevW);
				prevW += node.child[i].childTreeWidth;
			}

			if(node.child.length>1){
				var mete  = node.child[0].childTreeWidth + node.child[node.child.length-1].childTreeWidth;
				hr = this.nodeWidth*(node.childTreeWidth-mete/2.0)+2;	
				
				if(node.childTreeWidth>1) {
					left = left + this.nodeWidth* node.childTreeWidth/2.0 - this.nodeWidth/2;
				}

				hrleft = this.nodeWidth*node.child[0].childTreeWidth/2.0 - (this.nodeWidth* node.childTreeWidth/2.0 - this.nodeWidth/2)-15;
			}
		} 

		var hasTop = (lay==0?false:true);
		var hasBottom = (node.child!=undefined && node.child.length>0?true:false);
		this.showNode(node, left, top, hr, hasTop, hasBottom, hrleft);

		return node.childTreeWidth;
	};

	// 解析显示节点
	this.showNode = function(node, left, top, hr, hasTop, hasBottom, hrleft) {
		var hasHideNode = this.model.getNodeData(node.id).hideChild || hasBottom?"":"display:none;";
		var textShowLength = 16;
		var hasTop = hasTop?"":"display:none;";
		var hasBottom = hasBottom?"":"display:none;";
		var nodeHtml = '<div id="'+node.id+'" class="TreeNode" upNode="'+node.upNode+
						'" style="left:'+left+'px; top:'+top+'px">'+
							'<div class="cont" title="'+node.name+'">'+ThUtil.subLenthStr(node.name, textShowLength)+'</div>'+
							'<div style="clear:both"></div>'+
							'<div class="top-line" style="left: 60px; top:-22px;'+hasTop+'">'+node.childTreeWidth+'</div>'+
							'<div class="bottom-line" style="left: 60px;'+hasBottom+'"></div>'+
							'<div class="hr-line" style="left: '+hrleft+'px;top: 40px;'+hasBottom+' width: '+hr+'px;"></div>'+
							'<div class="expendBtn" style="'+hasHideNode+'"></div>'+
						'</div>';
		
		$('#'+this.viewDiv).append(nodeHtml);
		
	};
	
	// 绑定event操作
	this.bindEvent = function() {
		var thisObj = this;
		$('#'+this.viewDiv).find('.TreeNode').on('dblclick',function(){
			
			var srcData = thisObj.getNodeSrcData($(this));
			return thisObj.cntl.cbDbClick($(this), srcData);
			
		}).on('contextmenu', function(){
			// 弹出邮件菜单
			var srcData = thisObj.getNodeSrcData($(this));
			return thisObj.cntl.cbContextMenu($(this), srcData);
			
		}).on('click', function(){
		   var srcData = thisObj.getNodeSrcData($(this));
			return thisObj.cntl.cbClick($(this), srcData);
		});
	};
	// 绑定插件
	this.bindPlugins = function() {
	
		var thisObj = this;
		/************ 子节点扩展插件 *******************/
		
		$('#'+this.viewDiv).find('.TreeNode').each(function(){
			var $node = $(this);
			var expend = true;
				
			// 判断是否隐藏节点
			var srcData = thisObj.getNodeSrcData($node);
			if(srcData && srcData.hideChild) {
				expend = false;
			} 
			
			// 调整展开子节点按钮
			$node.children('.expendBtn').expandBtn({
				radius: 6,
				opacity: '0.5',
				expend: expend,
				expendfn: function(){
					var srcData = thisObj.getNodeSrcData($node);
					srcData.hideChild=false;
					thisObj.model.modifyNode(srcData);
					
					event.stopPropagation();
				},
				collapsefn: function() {
					var srcData = thisObj.getNodeSrcData($node);
					
					srcData.hideChild=true;
					
					thisObj.model.modifyNode(srcData);
					
					event.stopPropagation();
				}
			}).css({"position": "absolute", 
					"left":($(this).width()/2-10)+"px", 
					"top":($(this).height()/2)+"px"});	
		});
		/************ 子节点扩展插件 *******************/
		
	};

	// 得到节点原始数据
	this.getNodeSrcData = function($node) {
		return this.model.getNodeData($node.attr('id'));
	};
};

