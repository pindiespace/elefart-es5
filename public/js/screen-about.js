/** 
<<<<<<< HEAD
 * @namespace
 * @fileoverview Creates a screen which displays online documentation for the game.
 * @requires elefart
 * @requires elefart.dom
 * @version 0.1.1
 * @author Pete Markeiwicz
 * @license MIT
 */
window.elefart.screens['screen-about'] = (function () {

	var dom,
	id = 'screen-about',
	panel,
	firstTime = true;

	/** 
	 * @method init about-screen
	 * @description initialize help files for the game.
	 */
	function init () {
		dom = elefart.com;
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
=======
 * screen-game.js
 * main game functions
 */
 
elefart.screens['screen-about'] = (function () {
	
	
	function run () {
		console.log("elefart.screens['screen-about']::run()");
	}
	
	return {
		run:run
	};
	
})();
>>>>>>> 2728073dd04a850e35b61685d582a8bf409ef5a7
