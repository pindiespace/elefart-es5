/** 
 * @namespace elefart.dashboard
 * @fileoverview elefart.dashboard provides definitions for dashboard controls and HUD screens 
 * used by the application. Equivalent to elefart.building for game objects. Generic objects are 
 * created in elefart.factory.
 * @requires elefart
 * @requires elefart.building
 * @requires elefart.display
 * @requires elefart.controller
 * @version 0.1.1
 * @author Pete Markeiwicz
 * @license MIT
 */
window.elefart.dashboard = (function () {

	var building,
	display,
	controller,
	firstTime = true;

	/** 
	 * @method init dashboard
	 * @description initialize user controls for the game on the canvas.
	 */
	function init () {
		board = elefart.building,
		display = elefart.display,
		controller = elefart.controller;
		firstTime = false;
	}

	/** 
	 * @method run dashboard
	 * @description enable user controls during the active game.
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