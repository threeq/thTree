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
			if($(this).attr('isNull')!='isNull' && $(this).attr("id")==dataId)
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
		this.appendElement();
		this.adjustmentView();
		this.bindEvent();
		this.clearNull();

		var thisObj = this;
		$('#'+this.viewDiv).find('.TreeNode').each(function(){
			if($(this).attr('isNull')!='isNull')
			{
				thisObj.cntl.cbLoadAfter($(this), thisObj._options.model.dataMap[$(this).attr("id")]);
			}
		});
	};
	this.clearNull = function() {
		var thisObj = this;
		$('#'+this.viewDiv).find('.TreeNode').each(function(){
			if($(this).attr('isNull')=='isNull')
			{
				$(this).hide();
			}
		});
		$('#'+this.viewDiv).find('.TreeNode').each(function(){
			var $node = $(this);
			var expend = true;
			
			if(!thisObj.hasChildrenVisible($node)) {
				$(this).children('.bottom-line').hide();
				$(this).children('.hr-line').hide();
				
				// 判断是否隐藏节点
				var srcData = thisObj.getNodeSrcData($node);
				
				if(srcData) {
					
					if(srcData.hideChild) {
						expend = false;
					} else {
						
						$(this).children('.expendBtn').hide();
					}
				}
				
			} else {
				expend = true;
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
		
	};

  	// 放入树元素，使用树的层次遍历（广度遍历）
	this.appendElement = function() {
		var dataTree = this.model.getData();
		var stack1 = [dataTree];
		var stack2 = [];
		var stackpop = stack1.length;
		while(stackpop>0) {
			this.layerCount++; // 记录层数
			$('#'+this.viewDiv).append('<div id="'+this.viewDiv+'layer-'+this.layerCount+'" class="tree-layer"></div>');
			
			while(stackpop>0) {
				var node = stack1[--stackpop];
				this.showNode(node);
				var srcd = this.model.getNodeData(node.id);
				
				try {
					if(srcd) {
						
						if(!srcd.hideChild) {
							
							if(node.child){
								for(var i=node.child.length-1; i>=0; i--) {
									stack2[stack2.length] = node.child[i];
								}
							}
						} else {
							node.child = [];
						}
					}
				}catch(e){
					alert(JSON.stringify(srcd));
				}
								
			}
			//对没有子元素的节点，填充 null 元素
			
			if(stack2.length>0) {
				stackpop = stack1.length;
				while(stackpop>0) {
					var node = stack1[--stackpop];
					
					if(node.child.length==0) {
						var el = {};
						el.id="null"+node.id;
						el.name=node.name;
						el.upNode = node.id;
						el.child = [];
						el.isNull = "isNull";
						node.child[node.child.length] = el;
					}
				}
				stack2 = [];
				stackpop = stack1.length;
				while(stackpop>0) {
					var node = stack1[--stackpop];
					for(var i=node.child.length-1; i>=0; i--) {
						stack2[stack2.length] = node.child[i];
					}
				}
			}
			
			stack1 = stack2;
			stack2 = [];
			stackpop = stack1.length;
			$('#'+this.viewDiv+'layer-'+this.layerCount).append('<div style="clear:both"></div>');
		}
		$('#'+this.viewDiv).append('<div style="clear:both"></div>');
	};
	// 解析显示节点
	this.showNode = function(node) {
		var textShowLength = 16;
		
		var nodeHtml = '<div id="'+node.id+'" class="TreeNode" upNode="'+node.upNode+'" isNull="'+node.isNull+'" >'+
							'<div class="cont" title="'+node.name+'">'+ThUtil.subLenthStr(node.name, textShowLength)+'</div>'+
							'<div style="clear:both"></div>'+
							'<div class="top-line">'+node.navi+'</div>'+
							'<div class="bottom-line"></div>'+
							'<div class="hr-line"></div>'+
							'<div class="expendBtn"></div>'+
						'</div>';
		
		$('#'+this.viewDiv+'layer-'+this.layerCount).append(nodeHtml);
		
	};
	// 调整树界面
	this.adjustmentView = function() {
		
		var thisObj = this;
		var baseTop = $('#'+this.viewDiv).offset().top+5;
		var baseLeft = $('#'+this.viewDiv).offset().left;
		var stepLeft = 10;
		var stepTop = 60;
		
		var layerCount = this.layerCount;
		var leftCount = 0;
		
		var hasChildNodeId = [];
		for(var i=layerCount; i>0; i-- ){
			leftCount = 0;
			
			$.each($('#'+this.viewDiv+'layer-'+i).children('.TreeNode'), function(j, node){
				var hasChild = thisObj.hasChildren($(node));
				
				if(hasChild.flag) { // 有子元素
					$(node).children('.hr-line').css("top",hasChild.hr_lineTop);
					$(node).children('.hr-line').css("left",-1*hasChild.hr_width/2 + $(node).width()/2-4);
					$(node).children('.hr-line').css("width",hasChild.hr_width);
					
					var tempChildSupplyLeft = hasChild.hr_lineLeft + hasChild.hr_width/2 -baseLeft - $(node).width()/2 - stepLeft/2 + 4;
					var timetop = (i-1)*stepTop + baseTop;
					thisObj.adjustmentNode($(node), tempChildSupplyLeft, timetop);
					
				} else {
					// 取前一个元素
					var tempLeft = stepLeft;
					var tempTop = (i-1)*stepTop + baseTop;
					if($(node).prev().attr('class')=='TreeNode') {
						tempLeft = $(node).prev().position().left + $(node).prev().width() + stepLeft;
					}
					thisObj.adjustmentNode($(node), tempLeft, tempTop);
					$(node).children('.bottom-line').hide();
					$(node).children('.hr-line').hide();
					
				}				
				leftCount += $(node).width();
			});
		}
	};
	// 节点调整
	this.adjustmentNode = function($node, left, top) {
		
		$node.css("left", left);
		$node.css("top", top);
		
		
		$node.children('.bottom-line').css("left",$node.width()/2-5);
		$node.children('.top-line').css("top",-1*$node.height()+9);
		$node.children('.top-line').css("left",$node.width()/2-5);
			
		if($node.attr("upNode")==null || $node.attr("upNode")=="0")
			$node.children('.top-line').hide();
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
	// 得到节点原始数据
	this.getNodeSrcData = function($node) {
		return this.model.getNodeData($node.attr('id'));
	};
	// 判断是否有子节点，并返回相应参数
	this.hasChildren = function($node) {
		var upNode = {};
		upNode.flag = false;
		upNode.hr_lineLeft = 0;
		upNode.hr_lineTop = 0;
		upNode.hr_width = 0;
		
		var isFirst = true;

		var layerId = $node.parent().attr('id');
		var childLayerId = layerId.split("-")[0]+"-"+(parseInt(layerId.split("-")[1])+1);
		
		var tempLeft = -1;
		var tempRight = -1;
		var $xx = {};
		$.each($("#"+childLayerId).children('.TreeNode'), function(i, childNode){
			if($(childNode).attr("upNode")==$node.attr('id')) {
				$xx = $(childNode).children('.top-line:first');
				if(isFirst) {
					upNode.flag = true;
					isFirst = false;
					tempRight = tempLeft = $xx.offset().left;
					
				}
				var temp = $xx.offset().left;
				if(temp < tempLeft) {
					tempLeft = temp;
				} else if(temp > tempRight) {
					tempRight = temp;
				}
			}
			
		});
		$xx = $node.children('.bottom-line:first');
		upNode.hr_lineTop = $xx.position().top + $xx.height()-1;
		upNode.hr_lineLeft = tempLeft;
		upNode.hr_width = tempRight - tempLeft;
		
		return upNode;
	};
	
	this.hasChildrenVisible = function($node) {
		var visibleFlag = false;

		var layerId = $node.parent().attr('id');
		var childLayerId = layerId.split("-")[0]+"-"+(parseInt(layerId.split("-")[1])+1);
		
		$.each($("#"+childLayerId).children('.TreeNode'), function(i, childNode){
			if($(childNode).attr("upNode")==$node.attr('id')) {
				if($(childNode).is(":visible")) { visibleFlag = true; return;}
			}
		});
		
		return visibleFlag;
	};
	
};

