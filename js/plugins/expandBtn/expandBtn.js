(function($){
	$.fn.expandBtn = function(options){
		var inHtml = '<div class="r"></div><div class="c"></div>';
		var defaults = {
			radius: 10,
			opacity: '0.2',
			expend: true,
			expendfn: function(){},
			collapsefn: function() {}
		};
		var opts = $.extend({}, defaults, options);
		
		// ��ʼ�������ʽ
		var initBtnCSS = function($self) {
			$self.html(inHtml);
			$self.addClass('EX');
			if(opts.expend) {
				$self.addClass('circle-x');
				resizeBtn($self, true);
			} else {
				$self.addClass('circle-s');
				resizeBtn($self, false);
			}
			$(this).css('opacity',opts.opacity);
		};
		// ��������С
		var resizeBtn = function($self, isExpend) {
			$self.css({
				"width": opts.radius*2+"px",
				"height": opts.radius*2+"px",
				"-moz-border-radius": opts.radius+"px",
				"-webkit-border-radius": opts.radius+"px",
				"border-radius": opts.radius+"px"
			});
			opts.radius*2 * 0.2
			$self.find('.r').css({
				"left": opts.radius*2 * 0.2+"px",
				"top": opts.radius*2 * 0.4+"px",
				"border-width": opts.radius*2 * 0.1+"px",
				"width": opts.radius*2 * 0.4+"px",
				"height":"0px"
			});
			$self.find('.c').css({
				"left": opts.radius*2 * 0.4+"px",
				"top": "0px",
				"border-width": opts.radius*2 * 0.1+"px",
				"width": "0px",
				"height": opts.radius*2 * 0.4+"px"
			});
		}
		// ��ʼ������¼�
		var initBtnEvent = function($self) {
			$self.on('click',function(){
				if($(this).hasClass('circle-x')) { // ����
					$(this).removeClass('circle-x');
					$(this).addClass('circle-s');
					opts.collapsefn();
				} else {                          // չ��
					$(this).removeClass('circle-s');
					$(this).addClass('circle-x');
					opts.expendfn();
				}
			}).on('mouseover',function(){
				$(this).css('opacity','1.0');
			}).on('mouseout',function(){
				$(this).css('opacity',opts.opacity);
			});
		};
		
		return this.each(function() {
			var $this = $(this);    
			initBtnCSS($this); // ������ʽ
			initBtnEvent($this); // ���¼�
			
		}); 
	};

})(jQuery);  