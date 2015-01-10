/** 
 * @namespace
 * @fileoverview quit screen (a dialog) for the game.
 * @requires elefart
 * @requires elefart.dom
 * @version 0.1.1
 * @author Pete Markeiwicz
 * @license MIT
 */
window.elefart.screens['screen-exit'] = (function () {

	var dom,
	id = 'screen-exit',
	panel,
	firstTime = true;

	/** 
	 * @method init exit-screen
	 * @description initialize the exit dialog for the game.
	 */
	function init () {
		dom = elefart.dom;
		panel = document.getElementById(id);
		firstTime = false;
	}

	/** 
	 * @method run exit-screen
	 * @description show the exit dialog for the game.
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