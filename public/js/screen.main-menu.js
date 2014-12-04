/** @namespace */
elefart.screens['screen-main-menu'] = (function () {
	
	var dom = elefart.dom,
	panel = document.getElementById('screen-main-menu');

	/** 
	 * @method run
	 * BOOK: Listing 3-8, p. 52
	 */
	function run () {
		console.log("running screen-main-menu");
		
		//get the menu
		var menu = panel.getElementsByTagName('ul')[0];
		dom.bind(menu, 'click', function (e) {
			elefart.showScreen('screen-' + e.target.name);
		});
		
	}

	return {
		run:run 
	};

})();