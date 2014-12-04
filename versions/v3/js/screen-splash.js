/** @namespace */
elefart.screens['screen-splash'] = (function () {
	
	var dom = elefart.dom,
		$ = dom.$,
		panel = document.getElementById('screen-splash');
		firstRun = true;

	/** 
	 * @method setup
	 */
	function setup () {
		dom.bind("#screen-splash", "click", function () {
			elefart.showScreen("screen-main-menu");
		});
	}

	/** 
	 * @method run
	 * BOOK: Listing 3-8, p. 52
	 */
	function run () {
		//ADDED
		console.log("yay, we are in elefart.screens['screen-splash']");
		if(firstRun) {
			setup();
			firstRun = false;
		}
	}

	return {
		run:run //BOOK: Listing 3-8, p. 53
	};

})();