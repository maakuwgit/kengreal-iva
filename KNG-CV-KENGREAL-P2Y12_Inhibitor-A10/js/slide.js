( function($){

  t 	 = 0;
  ticks = $('[data-ticks]');


	$(ticks).load('html/ticks.html', function(){
		var paths = $(this).find('path'),
				count, animator, starter, delay;

		if( paths ) {
			delay = t * 1000;
			count = paths.length;
			function animateIt(){
				starter = setTimeout(startIt, delay);
			}
			function startIt(){
				$(paths).each(function(index){
					var speed = index*50;
					$(this).stop().delay(speed).animate({'opacity': 1}, speed, function(){
						$(this).stop().delay(speed).animate({'opacity': 0.1}, speed);
					});
				});
			}
			animateIt();
			animator = setInterval(animateIt, (count * 150) + delay);
			t++;
		}
	});

})(jQuery);