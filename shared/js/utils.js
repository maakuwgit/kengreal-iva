/*Dev Note: take this document.location snippet and externalize as a util to set the "local" value as the onset with (var?:;) syntax*/
	$(document).keypress(function(){
		if( event.which == '8224' && !$('body').hasClass('trace') ){
			$('body').addClass('trace').addComps(event);
		}else if(event.which == '8224'){
			$('body').removeClass('trace').removeComps(event);
		}else if( event.which == '8747' && !$('body').hasClass('bracketted') ){
			$(bracketees).addBrackets(event);
		}else if(event.which == '8747'){
			$(bracketees).removeBrackets(event);
		}else if(event.which == '231'){
		var polys = document.querySelectorAll('polygon,polyline');
		[].forEach.call(polys,convertPolyToPath);
		}
	});

	/*=========================[ Utils ]============================*/
	/*
	--------
	AddComps
	--------
	Adds a trace image to the body tag of a page and some css for showing/hiding, dimming or outling elements.
	Makes it much easier to align things to a provided comp
	@usage: 
	1) Add the "data-trace" attr to your body tag and set the value to the name of the image you'd like to use.
	2) You will want to add your target to one of the various CSS targets in the "Trace" section of the global.css. Options include showing/hiding, outlining and opacity dimming.
	3) Set the variable "use_trace" in this file to true
	4) Trigger the image load with Ctrl + Option/Alt + t

	@todo: Add a binding to orientation change so the portrait trace can swap
	*/
	$.fn.addComps = function(event){
		var path 		= $(this).attr('data-trace'),
				v_path 	= $(this).attr('data-trace-portrait'),
				o_path 	= $(this).attr('data-trace-overlay');

		if( path ) {
			if(window.innerHeight > window.innerWidth){
				v_path = trace_dir+v_path;
				$('body').css({'background-image':'url("'+v_path+'")', 'background-size':'cover','background-position':'center'});
			}else{
				path = trace_dir+path;
				$('body').css({'background-image':'url("'+path+'")', 'background-size':'cover','background-position':'center'});
			}
		}

		if( o_path ) {
			o_path = trace_dir+o_path;
			$('body').append('<img id="o_trace" src="'+o_path+'" alt="">');
		}
	}

	/*
	------------
	Add Brackets
	------------
	If a producer/account person asks your to "bracket" a number/date, you can do so without compromising the published code. Bracketted areas will not be carried over into a live environment
	@usage: 
	1) Add the "data-bracket" attr to a tag.
		I) If an image is being used, a string value representing the name of the image file must be given. Images will be swapped on trigger.
		II) If a bracketted image has the ability to "flip", an additional attribute "data-bracket-alt" will be used on the flipped version of the bracketted image.
	2) Set the variable "use_brackets" in this file to true
	3) Trigger the bracket/bracket image load with Ctrl + Option/Alt + b
	*/
	$.fn.addBrackets = function(event){
		//the simplest method adds a class
		$('body').addClass('bracketted');
		$('[data-brackets]').each(function(){
				$(this).html('['+$(this).html()+']');
		});
		$('[data-bracket-swap]').each(function(){
			var src = $(this)[0].src;
			$(this)[0].src = $(this).attr('data-bracket-swap');
			$(this).attr('data-bracket-swap', src);
		});
	}

	$.fn.removeComps = function(event){
		$('body').removeAttr('style');
		$('body').find('#o_trace').remove();
	}

	$.fn.removeBrackets = function(event){
		$('body').removeClass('bracketted');
		$('[data-brackets]').each(function(){
			$(this).html($(this).html().substr(1,$(this).html().length - 2));
		});
		$('[data-bracket-swap]').each(function(){
			var src = $(this)[0].src;
			$(this)[0].src = $(this).attr('data-bracket-swap');
			$(this).attr('data-bracket-swap', src);
		});
	}

	function convertPolyToPath(poly){
	  var svgNS = poly.ownerSVGElement.namespaceURI;
	  var path = document.createElementNS(svgNS,'path');
	  var points = poly.getAttribute('points').split(/\s+|,/);
	  var x0=points.shift(), y0=points.shift();
	  var pathdata = 'M'+x0+','+y0+'L'+points.join(' ');
	  if (poly.tagName=='polygon') pathdata+='z';
	  path.setAttribute('d',pathdata);
	  path.setAttribute('fill','none');
	  path.setAttribute('stroke','#FFCE02');
	  path.setAttribute('stroke-width','4');
	  path.setAttribute('stroke-miterlimit','10');
	  poly.parentNode.replaceChild(path,poly);
	}