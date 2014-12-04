/** @namespace */
elefart.screens['splash-screen'] = (function () {
	
	var dom = elefart.dom,
		panel = document.getElementById('splash-screen');
		firstRun = true;

	/** 
	 * @method setup
	 */
	function setup () {
		dom.bind("#splash-screen", "click", function () {
			elefart.showScreen("main-menu");
		});
	}

	/** 
	 * @method run
	 * BOOK: Listing 3-8, p. 52
	 */
	function run () {
		//ADDED
		console.log("yay, we are in elefart.screens['splash-screen']");
		if(firstRun) {
			setup();
			firstRun = false;
		}
	}

	return {
		run:run //BOOK: Listing 3-8, p. 53
	};

})();