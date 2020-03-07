//Flags
var is_dev 				= false;
var local 				= ( document.location.hostname == 'localhost' ? true : false );
if( local == false ) is_dev = false;

var accordion_grp = false;
var touchClick 		= ("ontouchstart" in document.documentElement) ? "touchend": (window.navigator.pointerEnabled)? "pointerup" : "click";
var use_brackets 	= false;
var use_animate 	= true;
var use_trace 		= true;
var base 					= setBasePath('../');
var trace_dir 		= base+'trace/';
var aID,
		curr, prev, next,
		viewed, 
		seen_study,
		seen_champion_study,  
		slideMap,
		slides;

//Load the Dev Utils
if( local ) $.getScript("../shared/js/utils.js");

//Markup Shortcuts
var accordions  = $('[data-accordion]'), 
		links 			= $('button[data-href], .button[data-href], a[data-href], div[data-href]'),
		triggers 		= $('button[data-modal], a[data-modal], .th[data-modal]'),
		pdfs 				= $('button[data-pi], a[data-pi]'), 
		flipables 	= $('[data-flipable] > div > figure, [data-flipable] > div > dl'),
		footer 			= $('[data-footer]'), 
		tabbed 			= $('button.tabbed, .button.tabbed, a.th[data-tabbed-id]'),
		tabs 				= $('[data-tab]'),
		isi_list 		= $('[data-isi-list]'), 
		logo 				= $('#logo'),
		isi_link 		= $('[data-isi-link]'),
		pi_link 		= $('[data-pi-link]'),
		bracketees 	= $('[data-bracket-img],[data-brackets],[data-bracket-swap]');
	
	//Set our initial view and 'seen study designs modal' variables
	if (typeof (Storage) !== 'undefined' ) {
    try{
      viewed 							= sessionStorage.getItem('has_viewed');
      seen_study 					= sessionStorage.getItem('seen_study');
      seen_champion_study = sessionStorage.getItem('seen_champion_study');
      if ( !viewed ) {
      	sessionStorage.setItem('has_viewed', true);
      	$('body').addClass('first_view');
      }
      if ( !seen_study ) {
      	sessionStorage.setItem('seen_study', false);
      	seen_study = false;
      }
      if ( !seen_champion_study ) {
      	seen_champion_study = false;
      	sessionStorage.setItem('seen_champion_study', false);
      }
    }catch(e) {
      // private browsing mode could throw an QuotaExceededError: DOM Exception 22
      if(is_dev) console.log('sessionStorage exception handled - ' + e.message);
    }
  }

( function ( $ ) {
	setBasePath();
	//Bindings
	/*-------------------[ programTabs ]-------------------------*/
	function programTabs(event){
		$(tabbed).on(touchClick, activateTab);

	  $(accordions).each( function(){
	  	$(this).attr('data-accordion-from', $(this).css('height'));
	  	$(this).find('.title').on(touchClick, openAccordion);
	  });
	}

	function bindButtons(event){
		reflow();

		links.each(function(){
			$(this).unbind().on(touchClick, function(){
				navigateToSlide($(this).attr('data-href'));
			});
		});

		//PDFs
		$(pdfs).unbind().on(touchClick, openPI);
	}

	//Parse the detailInfo JSON and setup the slidemap
	function setSlidemap(event){
		iva.config(base+'shared/json/detailInfo.json');

		mainPresentation = properties.detailInfo['presentation'];

		slideMap = new Map();
		
		slides = properties.detailInfo['slides'];
		for (i = 0; i < slides.length; i++) {
			var slide = slides[i],
				key = slide["arch"],
				value = {
					title : slide["title"],
					keymessage : slide["keymessage"],
					filetype : slide.hasOwnProperty("filetype") ? slide["filetype"] : "html",
					presentation : mainPresentation
				};
			slideMap.set(key, value);
		}
		var hiddenpresentations = properties.detailInfo['hiddenpresentations'];
		if ( hiddenpresentations ){
			for (i = 0; i < hiddenpresentations.length; i++) {
				var hiddenpresentation = hiddenpresentations[i],
					presentation = hiddenpresentation['presentation'];
				for (j = 0; j < hiddenpresentation['slides'].length; j++) {
					var slide = hiddenpresentation['slides'][j],
						key = slide["arch"],
						value = {
							title : slide["title"],
							keymessage : slide["keymessage"],
							filetype : slide.hasOwnProperty("filetype") ? slide["filetype"] : "html",
							presentation : presentation
						};
					slideMap.set(key, value);
				}
			}
		}

		var slideMapKeys = slideMap.keys();
		var slideArray = new Array();
		for (var key of slideMapKeys) {
			slideArray.push(key);
		}

		next = (slideArray.indexOf(aID) + 1 > slideArray.length) ? slideArray[0] : slideArray[slideArray.indexOf(aID) + 1];
		prev = (slideArray.indexOf(aID) - 1 > 0) ? slideArray[slideArray.indexOf(aID) - 1] : slideArray[0];
		
		if (typeof (Storage) !== 'undefined' ) {
	    try{
	      sessionStorage.setItem('currentSlide', curr);
	      sessionStorage.setItem('previousSlide', prev);
	      sessionStorage.setItem('nextSlide', next);
	    }catch(e) {
	      // private browsing mode could throw an QuotaExceededError: DOM Exception 22
	      if(is_dev) console.log('sessionStorage exception handled - ' + e.message);
	    }
	  }
	}

	//Initiation
	function init(event){
		curr = $('body').attr('id');
		if (curr && curr.length) {
			aID = curr;
		}

		//Wrapper function for the global-nav
		function loadTopnav(){
			$('[data-topnav]').load(base+'shared/html/global-nav.html', function(event){
				bindButtons(event);
		    $(logo).on(touchClick, function(event){
	        event.stopPropagation();
	        $('body').toggleClass('global');
		    });
		  });
		}

		//Attach global elements
		$('#modals').load(base+'shared/html/modals.html', function(){
			$('a.close-reveal-modal').on(touchClick, closeReveal);
			if( $('[data-chart-nav]').length <= 0 ) checkSeen();
		});

		if( $('[data-logo]').length > 0 ) {
			$('[data-logo]').load(base+'shared/html/logo.html', function(){
				loadTopnav();
			});
		}else{
			loadTopnav();
		}

		if( $('[data-zoom]') ) {
			$('body').append('<div id="zooms"></div>');

			$('[data-zoom]').each( function(){
				$('#zooms').append($(this).clone());
				$('#zooms').find('figure').removeClass('relative');
				$('#zooms').find('.open-zoom').remove();
				$(this).find('.open-zoom').on(touchClick, zoomIn);
				$(this).find('.close-zoom').remove();
			});

			$('#zooms').find('.close-zoom').on(touchClick, zoomOut);
		}


		$('[data-isi]').load(base+'shared/html/isi.html', function(){
			$('[data-isi-list] li').each(function() {
				if ($(this).hasClass($('body').attr('id'))) {
					$(this).show();
				}
			});
			bindButtons();
		});

		//Footer (Nursing track only)
		$('[data-footer-nursing]').load(base+'shared/html/footer-nursing.html', bindButtons);

		//Footer, including the timeline
		$(footer).load(base+'shared/html/footer.html', function(){
			$('[data-timeline]').load(base+'shared/html/timeline.html', bindButtons);
		});

		//Charts
		$('[data-chart]').not('[data-chart="none"]').load('html/chart.html');

		//Load chart's modal window triggers
		if( $('[data-chart-nav]').length > 0 ){
			$('[data-chart-nav]').load(base+'shared/html/chart-nav.html', function(){
				$(this).find('[data-modal]').unbind().on(touchClick, openReveal);
				checkSeen();
			});
		}

		//Modal Overlays
		$(triggers).unbind().on(touchClick, openReveal);
		$('.reveal-modal-bg').unbind().on(touchClick, closeReveal);

		//Flipable imagery
		$(flipables).unbind().on(touchClick, flipIt);
		
		//All our click stuff
		bindButtons(event);

		//Tabs
		programTabs(event);

		//Now we're ready, add all the slides info in and setup that object
		setSlidemap(event);

		if (local) {
			$("body").swipe( {
				swipe:function(event, direction, distance, duration, fingerCount, fingerData) {
					if (direction == "right") {
						navigateToSlide(prev);
					}
					else if (direction == "left") {
						navigateToSlide(next);
					}
				},
				fingerCount: 1,
				threshold: 100
			});
		} else {
			$("body").swipe( {
				swipe:function(event, direction, distance, duration, fingerCount, fingerData) {
					if (direction == "right") {
						iva.navigatePrevious();
					}
					else if (direction == "left") {
						iva.navigateNext();
					}
				},
				fingerCount: 1,
				threshold: 80
			});
		}

		if( use_animate ){
			var animateTimer = setTimeout(animateStage, 300);
		}else{
			$('body').addClass('immediate');
		}

		function animateStage(i){
			$('body').addClass('animate');
			$('.content.active > ul[data-step-animated],.tabbed-content.active > ul[data-step-animated]').children().each(stepAnimate);
		}
	}

	$(document).ready(init);

})( jQuery );

/*==============[ Animation ]===============*/
function stepAnimate(index){
	var wait = index * 150;
	$(this).delay(wait).animate({'opacity':1}, 300, function(){
		$(this).removeClass('transparent').removeAttr('style');
	});
}

function pathPrepare (element) {
	var lineLength = element[0].getTotalLength();
	element.css({'stroke-dasharray':lineLength,
							 'stroke-dashoffset':lineLength});
}

/*=========[ Button Interactions ]=========*/
var navigateToSlide = function(arch) {
	if (slideMap.has(arch)) {
		var slide = slideMap.get(arch);
		iva.navigateToSlide({ "presentation" : slide.presentation, "keymessage" : iva.isIOS() ? slide.keymessage + ".zip" : "../" + slide.keymessage + "/" + slide.keymessage + "." + slide.filetype});
	}
}

/*=========[ Smart Objects ]=========*/
//Flipable Imagery
function flipIt(event){
	if( !$(event.target).parents('nav').length ){
		var target = $(this).parents('[data-flipable]');
		$(target).toggleClass('back');
	}
}

/* Reveal */
function openReveal(event){
	$('.reveal-modal-bg').show().animate({'opacity': 1}, 150);
	var target = $(this).attr('data-modal');

	if( $(target) ){
		var reveal = $('#'+target+'[data-reveal]');
		$(reveal).attr('data-modal-active', 'true').show().animate({'opacity': 1}, 300);
	}
}
function closeReveal(event){
	var modal = $(this).parents('[data-reveal]').attr('id');
	if( modal == 'modal-study_design' ) $('body').addClass('seen_study');
	if( modal == 'modal-champion_study_design' ) $('body').addClass('seen_champion_study');
	$('.reveal-modal-bg').animate({'opacity': 0}, 150);
	$('[data-modal-active]').animate({'opacity': 0}, 300, function(){
		$(this).removeAttr('style data-modal-active');
		$('.reveal-modal-bg').removeAttr('style');
	});
}

/* Zoom */
function zoomIn(event){
	var target = $('#zooms').find('[data-zoom="'+$(this).parents('figure').attr('data-zoom')+'"]');
	$('#zooms').addClass('zoomed');
	$(target).addClass('zoomed');
}

function zoomOut(event){
	var target = $('#zooms').find('[data-zoom="'+$(this).parents('figure').attr('data-zoom')+'"]');
	$('#zooms').removeClass('zoomed');
	$(target).removeClass('zoomed');
}

/* Accordion */
$.fn.toggleAccordion = function(show_it){
	if( show_it == true ){
  	$(this).stop().animate({'height': $(this).attr('data-accordion-to')}, 300, function(){
			$(this).addClass('active');
  	});
	}else{
  	$(this).stop().animate({'height': $(this).attr('data-accordion-from')}, 200, function(){
			$(this).removeClass('active').removeAttr('height');
  	});
  }
}

function openAccordion(event){
	$(this).unbind().on(touchClick, closeAccordion);

	if( accordion_grp ) {
		$(accordions).each(function(){
			if(!$(this).hasClass('active')){
	  		$(this).toggleAccordion(true);
				$(this).find('title').unbind().on(touchClick, closeAccordion);
	  	}
		});
	}

	$(this).parent().toggleAccordion(true);
}

function closeAccordion(event){
	$(this).unbind().on(touchClick, openAccordion);
	$(this).parent().toggleAccordion(false);

	if( accordion_grp ) {
		$(accordions).each(function(){
	  		$(this).toggleAccordion(false);
				$(this).find('title').unbind().on(touchClick, openAccordion);
		});
	}
}

/* PDF */
function openPI(event){
	var path = '';
	if(local) path = '../';
	window.location = path + 'shared/pdf/KNG-CV-KENGREAL-Global_PI.pdf';
	$('body').removeClass('global');
}

/* Tab */
function activateTab(event){
	var target = $(this).attr('data-tab-id');
	target = $('[data-tab="'+target+'"]');

	$(tabbed).find('.content').removeClass('active');
	$(tabbed).removeClass('active');
	$(this).addClass('active');
	$(tabs).addClass('hide').removeClass('active');
	$(target).removeClass('hide').addClass('active');
	if( $(target).find('.content') ) {
		setTimeout(function(){
			$(target).find('.content').addClass('active');
		}, 100);
	}
}

/* Utils */
function setBasePath(path){
	if( $('body').attr('data-base') ) {
		return $('body').attr('data-base');
	}else if(path){
		return path;
	}else{
		return '';
	}
}

function reflow(){
	links = $('button[data-href], .button[data-href], a[data-href], div[data-href]');
	pdfs 	= $('button[data-pi], a[data-pi]');
	logo  = $('#logo');
}

function checkSeen(initial){
	if( $('[data-on-unseen="study"]').length > 0 ) {
		if( seen_study == 'false' || seen_study == false ) {
			$('[data-on-unseen="study"]').trigger(touchClick);
		}else{
			$('body').addClass('seen_study');
		}
		seen_study = true;
		sessionStorage.setItem('seen_study', seen_study);
	}
	if( $('[data-on-unseen="champion_study"]').length > 0 ) {
	 	if( seen_champion_study == 'false' || seen_champion_study == false ) {
			$('[data-on-unseen="champion_study"]').trigger(touchClick);
		}else{
			$('body').addClass('seen_champion_study');
		}
		seen_champion_study = true;
		sessionStorage.setItem('seen_champion_study', seen_champion_study);
	}
}