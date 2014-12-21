/** 
 * @namespace elefart.screens['screen-about']
 * @fileoverview online documentation for the game
 */
window.elefart.screens['screen-about'] = (function () {

	var dom = elefart.dom,
	id = 'screen-about',
	panel,
	firstTime = true;

	/** 
	 * @method init about-screen
	 * @description initialize help files for the game.
	 */
	function init () {
		panel = document.getElementById(id);
		firstTime = false;
	}

	/** 
	 * @method run about-screen
	 * @description show help files for the game.
	 */
	function run () {
		if(firstTime) {
			init();
		}
	}

	//returned object
	return {
		init:init,
		run:run
	};

})();