( function ( $ ) {

	//Initiation
	function init(event){
		//Attach global elements
		$('[data-patient-disclaimer]').load('../shared/html/patient-disclaimer.html');
		$('[data-background]').each(function(){
			var img = $(this).find('img')
			$(this).css({'background-image':'url('+$(this).attr('data-background')+')',
									 'height':$(img).height()});
			$(img).remove();
		});
	}

	$(document).ready(init);

})( jQuery );