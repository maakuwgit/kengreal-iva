var aID = "Z00",
	slideMap;

$(function() {
	if (touchClick == "touchstart") {
		touchClick = "touchend";
	}

	iva.config("../shared/json/detailInfo.json");
	iva.dataLoad("../shared/html/global-nav.html", 'html', 'body');

	slideMap = new Map();
	for (var pID of Object.keys(properties.detailInfo)) {
		var presentation = properties.detailInfo[pID];
		for (var slide of presentation) {
			var key = slide["arch"],
				value = {
					title : slide["title"],
					keymessage : slide["keymessage"],
					filetype : slide.hasOwnProperty("filetype") ? slide["filetype"] : "html",
					presentation : pID
				};
			slideMap.set(key, value);
		}
	}

	var bodyID = $('body').attr('id');
	if (bodyID && bodyID.length) {
		aID = bodyID;
	}

	$('.navigate').on(touchClick, function(e) {
		e.preventDefault();
		navigateToSlide($(this).data('target'));
	});
});

function navigateToSlide(arch) {
	if (slideMap.has(arch)) {
		var slide = slideMap.get(arch);
		iva.navigateToSlide({ 
			"presentation" : slide.presentation,
			"keymessage" : iva.isIOS() ? slide.keymessage + ".zip" : "../" + slide.keymessage + "/" + slide.keymessage + "." + slide.filetype
		});
	}
}