( function($){
	
	$('[data-video]').each(function(){
    $(this).find('> a').css('background-image','url('+$(this).find('img').attr('src')+')');
    $(this).on(touchClick, function(){
      var target = $(this),
      		video  = $(this).find('video'),
      		controls = $('[data-controls]'),
      		done = $(controls).find('[data-control="done"]');

      $(done).unbind().on(touchClick, hideVideo);

      function hideVideo(event){
        $(controls).addClass('hide');
        video[0].pause();
        $(video).attr('data-playing', 'false').hide();
        video[0].currentTime = 0;
      }

      function pauseVideo(event){
        video[0].pause();
        $(video).attr('data-playing', 'false');
        $(target).unbind().on(touchClick, playVideo);
      }

      function playVideo(event){
        video[0].play();
        $(video).attr('data-playing', 'true').show();
        $(controls).removeClass('hide');
        $(target).unbind().on(touchClick, pauseVideo);
      }

      function toggleVideo(event){
        var playing = $(video).attr('data-playing');
        if( playing == 'false') {
          playVideo(event);
        }else{
        	pauseVideo(event);
        }
      }

      if ( $(video)[0] ) {
        if ( $(video).find('source').length > 0 ) {
          toggleVideo(false);
          video.off('ended').on('ended', hideVideo);
        }
      }
    });
  });

})(jQuery);