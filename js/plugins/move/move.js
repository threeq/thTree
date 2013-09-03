(function($){
	$.fn.enableMoveDiv = function(options){
		
		var defaults = {
		    before:function(){},
		    readiness:function(){},
            move:function(){},
            end:function(){},
            collideSiblings:function(){}
		};
		var opts = $.extend({}, defaults, options);
	    // 初始化操作	
		var initEnableMoveDiv = function($obj) {
			$(this).addClass('EnableMove');
			$(this).unbind('mousemove')
					.unbind('mousedown')
					.unbind('mouseup');
			$obj.mousedown(function(event){
                
                var offset = $(this).offset(); 
                _x=event.clientX-offset.left; 
                _y=event.clientY+20-offset.top; 
			    $(this).mousemove(function(event){
                    _xx=event.clientX-_x;
                    _yy=event.clientY-_y; 
                    $(this).css('left', _xx);
                    $(this).css('top', _yy);
                    return false; 
                });
            });
            $obj.mouseup(function(e){
                $(this).removeClass('EnableMove');
                $(this).unbind('mousemove');
                return false;
            });
            $obj.mouseleave(function(e){
                $(this).removeClass('EnableMove');
                $(this).unbind('mousemove');
                return false;
            });
		};
		
		return this.each(function() {
			var $this = $(this);    
			initEnableMoveDiv($this); // 初始化
			
		}); 
	};

})(jQuery);  
