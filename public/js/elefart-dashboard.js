/** 
 * @namespace elefart.dashboard
 * @fileoverview elefart.dashboard Model
 * definitions for dashboard controls and HUD screens
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