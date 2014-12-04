/** @namespace */
elefart.screens['install-screen'] = (function () {
	
	var dom = elefart.dom,
		firstRun = true;

	/** 
	 * @method run
	 * BOOK: Listing 3-20, p. 65
	 */
	function run () {
		//ADDED
		console.log("yay, we are in elefart.screens['install-screen']");
	}

	return {
		run:run //BOOK: Listing 3-20, p. 65
	};

})();