/** @namespace */
elefart.screens['screen-install'] = (function () {
	
	var dom = elefart.dom,
		panel = document.getElementById('screen-install');
		firstRun = true;

	/** 
	 * @method run
	 * BOOK: Listing 3-20, p. 65
	 */
	function run () {
		//ADDED
		console.log("yay, we are in elefart.screens['screen-install']");
	}

	return {
		run:run //BOOK: Listing 3-20, p. 65
	};

})();