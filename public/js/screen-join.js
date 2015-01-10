/** 
 * @namespace
 * @fileoverview login system for joining multi-user elefart
 * @requires elefart
 * @requires elefart.dom
 * @version 0.1.1
 * @author Pete Markeiwicz
 * @license MIT
 */
window.elefart.screens['screen-join'] = (function () {

	var dom,
	id = 'screen-join',
	panel,
	firstTime = true;

	/** 
	 * @method init join-screen
	 * @description initialize the multi-user version of the game 
	 */
	function init () {
		dom = elefart.dom;
		panel = document.getElementById(id);
		firstTime = false;
	}

	/** 
	 * @method run join-screen
	 * @description show the form allowing remote users to join the game.
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